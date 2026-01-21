/**
 * WebRTC P2P Streaming Adapter - Serverless Implementation
 * 
 * Uses PeerJS for WebRTC peer-to-peer connections.
 * NO server costs - only browser-to-browser communication.
 * 
 * Architecture:
 * - Broadcaster: Gets camera, creates Peer with unique ID
 * - Viewers: Connect to broadcaster's ID, receive stream
 * - PeerJS Cloud: Free signaling server (only metadata, not video)
 */

import Peer, { type DataConnection, type MediaConnection } from 'peerjs';

export interface StreamConfig {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export interface PeerStats {
  peerId: string;
  connectedViewers: number;
  bitrate: number; // kbps
}

/**
 * Broadcaster - Camera owner who streams to viewers
 */
export class StreamBroadcaster {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private connections: MediaConnection[] = [];
  private dataConnections: DataConnection[] = [];
  private statsInterval: number | null = null;
  private onViewerJoined: (viewerId: string) => void;
  private onViewerLeft: (viewerId: string) => void;
  private onError: (error: Error) => void;

  constructor(
    onViewerJoined: (viewerId: string) => void = () => {},
    onViewerLeft: (viewerId: string) => void = () => {},
    onError: (error: Error) => void = console.error
  ) {
    this.onViewerJoined = onViewerJoined;
    this.onViewerLeft = onViewerLeft;
    this.onError = onError;
  }

  /**
   * Start broadcasting with camera
   * @returns Unique stream key for viewers to connect
   */
  async startBroadcast(config: StreamConfig = { video: true, audio: false }): Promise<string> {
    try {
      const iceServers = [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        { urls: 'stun:global.stun.twilio.com:3478' },
      ];

      // 1. Crea peer PRIMA di getUserMedia
      const streamKey = `subbuteo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      this.peer = new Peer(streamKey, {
        debug: 2,
        config: { iceServers }
      });

      // Wait for peer to connect to signaling server (con timeout)
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout connessione al server PeerJS. Riprova tra qualche secondo.'));
        }, 10000);
        this.peer!.on('open', () => {
          clearTimeout(timeout);
          resolve();
        });
        this.peer!.on('error', (err) => {
          clearTimeout(timeout);
          let message = 'Errore connessione streaming';
          if (err.type === 'network') message = 'Errore di rete. Controlla la connessione internet.';
          else if (err.type === 'peer-unavailable') message = 'Stream non disponibile. Verifica il link.';
          else if (err.type === 'server-error') message = 'Server temporaneamente non disponibile. Riprova tra poco.';
          reject(new Error(message));
        });
      });

      // 2. Ottieni la camera SOLO video
      console.log('📹 Richiesta accesso camera (solo video)...');
      this.localStream = await navigator.mediaDevices.getUserMedia(config);
      console.log('✅ Camera ottenuta');

      // Handle incoming viewer connections
      this.peer.on('call', (call) => {
        console.log('📞 Chiamata in arrivo da viewer:', call.peer);
        if (!this.localStream) {
          console.error('❌ Local stream non disponibile!');
          return;
        }

        const localStream = this.localStream;
        setTimeout(() => {
          // Log dettagliato sulle tracce video prima di answer
          if (localStream) {
            localStream.getTracks().forEach(track => {
              console.log('[BROADCASTER] Track prima di answer:', track.kind, 'enabled:', track.enabled, 'readyState:', track.readyState);
            });
          }
          console.log('📤 Rispondo con stream (DELAYED). Tracks:', localStream ? localStream.getTracks().length : 0);
          call.answer(localStream ?? undefined);

          // Log dettagliato sulle tracce video dopo answer
          if (localStream) {
            localStream.getTracks().forEach(track => {
              console.log('[BROADCASTER] Track dopo answer:', track.kind, 'enabled:', track.enabled, 'readyState:', track.readyState);
            });
          }

          // LOG AVANZATO: eventi MediaConnection (ICE, stato, candidate, errori, chiusure)
          if (call.peerConnection) {
            const pc = call.peerConnection;
            pc.addEventListener('iceconnectionstatechange', () => {
              console.log('[BROADCASTER] ICE state:', pc.iceConnectionState);
            });
            pc.addEventListener('icegatheringstatechange', () => {
              console.log('[BROADCASTER] ICE gathering state:', pc.iceGatheringState);
            });
            pc.addEventListener('signalingstatechange', () => {
              console.log('[BROADCASTER] signaling state:', pc.signalingState);
            });
            pc.addEventListener('connectionstatechange', () => {
              console.log('[BROADCASTER] connection state:', pc.connectionState);
            });
            pc.addEventListener('track', (event) => {
              console.log('[BROADCASTER] track event:', event.track.kind, event.track.id, event.track.readyState);
            });
            pc.addEventListener('icecandidate', (event) => {
              if (event.candidate) {
                console.log('[BROADCASTER] ICE candidate:', event.candidate.candidate);
              } else {
                console.log('[BROADCASTER] ICE candidate: null (end of candidates)');
              }
            });
          } else {
            console.warn('[BROADCASTER] peerConnection non disponibile su call (dopo answer)');
          }
        }, 300); // workaround PeerJS bug
        this.connections.push(call);
        this.onViewerJoined(call.peer);

        call.on('stream', (stream) => {
          console.log('📥 Ricevuto stream da viewer (dovrebbe essere vuoto):', stream.getTracks().length);
        });

        call.on('close', () => {
          console.log('📴 Viewer disconnesso:', call.peer);
          this.connections = this.connections.filter((c) => c !== call);
          this.onViewerLeft(call.peer);
        });

        call.on('error', (err) => {
          console.error('❌ Errore call con viewer:', err);
        });
      });

      // Handle data connections (for chat, metadata)
      this.peer.on('connection', (conn) => {
        console.log('📡 Data connection da:', conn.peer);
        this.dataConnections.push(conn);
        
        conn.on('data', (data) => {
          // Forward metadata to all viewers (e.g., score updates)
          this.broadcast(data);
        });

        conn.on('close', () => {
          this.dataConnections = this.dataConnections.filter((c) => c !== conn);
        });
      });

      // Start stats monitoring
      console.log('🎉 Streaming avviato con successo. Stream key:', streamKey);
      console.log('📡 Broadcaster in ascolto per viewer connections...');
      return streamKey;
    } catch (error) {
      console.error('❌ Errore avvio streaming:', error);
      
      // Cleanup on error
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      
      // Improve error messages
      let userMessage = 'Errore avvio streaming';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          userMessage = 'Permesso camera negato. Abilita la camera nelle impostazioni del browser.';
        } else if (error.name === 'NotFoundError') {
          userMessage = 'Nessuna camera trovata. Collega una webcam.';
        } else if (error.message.includes('Timeout')) {
          userMessage = error.message;
        } else {
          userMessage = error.message;
        }
      }
      
      const wrappedError = new Error(userMessage);
      this.onError(wrappedError);
      throw wrappedError;
    }
  }

  /**
   * Send data to all connected viewers
   */
  broadcast(data: unknown): void {
    this.dataConnections.forEach((conn) => {
      if (conn.open) {
        conn.send(data);
      }
    });
  }

  /**
   * Get current streaming stats
   */
  getStats(): PeerStats {
    return {
      peerId: this.peer?.id || '',
      connectedViewers: this.connections.length,
      bitrate: 0, // Calculated in stats monitoring
    };
  }

  /**
   * Stop broadcasting and cleanup
   */
  stopBroadcast(): void {
    // Stop stats monitoring
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    // Close all connections
    this.connections.forEach((call) => call.close());
    this.dataConnections.forEach((conn) => conn.close());
    this.connections = [];
    this.dataConnections = [];

    // Stop camera
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Disconnect peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  /**
   * Get local stream (for preview)
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}

/**
 * Viewer - Receives stream from broadcaster
 */
export class StreamViewer {
  private peer: Peer | null = null;
  private call: MediaConnection | null = null;
  private dataConnection: DataConnection | null = null;
  private remoteStream: MediaStream | null = null;
  private onStreamReceived: (stream: MediaStream) => void;
  private onDataReceived: (data: unknown) => void;
  private onDisconnected: () => void;
  private onError: (error: Error) => void;

  constructor(
    onStreamReceived: (stream: MediaStream) => void = () => {},
    onDataReceived: (data: unknown) => void = () => {},
    onDisconnected: () => void = () => {},
    onError: (error: Error) => void = console.error
  ) {
    this.onStreamReceived = onStreamReceived;
    this.onDataReceived = onDataReceived;
    this.onDisconnected = onDisconnected;
    this.onError = onError;
  }

  /**
   * Connect to broadcaster's stream
   * @param streamKey - Unique ID from broadcaster
   */
  async connectToStream(streamKey: string): Promise<void> {
    try {
      console.log('👀 Tentativo connessione a stream:', streamKey);

      const iceServers = [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        { urls: 'stun:global.stun.twilio.com:3478' },
      ];
      
      // Create peer (viewer gets random ID)
      this.peer = new Peer({
        debug: 2,
        config: {
          iceServers
        }
      });

      // Wait for peer to connect (with timeout)
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout connessione al server PeerJS. Riprova.'));
        }, 10000);

        this.peer!.on('open', (id) => {
          clearTimeout(timeout);
          console.log('✅ Viewer peer connesso con ID:', id);
          resolve();
        });
        
        this.peer!.on('error', (err) => {
          clearTimeout(timeout);
          console.error('❌ Errore peer viewer:', err);
          reject(err);
        });
      });

      console.log('📞 Chiamata broadcaster:', streamKey);
      
      // Connect to broadcaster's stream
      this.call = this.peer.call(streamKey, new MediaStream()); // Empty stream (viewer doesn't send)

      if (!this.call) {
        throw new Error('Impossibile chiamare il broadcaster. Stream non trovato.');
      }

      // Setup event handlers FIRST (before waiting)
      const streamTimeout = setTimeout(() => {
        console.error('⏱️ Timeout! Stream non ricevuto in 15 secondi');
      }, 15000);

      // Receive remote stream - setup handler immediately
      this.call.on('stream', (stream) => {
        clearTimeout(streamTimeout);
        console.log('🎉 Stream ricevuto! Tracks:', stream.getTracks().length);
        stream.getTracks().forEach(track => {
          console.log('  Track:', track.kind, track.id, 'enabled:', track.enabled, 'readyState:', track.readyState);
        });
        this.remoteStream = stream;
        this.onStreamReceived(stream);

        // DEBUG: crea video HTML forzato
        try {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.autoplay = true;
          video.controls = true;
          video.style.position = 'fixed';
          video.style.bottom = '10px';
          video.style.right = '10px';
          video.style.zIndex = '9999';
          video.style.width = '320px';
          video.style.background = '#000';
          document.body.appendChild(video);
          console.log('✅ Video HTML di debug aggiunto al DOM');
        } catch (e) {
          console.error('❌ Errore creazione video debug:', e);
        }
      });

      this.call.on('error', (err) => {
        clearTimeout(streamTimeout);
        console.error('❌ Errore call:', err);
        this.onError(err);
      });

      this.call.on('close', () => {
        clearTimeout(streamTimeout);
        console.log('📴 Call chiusa');
        this.disconnect();
        this.onDisconnected();
      });

      // Connect data channel
      this.dataConnection = this.peer.connect(streamKey);

      this.dataConnection.on('open', () => {
        console.log('📡 Data channel aperto');
      });

      this.dataConnection.on('data', (data) => {
        this.onDataReceived(data);
      });

      this.dataConnection.on('close', () => {
        console.log('📴 Data channel chiuso');
        this.disconnect();
      });

      // LOG AVANZATO: tutti gli eventi PeerJS lato viewer
      this.peer.on('disconnected', () => console.warn('PeerJS: disconnected'));
      this.peer.on('close', () => console.warn('PeerJS: close'));
      this.peer.on('error', (err) => console.error('PeerJS: error', err));
      this.peer.on('connection', (conn) => console.log('PeerJS: connection', conn));
      this.peer.on('call', (call) => console.log('PeerJS: call', call));
      this.peer.on('open', (id) => console.log('PeerJS: open', id));

      console.log('✅ Connessione completata');
    } catch (error) {
      console.error('❌ Errore connectToStream:', error);
      this.onError(error as Error);
      throw error;
    }
  }

  /**
   * Send data to broadcaster
   */
  send(data: unknown): void {
    if (this.dataConnection?.open) {
      this.dataConnection.send(data);
    }
  }

  /**
   * Disconnect from stream
   */
  disconnect(): void {
    if (this.call) {
      this.call.close();
      this.call = null;
    }

    if (this.dataConnection) {
      this.dataConnection.close();
      this.dataConnection = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.remoteStream = null;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}

/**
 * Check browser support for WebRTC
 */
export function isBrowserSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window.RTCPeerConnection !== 'undefined'
  );
}

/**
 * Get available camera devices
 */
export async function getCameraDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === 'videoinput');
}

/**
 * Generate shareable stream URL
 */
export function generateStreamURL(
  streamKey: string,
  baseURL: string = window.location.origin
): string {
  const basePath = import.meta.env.BASE_URL || '/';
  const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return `${baseURL}${normalizedBase}#/watch/${streamKey}`;
}
