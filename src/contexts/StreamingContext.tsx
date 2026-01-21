/**
 * StreamingContext - Global streaming state management
 * 
 * Maintains streaming state across component unmounts.
 * Ensures StreamingControl and StreamingDashboard share the same state.
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { StreamBroadcaster, StreamViewer, generateStreamURL } from '../adapters/media/webrtc-adapter';
import { streamingPersistence } from '../adapters/streaming/streaming-persistence';
import { streamingAnalytics } from '../adapters/streaming/streaming-analytics';
import { DEFAULT_STREAM_QUALITY } from '../domain/streaming/types';

interface StreamingContextType {
  // State
  isStreaming: boolean;
  streamKey: string;
  viewerCount: number;
  error: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // Actions
  startBroadcast: () => Promise<void>;
  stopBroadcast: () => void;
  joinStream: (streamKey: string) => Promise<void>;
  leaveStream: () => void;
  getStreamURL: () => string | null;
  broadcastData: (data: any) => void;
  clearError: () => void;
}

const StreamingContext = createContext<StreamingContextType | null>(null);

export function StreamingProvider({ children }: { children: ReactNode }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState<string>('');
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string>('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const broadcasterRef = useRef<StreamBroadcaster | null>(null);
  const viewerRef = useRef<StreamViewer | null>(null);

  // Restore persisted streaming state on mount
  useEffect(() => {
    const persisted = streamingPersistence.load();
    if (persisted && persisted.streamKey) {
      console.log('📦 Restored streaming state:', persisted);
      setStreamKey(persisted.streamKey);
      setViewerCount(persisted.viewerCount || 0);
      // Note: We don't auto-restart the stream, just restore the state
    }
  }, []);

  // Start broadcasting
  const startBroadcast = useCallback(async () => {
    try {
      setError('');

      const broadcaster = new StreamBroadcaster(
        (viewerId) => {
          setViewerCount((prev) => {
            const newCount = prev + 1;
            streamingAnalytics.trackViewerJoin(viewerId);
            streamingAnalytics.updateViewerCount(newCount);
            
            // Persist updated viewer count
            const currentStreamKey = broadcasterRef.current?.getStats().peerId || '';
            if (currentStreamKey) {
              streamingPersistence.save({
                status: 'active',
                streamKey: currentStreamKey,
                viewerCount: newCount,
                startedAt: Date.now(),
                lastError: null,
                quality: DEFAULT_STREAM_QUALITY,
                selectedCamera: null,
              });
            }
            
            return newCount;
          });
        },
        (viewerId) => {
          setViewerCount((prev) => {
            const newCount = Math.max(0, prev - 1);
            streamingAnalytics.trackViewerLeave(viewerId);
            streamingAnalytics.updateViewerCount(newCount);
            
            // Persist updated viewer count
            const currentStreamKey = broadcasterRef.current?.getStats().peerId || '';
            if (currentStreamKey) {
              streamingPersistence.save({
                status: 'active',
                streamKey: currentStreamKey,
                viewerCount: newCount,
                startedAt: Date.now(),
                lastError: null,
                quality: DEFAULT_STREAM_QUALITY,
                selectedCamera: null,
              });
            }
            
            return newCount;
          });
        }
      );

      const key = await broadcaster.startBroadcast();
      const stream = broadcaster.getLocalStream();
      
      broadcasterRef.current = broadcaster;
      setLocalStream(stream);
      setIsStreaming(true);
      setStreamKey(key);

      // Persist stream state
      streamingPersistence.save({
        status: 'active',
        streamKey: key,
        viewerCount: 0,
        startedAt: Date.now(),
        lastError: null,
        quality: DEFAULT_STREAM_QUALITY,
        selectedCamera: null,
      });

      streamingAnalytics.startSession(`${DEFAULT_STREAM_QUALITY.width}x${DEFAULT_STREAM_QUALITY.height}`);

      console.log('🎉 Broadcast started:', key);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto durante l\'avvio dello streaming';
      setError(errorMessage);
      console.error('❌ Errore start broadcast:', err);
    }
  }, []);

  // Stop broadcasting
  const stopBroadcast = useCallback(() => {
    if (broadcasterRef.current) {
      const stats = broadcasterRef.current.getStats();
      broadcasterRef.current.stopBroadcast();
      broadcasterRef.current = null;
      
      setIsStreaming(false);
      setLocalStream(null);
      setViewerCount(0);
      
      streamingPersistence.clear();
      streamingAnalytics.endSession();
      
      console.log('🛑 Broadcast stopped:', stats.peerId);
    }
  }, []);

  // Join stream as viewer
  const joinStream = useCallback(async (key: string) => {
    try {
      setError('');

      const viewer = new StreamViewer(
        (stream) => {
          setRemoteStream(stream);
          console.log('📺 Stream ricevuto');
        },
        (data) => {
          console.log('📦 Data ricevuto:', data);
        },
        () => {
          console.log('🔌 Disconnesso');
          setRemoteStream(null);
        },
        (err) => {
          const errorMessage = err.message || 'Errore connessione';
          setError(errorMessage);
          console.error('❌ Errore viewer:', err);
        }
      );

      await viewer.connectToStream(key);

      viewerRef.current = viewer;
      setStreamKey(key);

      console.log('👀 Joined stream:', key);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante la connessione allo streaming';
      setError(errorMessage);
      console.error('❌ Errore join stream:', err);
    }
  }, []);

  // Leave stream as viewer
  const leaveStream = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.disconnect();
      viewerRef.current = null;
      setRemoteStream(null);
      console.log('👋 Left stream');
    }
  }, []);

  // Get shareable stream URL
  const getStreamURL = useCallback((): string | null => {
    if (!streamKey) return null;
    return generateStreamURL(streamKey);
  }, [streamKey]);

  // Broadcast data to viewers
  const broadcastData = useCallback((data: any) => {
    if (broadcasterRef.current) {
      broadcasterRef.current.broadcast(data);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Cleanup on unmount - NO dependencies to avoid infinite loop
  useEffect(() => {
    return () => {
      // Cleanup refs directly without dependencies
      if (broadcasterRef.current) {
        broadcasterRef.current.stopBroadcast();
        broadcasterRef.current = null;
      }
      if (viewerRef.current) {
        viewerRef.current.disconnect();
        viewerRef.current = null;
      }
    };
  }, []); // Empty deps - only runs on mount/unmount

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<StreamingContextType>(() => ({
    isStreaming,
    streamKey,
    viewerCount,
    error,
    localStream,
    remoteStream,
    startBroadcast,
    stopBroadcast,
    joinStream,
    leaveStream,
    getStreamURL,
    broadcastData,
    clearError,
  }), [
    isStreaming,
    streamKey,
    viewerCount,
    error,
    localStream,
    remoteStream,
    startBroadcast,
    stopBroadcast,
    joinStream,
    leaveStream,
    getStreamURL,
    broadcastData,
    clearError,
  ]);

  return (
    <StreamingContext.Provider value={value}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreamingContext() {
  const context = useContext(StreamingContext);
  if (!context) {
    throw new Error('useStreamingContext must be used within StreamingProvider');
  }
  return context;
}
