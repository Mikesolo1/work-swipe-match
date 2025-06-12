
import React from 'react';

interface VideoPlayerProps {
  src: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 ${className}`}>
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoPlayer;
