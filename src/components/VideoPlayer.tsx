
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showControls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  size = 'medium',
  className = '',
  showControls = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);

    // Автоматически запускаем видео при загрузке
    video.play().catch(console.error);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div className={`relative group ${sizeClasses[size]} ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full rounded-full object-cover cursor-pointer"
        src={videoUrl}
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      />
      
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              {isPlaying ? (
                <Pause size={size === 'small' ? 12 : 16} />
              ) : (
                <Play size={size === 'small' ? 12 : 16} />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              {isMuted ? (
                <VolumeX size={size === 'small' ? 12 : 16} />
              ) : (
                <Volume2 size={size === 'small' ? 12 : 16} />
              )}
            </button>
          </div>
        </div>
      )}
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 text-white p-2 rounded-full">
            <Play size={size === 'small' ? 16 : 24} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
