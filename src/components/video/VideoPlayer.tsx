
import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  videoUrl: string;
  size?: 'small' | 'medium' | 'large';
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  size = 'medium',
  autoPlay = true,
  showControls = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    // Автоматически начинаем заново для loop эффекта
    if (videoRef.current && autoPlay) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-lg relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          autoPlay={autoPlay}
          muted
          playsInline
          loop={autoPlay}
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Overlay с кнопкой воспроизведения */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered || !isPlaying ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-gray-800" />
              ) : (
                <Play className="w-4 h-4 text-gray-800 ml-0.5" />
              )}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Индикатор видео */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
        <Play className="w-3 h-3 text-white" />
      </div>
    </div>
  );
};

export default VideoPlayer;
