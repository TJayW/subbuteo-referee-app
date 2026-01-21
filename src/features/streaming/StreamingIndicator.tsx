/**
 * StreamingIndicator - Mini indicator nella AppHeader
 * 
 * Mostra stato streaming con:
 * - Badge LIVE quando attivo
 * - Viewer count
 * - Click per espandere panel
 */

import { Eye } from 'lucide-react';
import { useStreamingContext } from '@/contexts/StreamingContext';

interface StreamingIndicatorProps {
  onExpand?: () => void;
}

export function StreamingIndicator({ onExpand }: StreamingIndicatorProps) {
  const { isStreaming, viewerCount } = useStreamingContext();
  
  if (!isStreaming) return null;

  return (
    <button
      onClick={onExpand}
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all shadow-lg shadow-red-500/30"
      title="Streaming attivo - Click per dettagli"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="font-semibold text-sm">LIVE</span>
      </div>
      
      <div className="w-px h-4 bg-white/30" />
      
      <div className="flex items-center gap-1">
        <Eye className="w-3.5 h-3.5" />
        <span className="font-medium text-sm">{viewerCount}</span>
      </div>
    </button>
  );
}
