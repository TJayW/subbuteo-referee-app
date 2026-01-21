/**
 * Streaming Analytics Tracker
 * 
 * Tracks streaming metrics for debugging and optimization.
 * Non-invasive - failures don't affect streaming functionality.
 */

export interface StreamingMetrics {
  sessionId: string;
  startedAt: number;
  endedAt: number | null;
  peakViewers: number;
  totalViewers: number; // Unique viewers
  averageLatency: number; // ms
  disconnections: number;
  quality: string;
  duration: number; // seconds
}

export interface StreamingEvent {
  type: 'stream_started' | 'stream_stopped' | 'viewer_joined' | 'viewer_left' | 'quality_changed' | 'error';
  timestamp: number;
  data?: Record<string, unknown>;
}

class StreamingAnalytics {
  private metrics: StreamingMetrics | null = null;
  private events: StreamingEvent[] = [];
  private viewerIds: Set<string> = new Set();

  startSession(quality: string): string {
    const sessionId = `stream-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    this.metrics = {
      sessionId,
      startedAt: Date.now(),
      endedAt: null,
      peakViewers: 0,
      totalViewers: 0,
      averageLatency: 0,
      disconnections: 0,
      quality,
      duration: 0,
    };

    this.events = [];
    this.viewerIds = new Set();

    this.trackEvent('stream_started', { quality });
    
    return sessionId;
  }

  endSession(): StreamingMetrics | null {
    if (!this.metrics) return null;

    this.metrics.endedAt = Date.now();
    this.metrics.duration = Math.floor((this.metrics.endedAt - this.metrics.startedAt) / 1000);

    this.trackEvent('stream_stopped', {
      duration: this.metrics.duration,
      peakViewers: this.metrics.peakViewers,
      totalViewers: this.metrics.totalViewers,
    });

    const finalMetrics = { ...this.metrics };
    this.metrics = null;

    return finalMetrics;
  }

  trackViewerJoin(viewerId: string): void {
    if (!this.metrics) return;

    this.viewerIds.add(viewerId);
    this.metrics.totalViewers = this.viewerIds.size;

    this.trackEvent('viewer_joined', { viewerId });
  }

  trackViewerLeave(viewerId: string): void {
    if (!this.metrics) return;

    this.trackEvent('viewer_left', { viewerId });
  }

  updateViewerCount(count: number): void {
    if (!this.metrics) return;

    if (count > this.metrics.peakViewers) {
      this.metrics.peakViewers = count;
    }
  }

  trackDisconnection(): void {
    if (!this.metrics) return;

    this.metrics.disconnections++;
  }

  trackQualityChange(newQuality: string): void {
    if (!this.metrics) return;

    this.metrics.quality = newQuality;
    this.trackEvent('quality_changed', { quality: newQuality });
  }

  trackError(error: string): void {
    this.trackEvent('error', { error });
  }

  private trackEvent(type: StreamingEvent['type'], data?: Record<string, unknown>): void {
    this.events.push({
      type,
      timestamp: Date.now(),
      data,
    });
  }

  getMetrics(): StreamingMetrics | null {
    return this.metrics ? { ...this.metrics } : null;
  }

  getEvents(): StreamingEvent[] {
    return [...this.events];
  }

  /**
   * Export analytics for debugging
   */
  exportAnalytics(): string {
    const data = {
      metrics: this.metrics,
      events: this.events,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Log summary to console (for debugging)
   */
  logSummary(): void {
    if (!this.metrics) {
      console.log('No active streaming session');
      return;
    }

    const duration = this.metrics.endedAt 
      ? Math.floor((this.metrics.endedAt - this.metrics.startedAt) / 1000)
      : Math.floor((Date.now() - this.metrics.startedAt) / 1000);

    console.group('📊 Streaming Analytics');
    console.log('Session ID:', this.metrics.sessionId);
    console.log('Duration:', `${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log('Peak Viewers:', this.metrics.peakViewers);
    console.log('Total Viewers:', this.metrics.totalViewers);
    console.log('Quality:', this.metrics.quality);
    console.log('Disconnections:', this.metrics.disconnections);
    console.log('Events:', this.events.length);
    console.groupEnd();
  }
}

export const streamingAnalytics = new StreamingAnalytics();
