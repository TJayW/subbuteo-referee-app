/**
 * Streaming Domain Types
 * 
 * Domain types for streaming state management.
 * Keeps streaming concerns separate from match logic.
 */

export type StreamStatus = 'idle' | 'initializing' | 'active' | 'error' | 'disconnected';

export interface StreamingState {
  status: StreamStatus;
  streamKey: string | null;
  viewerCount: number;
  startedAt: number | null; // timestamp
  lastError: string | null;
  quality: StreamQuality;
  selectedCamera: string | null;
}

export interface StreamQuality {
  width: number;
  height: number;
  frameRate: number;
  bitrate?: number; // kbps
}

export const DEFAULT_STREAM_QUALITY: StreamQuality = {
  width: 1280,
  height: 720,
  frameRate: 30,
};

export const STREAM_QUALITY_PRESETS: Record<string, StreamQuality> = {
  low: { width: 640, height: 480, frameRate: 24 },
  medium: { width: 1280, height: 720, frameRate: 30 },
  high: { width: 1920, height: 1080, frameRate: 30 },
};

export function createInitialStreamingState(): StreamingState {
  return {
    status: 'idle',
    streamKey: null,
    viewerCount: 0,
    startedAt: null,
    lastError: null,
    quality: DEFAULT_STREAM_QUALITY,
    selectedCamera: null,
  };
}
