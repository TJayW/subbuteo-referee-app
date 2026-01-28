/**
 * MiniStreamPreview - Anteprima minimizzata per Console
 * 
 * Picture-in-picture style:
 * - Preview video piccolo nell'angolo
 * - Draggable
 * - Click per espandere
 * - Mostra stato e viewer count
 */

import { Maximize2, X, Users } from 'lucide-react';
import { useStreamingContext } from '@/contexts/StreamingContext';

interface MiniStreamPreviewProps {
  onExpand?: () => void;
  onClose?: () => void;
}

export function MiniStreamPreview({ onExpand, onClose }: MiniStreamPreviewProps) {
  const { isStreaming, localStream, viewerCount } = useStreamingContext();

  if (!isStreaming || !localStream) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 w-64 ui-surface-dark overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-red-600 cursor-move">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-semibold">STREAMING</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExpand}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Espandi"
          >
            <Maximize2 className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Chiudi"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative aspect-video bg-black">
        <video
          autoPlay
          muted
          playsInline
          ref={(video) => {
            if (video && localStream) {
              video.srcObject = localStream;
            }
          }}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Info */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded text-white text-xs">
          <Users className="w-3 h-3" />
          <span className="font-medium">{viewerCount}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-slate-900/70 text-center">
        <button
          onClick={onExpand}
          className="text-xs text-slate-200 hover:text-white transition-colors"
        >
          Click per aprire dashboard →
        </button>
      </div>
    </div>
  );
}
