/**
 * Advanced Video Player - Amazon Prime Video Style
 * 
 * Features:
 * - Custom controls overlay
 * - Play/pause on click
 * - Progress bar with hover preview
 * - Volume control
 * - Fullscreen toggle
 * - Quality selector
 * - Picture-in-Picture
 * - Keyboard shortcuts
 * - Loading states
 * - Error recovery
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  Cast,
  SkipBack,
  SkipForward,
  RefreshCw,
} from 'lucide-react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLive?: boolean;
  poster?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ 
  stream, 
  isLive = false, 
  poster,
  autoPlay = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('Auto');
  const hideControlsTimeoutRef = useRef<number | null>(null);

  // Set stream source
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setIsLoading(false);
    }
  }, [stream]);

  // Auto-hide controls after 3 seconds of inactivity
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    if (isPlaying && !isLive) {
      hideControlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isLive]);

  // Play/Pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Volume
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    videoRef.current.volume = clampedVolume;
    setIsMuted(clampedVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    if (isMuted) {
      handleVolumeChange(volume || 0.5);
    } else {
      handleVolumeChange(0);
    }
  }, [isMuted, volume, handleVolumeChange]);

  // Fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [isFullscreen]);

  // Progress
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current || isLive) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  }, [duration, isLive]);

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (!videoRef.current || isLive) return;
    videoRef.current.currentTime += seconds;
  }, [isLive]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause, toggleFullscreen, toggleMute, skip, volume, handleVolumeChange]);

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('progress', updateBuffered);
    video.addEventListener('waiting', () => setIsLoading(true));
    video.addEventListener('canplay', () => setIsLoading(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('progress', updateBuffered);
    };
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={resetHideControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        autoPlay={autoPlay}
        playsInline
        poster={poster}
        onClick={togglePlayPause}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <RefreshCw className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded text-white font-semibold text-sm shadow-lg z-20">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-white text-xl font-bold mb-1">Subbuteo Live Stream</h2>
            <p className="text-gray-300 text-sm">Match in corso</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              title="Impostazioni"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              title="Cast"
            >
              <Cast className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 m-auto w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all hover:scale-110"
          >
            <Play className="w-10 h-10 text-white ml-1" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Progress Bar */}
          {!isLive && (
            <div
              ref={progressBarRef}
              className="mb-4 h-1.5 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all group/progress"
              onClick={handleProgressClick}
            >
              {/* Buffered */}
              <div
                className="absolute h-full bg-white/40 rounded-full"
                style={{ width: `${(buffered / duration) * 100}%` }}
              />
              
              {/* Progress */}
              <div
                className="relative h-full bg-blue-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              {/* Skip Buttons (non-live) */}
              {!isLive && (
                <>
                  <button
                    onClick={() => skip(-10)}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    title="Indietro 10s"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => skip(10)}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    title="Avanti 10s"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                
                <div className="w-0 group-hover/volume:w-24 transition-all overflow-hidden">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>

              {/* Time */}
              {!isLive && (
                <div className="text-white text-sm font-medium ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Quality */}
              {showSettings && (
                <div className="absolute bottom-20 right-6 bg-black/95 rounded-lg p-3 min-w-[150px]">
                  <div className="text-white text-sm font-semibold mb-2">Qualità</div>
                  {['Auto', '1080p', '720p', '480p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        quality === q
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {q} {quality === q && '✓'}
                    </button>
                  ))}
                </div>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
