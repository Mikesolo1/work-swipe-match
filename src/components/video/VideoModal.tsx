
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VideoRecorder from './VideoRecorder';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSaved: (videoUrl: string) => void;
  title?: string;
  maxDuration?: number;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  onVideoSaved,
  title = "Записать видео",
  maxDuration = 90
}) => {
  const handleVideoSaved = (videoUrl: string) => {
    onVideoSaved(videoUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <VideoRecorder
          onVideoSaved={handleVideoSaved}
          maxDuration={maxDuration}
          title=""
        />
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
