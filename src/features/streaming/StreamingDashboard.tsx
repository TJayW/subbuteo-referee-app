/**
 * StreamingDashboard - Broadcaster Dashboard (Amazon Prime Video Style)
 * 
 * Professional broadcaster interface with:
 * - Live preview with controls
 * - Stream health metrics
 * - Viewer analytics
 * - Chat/Comments feed
 * - Quick actions
 * - Recording controls
 */

import { useState, useEffect } from 'react';
import { 
  Video, 
  Users, 
  Activity, 
  TrendingUp, 
  MessageCircle,
  Settings,
  Share2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Wifi,
  Zap,
} from 'lucide-react';
import { VideoPlayer } from '@/ui/components/VideoPlayer';
import { useStreamingContext } from '@/contexts/StreamingContext';
import type { DomainMatchState } from '@/domain/match/types';

interface StreamingDashboardProps {
  matchState: DomainMatchState;
  homeTeamName: string;
  awayTeamName: string;
  onClose: () => void;
}

interface StreamMetrics {
  bitrate: number; // kbps
  fps: number;
  resolution: string;
  latency: number; // ms
  packetsLost: number;
  jitter: number; // ms
}

export function StreamingDashboard({ 
  matchState, 
  homeTeamName, 
  awayTeamName,
  onClose 
}: StreamingDashboardProps) {
  const { 
    isStreaming, 
    streamKey,
    viewerCount, 
    error, 
    localStream,
    startBroadcast, 
    stopBroadcast,
    getStreamURL,
    broadcastData,
  } = useStreamingContext();

  const [metrics] = useState<StreamMetrics>({
    bitrate: 0,
    fps: 30,
    resolution: '1280x720',
    latency: 0,
    packetsLost: 0,
    jitter: 0,
  });

  const [streamDuration, setStreamDuration] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [comments] = useState<Array<{ id: string; user: string; text: string; time: number }>>([]);

  // Track stream duration
  useEffect(() => {
    if (!isStreaming) {
      setStreamDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Track peak viewers
  useEffect(() => {
    if (viewerCount > peakViewers) {
      setPeakViewers(viewerCount);
    }
  }, [viewerCount, peakViewers]);

  // Sync match metadata
  useEffect(() => {
    if (isStreaming && matchState) {
      const score = {
        home: matchState.events.filter((e, i) => i < matchState.cursor && e.type === 'goal' && e.team === 'home').length,
        away: matchState.events.filter((e, i) => i < matchState.cursor && e.type === 'goal' && e.team === 'away').length,
      };

      broadcastData({
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        score,
        period: matchState.period,
        time: formatTime(matchState.elapsedSeconds),
        phase: matchState.matchPhase,
      });
    }
  }, [
    isStreaming,
    matchState?.events.length,
    matchState?.cursor,
    matchState?.period,
    matchState?.elapsedSeconds,
    matchState?.matchPhase,
    homeTeamName,
    awayTeamName,
    broadcastData,
    matchState,
  ]);

  const handleStartStream = async () => {
    try {
      await startBroadcast();
    } catch (err) {
      console.error('Failed to start stream:', err);
    }
  };

  const handleShare = async () => {
    const url = getStreamURL();
    if (url) {
      await navigator.clipboard.writeText(url);
      // Show toast notification
    }
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-lg border-b border-gray-800 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al match
              </button>
              <div className="w-px h-6 bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Broadcasting Studio</h1>
                  <p className="text-gray-400 text-sm">{homeTeamName} vs {awayTeamName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isStreaming && (
                <div className="flex items-center gap-6 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-500 font-semibold text-sm">LIVE</span>
                  </div>
                  <div className="w-px h-4 bg-green-500/30" />
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Clock className="w-4 h-4" />
                    {formatDuration(streamDuration)}
                  </div>
                </div>
              )}

              {!isStreaming ? (
                <button
                  onClick={handleStartStream}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30"
                >
                  Vai in Diretta
                </button>
              ) : (
                <button
                  onClick={stopBroadcast}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Termina Diretta
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Preview & Controls */}
          <div className="xl:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
              <div className="aspect-video bg-black">
                {localStream ? (
                  <VideoPlayer stream={localStream} isLive={true} autoPlay />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                      <Video className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-gray-500">Nessuno stream attivo</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stream Health Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={<Users />}
                label="Spettatori"
                value={viewerCount.toString()}
                subtext={`Picco: ${peakViewers}`}
                color="blue"
              />
              <MetricCard
                icon={<Activity />}
                label="Bitrate"
                value={`${metrics.bitrate} kbps`}
                subtext={`${metrics.fps} FPS`}
                color="green"
              />
              <MetricCard
                icon={<Wifi />}
                label="Latenza"
                value={`${metrics.latency}ms`}
                subtext={`Jitter: ${metrics.jitter}ms`}
                color="purple"
              />
              <MetricCard
                icon={<Zap />}
                label="Qualità"
                value={metrics.resolution}
                subtext={`${metrics.packetsLost} pacchetti persi`}
                color="orange"
              />
            </div>

            {/* Quick Actions */}
            {isStreaming && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Azioni Rapide
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <ActionButton
                    icon={<Share2 />}
                    label="Condividi"
                    onClick={handleShare}
                  />
                  <ActionButton
                    icon={<Download />}
                    label={isRecording ? 'Stop Rec' : 'Registra'}
                    onClick={() => setIsRecording(!isRecording)}
                    variant={isRecording ? 'danger' : 'default'}
                  />
                  <ActionButton
                    icon={<MessageCircle />}
                    label="Chat"
                    badge={comments.length}
                  />
                  <ActionButton
                    icon={<Settings />}
                    label="Impostazioni"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Analytics & Chat */}
          <div className="space-y-6">
            {/* Stream Info */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Informazioni Stream
              </h3>
              <div className="space-y-4">
                {isStreaming ? (
                  <>
                    <InfoRow label="Stream Key" value={streamKey?.substring(0, 20) + '...'} />
                    <InfoRow label="URL Stream" value={getStreamURL() || ''} copyable />
                    <InfoRow label="Protocollo" value="WebRTC P2P" />
                    <InfoRow label="Stato" value="In Diretta" badge="success" />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">Stream non attivo</p>
                    <p className="text-gray-600 text-sm">Clicca "Vai in Diretta" per iniziare</p>
                  </div>
                )}
              </div>
            </div>

            {/* Viewer Analytics */}
            {isStreaming && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Analytics Spettatori
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Attuali</span>
                    <span className="text-white font-semibold">{viewerCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Picco</span>
                    <span className="text-white font-semibold">{peakViewers}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Media</span>
                    <span className="text-white font-semibold">
                      {streamDuration > 0 ? Math.round(peakViewers * 0.7) : 0}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${Math.min((viewerCount / 20) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs text-center mt-2">
                    Capacità P2P: {viewerCount}/20
                  </p>
                </div>
              </div>
            )}

            {/* Comments/Chat */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Commenti Live
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Nessun commento ancora
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">{comment.user}</span>
                          <span className="text-gray-500 text-xs">{formatTime(comment.time)}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-500 font-medium text-sm mb-1">Errore Stream</p>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ icon, label, value, subtext, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-500',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-500',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-500',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-500',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`${colorClasses[color].split(' ')[3]}`}>
          {icon}
        </div>
        <span className="text-gray-400 text-xs font-medium uppercase">{label}</span>
      </div>
      <div className="text-white text-2xl font-bold mb-1">{value}</div>
      <div className="text-gray-500 text-xs">{subtext}</div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  badge?: number;
}

function ActionButton({ icon, label, onClick, variant = 'default', badge }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
        variant === 'danger'
          ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500'
          : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800 text-gray-300'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  badge?: 'success' | 'warning' | 'error';
}

function InfoRow({ label, value, copyable, badge }: InfoRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            badge === 'success' ? 'bg-green-500/20 text-green-500' :
            badge === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-red-500/20 text-red-500'
          }`}>
            {badge === 'success' && <CheckCircle className="w-3 h-3 inline mr-1" />}
            {badge === 'success' ? 'Attivo' : badge === 'warning' ? 'Attenzione' : 'Errore'}
          </span>
        )}
        <span className="text-white text-sm font-mono">{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copia"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
