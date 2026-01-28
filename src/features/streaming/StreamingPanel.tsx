/**
 * StreamingPanel - Broadcaster UI for starting/stopping stream
 * 
 * Features:
 * - Camera preview
 * - Start/stop broadcasting
 * - Viewer count
 * - Shareable link with QR code
 * - Connection status
 */

import { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Users, Copy, Check } from 'lucide-react';
import { StreamBroadcaster, isBrowserSupported, generateStreamURL, getCameraDevices } from '../../adapters/media/webrtc-adapter';

interface StreamingPanelProps {
  matchId?: string;
  onStreamStart?: (streamKey: string) => void;
  onStreamStop?: () => void;
}

export function StreamingPanel({ onStreamStart, onStreamStop }: StreamingPanelProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState<string>('');
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);

  const broadcasterRef = useRef<StreamBroadcaster | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check browser support
    setIsSupported(isBrowserSupported());

    // Get available cameras
    getCameraDevices().then(setCameras);

    return () => {
      // Cleanup on unmount
      if (broadcasterRef.current) {
        broadcasterRef.current.stopBroadcast();
      }
    };
  }, []);

  const handleStartStream = async () => {
    try {
      setError('');

      // Create broadcaster
      const broadcaster = new StreamBroadcaster(
        (viewerId) => {
          console.log('Viewer joined:', viewerId);
          setViewerCount((prev) => prev + 1);
        },
        (viewerId) => {
          console.log('Viewer left:', viewerId);
          setViewerCount((prev) => Math.max(0, prev - 1));
        },
        (err) => {
          setError(err.message);
          handleStopStream();
        }
      );

      // Start broadcast with selected camera
      const key = await broadcaster.startBroadcast({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: true,
      });

      // Show local preview
      const localStream = broadcaster.getLocalStream();
      if (videoRef.current && localStream) {
        videoRef.current.srcObject = localStream;
      }

      broadcasterRef.current = broadcaster;
      setStreamKey(key);
      setIsStreaming(true);
      onStreamStart?.(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore avvio streaming');
    }
  };

  const handleStopStream = () => {
    if (broadcasterRef.current) {
      broadcasterRef.current.stopBroadcast();
      broadcasterRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setStreamKey('');
    setViewerCount(0);
    onStreamStop?.();
  };

  const handleCopyLink = async () => {
    const url = generateStreamURL(streamKey);
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">
          Il tuo browser non supporta lo streaming. Usa Chrome, Firefox o Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 ui-surface">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Streaming Live</h3>
        {isStreaming && (
          <div className="ui-chip bg-emerald-50 text-emerald-700 border-emerald-200">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
            <span className="font-semibold">IN DIRETTA</span>
          </div>
        )}
      </div>

      {/* Camera Selection */}
      {!isStreaming && cameras.length > 1 && (
        <div>
          <label className="ui-label mb-1">
            Seleziona fotocamera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="ui-input"
          >
            <option value="">Fotocamera predefinita</option>
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Fotocamera ${camera.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoOff className="w-16 h-16 text-gray-600" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isStreaming ? (
          <button
            onClick={handleStartStream}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <Video className="w-4 h-4" />
            Avvia Streaming
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <VideoOff className="w-4 h-4" />
            Ferma Streaming
          </button>
        )}
      </div>

      {/* Viewer Count */}
      {isStreaming && (
        <div className="flex items-center gap-2 p-3 ui-surface-muted">
          <Users className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-medium text-slate-900">
            {viewerCount} {viewerCount === 1 ? 'spettatore' : 'spettatori'}
          </span>
        </div>
      )}

      {/* Shareable Link */}
      {isStreaming && (
        <div className="space-y-2">
          <label className="ui-label">
            Link per spettatori
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={generateStreamURL(streamKey)}
              readOnly
              className="ui-input font-mono text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
              title="Copia link"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="ui-help">
            Condividi questo link per permettere agli spettatori di vedere la partita in diretta
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info */}
      {!isStreaming && (
        <div className="p-3 ui-surface-muted">
          <p className="text-xs text-slate-600">
            💡 Lo streaming è completamente gratuito e peer-to-peer. Nessun server richiesto!
          </p>
        </div>
      )}
    </div>
  );
}
