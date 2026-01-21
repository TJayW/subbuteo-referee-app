/**
 * WatchStream - Amazon Prime Video Style Viewer
 * 
 * URL: #/watch/:streamKey
 * Features:
 * - Professional video player with custom controls
 * - Live chat integration
 * - Match metadata display
 * - Real-time viewer count
 * - Social interactions (like, share)
 */

import { useState, useEffect } from 'react';
import { Home, AlertCircle, RefreshCw, MessageCircle, Share2, Heart, ThumbsUp, Eye } from 'lucide-react';
import { useHashRouter } from '@/utils/hash-router';
import { useStreamingContext } from '@/contexts/StreamingContext';
import { VideoPlayer } from '@/ui/components/VideoPlayer';

interface MatchMetadata {
  homeTeam: string;
  awayTeam: string;
  score: { home: number; away: number };
  period: number;
  time: string;
  phase: string;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  reactions: number;
}

export function WatchStream() {
  const route = useHashRouter();
  const navigateToHome = () => window.location.hash = '';
  const streamKey = route.params?.streamKey || '';
  const { joinStream, leaveStream, remoteStream, viewerCount, error } = useStreamingContext();
  const [metadata] = useState<MatchMetadata | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Tifoso1', text: 'Forza! Grande partita!', timestamp: Date.now() - 120000, reactions: 5 },
    { id: '2', user: 'Arbitro2024', text: 'Che azione!', timestamp: Date.now() - 60000, reactions: 2 },
  ]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!streamKey) {
      setIsConnecting(false);
      return;
    }

    const connect = async () => {
      setIsConnecting(true);
      setConnectionAttempt(prev => prev + 1);
      
      try {
        await joinStream(streamKey);
        setIsConnecting(false);
      } catch (err) {
        console.error('Connection failed:', err);
        setIsConnecting(false);
      }
    };

    connect();

    return () => {
      leaveStream();
    };
  }, [streamKey, joinStream, leaveStream]);

  const handleRetry = () => {
    leaveStream();
    setTimeout(() => {
      if (streamKey) {
        joinStream(streamKey);
      }
    }, 500);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        user: 'Tu',
        text: chatMessage,
        timestamp: Date.now(),
        reactions: 0,
      }]);
      setChatMessage('');
    }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  if (!streamKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">Stream key mancante</p>
          <button
            onClick={navigateToHome}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header Amazon Prime Style */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="max-w-[2000px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={navigateToHome}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <div className="w-px h-6 bg-gray-700" />
            <div>
              <h1 className="text-white font-bold text-lg">Subbuteo Live</h1>
              <p className="text-gray-400 text-xs">Diretta streaming</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-white font-semibold text-sm">{viewerCount}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white font-semibold text-sm">LIVE</span>
            </div>

            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Condividi"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-lg transition-all ${
                liked ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-gray-800'
              }`}
              title="Mi piace"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[2000px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Video Section */}
          <div className="space-y-4">
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <div className="aspect-video bg-black relative">
                {isConnecting ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <RefreshCw className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                    </div>
                    <p className="text-white text-lg font-medium">Connessione allo stream...</p>
                    <p className="text-gray-400 text-sm">Tentativo {connectionAttempt}</p>
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-red-900/20 to-gray-900">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="text-center max-w-md">
                      <p className="text-white text-xl font-bold mb-2">Impossibile connettersi</p>
                      <p className="text-gray-300 text-sm mb-6">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 mx-auto"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Riprova
                      </button>
                    </div>
                  </div>
                ) : remoteStream ? (
                  <VideoPlayer stream={remoteStream} isLive={true} autoPlay />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">In attesa dello stream...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Match Info */}
            {metadata && (
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-xl font-bold">Match in corso</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-gray-400">
                      <span className="text-white font-semibold">{metadata.period}°</span> Tempo
                    </div>
                    <div className="w-px h-4 bg-gray-700" />
                    <div className="text-white font-bold font-mono">{metadata.time}</div>
                  </div>
                </div>
                
                {/* Score */}
                <div className="flex items-center justify-center gap-8 py-4">
                  <div className="text-center flex-1 max-w-[200px]">
                    <p className="text-gray-400 text-sm mb-2">Casa</p>
                    <p className="text-white font-bold text-lg mb-2">{metadata.homeTeam}</p>
                    <p className="text-blue-400 text-5xl font-bold">{metadata.score.home}</p>
                  </div>
                  <div className="text-gray-600 text-3xl font-bold">:</div>
                  <div className="text-center flex-1 max-w-[200px]">
                    <p className="text-gray-400 text-sm mb-2">Ospite</p>
                    <p className="text-white font-bold text-lg mb-2">{metadata.awayTeam}</p>
                    <p className="text-blue-400 text-5xl font-bold">{metadata.score.away}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Fase</p>
                    <p className="text-white font-semibold capitalize">{metadata.phase}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Spettatori</p>
                    <p className="text-white font-semibold">{viewerCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Qualità</p>
                    <p className="text-white font-semibold">HD</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-white" />
                    <h3 className="text-white font-bold">Chat Live</h3>
                  </div>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {showChat ? 'Nascondi' : 'Mostra'}
                  </button>
                </div>
              </div>

              {showChat && (
                <>
                  {/* Messages */}
                  <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                          {msg.user[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-semibold">{msg.user}</span>
                            <span className="text-gray-500 text-xs">
                              {Math.floor((Date.now() - msg.timestamp) / 60000)}m fa
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm break-words">{msg.text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-xs">
                              <ThumbsUp className="w-3 h-3" />
                              {msg.reactions > 0 && msg.reactions}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Scrivi un messaggio..."
                        className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                      >
                        Invia
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
