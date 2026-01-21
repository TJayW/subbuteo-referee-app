/**
 * useStreaming - Hook for managing WebRTC P2P streaming
 * 
 * Simplifies streaming logic for components.
 * Handles broadcaster and viewer modes.
 * Includes persistence and analytics.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { StreamBroadcaster, StreamViewer, generateStreamURL } from '../adapters/media/webrtc-adapter';
import { streamingPersistence } from '../adapters/streaming/streaming-persistence';
import { streamingAnalytics } from '../adapters/streaming/streaming-analytics';

interface UseStreamingOptions {
  onViewerJoined?: (viewerId: string) => void;
  onViewerLeft?: (viewerId: string) => void;
  onStreamReceived?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
}

export function useStreaming(options: UseStreamingOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState<string>('');
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string>('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const broadcasterRef = useRef<StreamBroadcaster | null>(null);
  const viewerRef = useRef<StreamViewer | null>(null);

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
            return newCount;
          });
          options.onViewerJoined?.(viewerId);
        },
        (viewerId) => {
          setViewerCount((prev) => {
            const newCount = Math.max(0, prev - 1);
            streamingAnalytics.trackViewerLeave(viewerId);
            streamingAnalytics.updateViewerCount(newCount);
            return newCount;
          });
          options.onViewerLeft?.(viewerId);
        },
        (err) => {
          setError(err.message);
          streamingAnalytics.trackError(err.message);
          options.onError?.(err);
        }
      );

      const key = await broadcaster.startBroadcast({
        video: true,
        audio: true,
      });

      const stream = broadcaster.getLocalStream();
      
      broadcasterRef.current = broadcaster;
      setStreamKey(key);
      setIsStreaming(true);
      setLocalStream(stream);

      // Start analytics session
      streamingAnalytics.startSession('medium');

      // Persist state
      streamingPersistence.save({
        status: 'active',
        streamKey: key,
        viewerCount: 0,
        startedAt: Date.now(),
        lastError: null,
        quality: { width: 1280, height: 720, frameRate: 30 },
        selectedCamera: null,
      });

      return key;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore avvio streaming';
      setError(errorMsg);
      options.onError?.(err as Error);
      throw err;
    }
  }, [options]);

  // Stop broadcasting
  const stopBroadcast = useCallback(() => {
    if (broadcasterRef.current) {
      broadcasterRef.current.stopBroadcast();
      broadcasterRef.current = null;
    }

    setIsStreaming(false);
    setStreamKey('');
    setViewerCount(0);
    setLocalStream(null);

    // End analytics session and log summary
    const metrics = streamingAnalytics.endSession();
    if (metrics) {
      console.log('Stream ended:', metrics);
      streamingAnalytics.logSummary();
    }

    // Clear persistence
    streamingPersistence.clear();
  }, []);

  // Connect as viewer
  const connectAsViewer = useCallback(async (key: string) => {
    try {
      setError('');

      const viewer = new StreamViewer(
        (stream) => {
          setRemoteStream(stream);
          options.onStreamReceived?.(stream);
        },
        (data) => {
          console.log('Data received:', data);
        },
        () => {
          console.log('Disconnected');
          setRemoteStream(null);
        },
        (err) => {
          setError(err.message);
          options.onError?.(err);
        }
      );

      await viewer.connectToStream(key);
      viewerRef.current = viewer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore connessione';
      setError(errorMsg);
      options.onError?.(err as Error);
      throw err;
    }
  }, [options]);

  // Disconnect viewer
  const disconnectViewer = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.disconnect();
      viewerRef.current = null;
      setRemoteStream(null);
    }
  }, []);

  // Get shareable URL
  const getStreamURL = useCallback(() => {
    return streamKey ? generateStreamURL(streamKey) : '';
  }, [streamKey]);

  // Broadcast data to all viewers
  const broadcastData = useCallback((data: unknown) => {
    if (broadcasterRef.current) {
      broadcasterRef.current.broadcast(data);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcast();
      disconnectViewer();
    };
  }, [stopBroadcast, disconnectViewer]);

  return {
    // State
    isStreaming,
    streamKey,
    viewerCount,
    error,
    localStream,
    remoteStream,
    
    // Broadcaster actions
    startBroadcast,
    stopBroadcast,
    broadcastData,
    
    // Viewer actions
    connectAsViewer,
    disconnectViewer,
    
    // Utilities
    getStreamURL,
  };
}
