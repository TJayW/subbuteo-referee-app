import { useState } from 'react';
import { Video, VideoOff, Users, Copy, Check, Maximize2, ExternalLink, Eye } from 'lucide-react';
import { useStreamingContext } from '@/contexts/StreamingContext';
import { isBrowserSupported } from '@/adapters/media';
import type { DomainMatchState } from '@/domain/match/types';

interface StreamingControlProps {
  matchState: DomainMatchState;
  homeTeamName: string;
  awayTeamName: string;
  compact?: boolean;
  onExpandDashboard?: () => void;
}

export function StreamingControl({ onExpandDashboard }: StreamingControlProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const isSupported = isBrowserSupported();
  
  const { 
    isStreaming, 
    viewerCount, 
    error, 
    startBroadcast, 
    stopBroadcast, 
    getStreamURL,
    localStream
  } = useStreamingContext();

  const handleCopyLink = async () => {
    const url = getStreamURL();
    if (url) {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleOpenViewer = () => {
    const url = getStreamURL();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleStartStream = async () => {
    setIsConnecting(true);
    try {
      await startBroadcast();
    } catch (err) {
      console.error('Failed to start stream:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-xs text-yellow-800">Browser non supporta streaming</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-sm">Streaming</h4>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white rounded-full text-xs">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {!isStreaming ? (
        <button
          onClick={handleStartStream}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connessione...
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              Avvia Streaming
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          {localStream && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-red-500">
              <video
                autoPlay
                muted
                playsInline
                ref={(video) => {
                  if (video && localStream) video.srcObject = localStream;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white rounded text-xs font-bold">
                LIVE
              </div>
              {onExpandDashboard && (
                <button
                  onClick={onExpandDashboard}
                  className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white rounded text-xs">
                <Users className="w-3 h-3 inline mr-1" />
                {viewerCount}
              </div>
            </div>
          )}

          <div className="flex gap-1">
            <input
              type="text"
              value={getStreamURL() || ''}
              readOnly
              className="flex-1 px-2 py-1.5 text-xs bg-white border rounded font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
            <button onClick={handleCopyLink} className="px-2 bg-blue-600 text-white rounded" title="Copia link">
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* How to test instructions */}
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-800 mb-2">
              <strong>Come testare:</strong> Apri il link in un altro tab/browser per vedere il viewer count aumentare
            </p>
            <button
              onClick={handleOpenViewer}
              className="w-full flex items-center justify-center gap-2 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              <Eye className="w-3 h-3" />
              Apri viewer in nuovo tab (test)
            </button>
          </div>

          <div className="flex gap-2">
            {onExpandDashboard && (
              <button
                onClick={onExpandDashboard}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Dashboard
              </button>
            )}
            <button
              onClick={stopBroadcast}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              <VideoOff className="w-4 h-4 inline mr-1" />
              Ferma
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
