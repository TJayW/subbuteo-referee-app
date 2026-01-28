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
      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full transition-all hover:bg-red-100"
      title="Streaming attivo - Click per dettagli"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        <span className="font-semibold text-xs">LIVE</span>
      </div>
      
      <div className="w-px h-4 bg-red-200" />
      
      <div className="flex items-center gap-1">
        <Eye className="w-3.5 h-3.5" />
        <span className="font-medium text-xs tabular-nums">{viewerCount}</span>
      </div>
    </button>
  );
}
