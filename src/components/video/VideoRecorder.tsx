
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { VideoIcon, StopCircle, Play, RotateCcw, Upload, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useVideoUpload } from '@/hooks/useVideoUpload';

interface VideoRecorderProps {
  onVideoSaved: (videoUrl: string) => void;
  maxDuration?: number; // в секундах
  title?: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
  onVideoSaved, 
  maxDuration = 90,
  title = "Записать видео"
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { uploadVideo, isUploading } = useVideoUpload();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 640 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
          ? 'video/webm;codecs=vp9' 
          : 'video/webm'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        
        // Останавливаем стрим
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Таймер записи
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить доступ к камере",
        variant: "destructive",
      });
    }
  }, [maxDuration, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordedUrl('');
    setIsPlaying(false);
    setRecordingTime(0);
    
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [recordedUrl]);

  const playPreview = useCallback(() => {
    if (previewRef.current) {
      if (isPlaying) {
        previewRef.current.pause();
      } else {
        previewRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const saveVideo = useCallback(async () => {
    if (!recordedBlob) return;
    
    try {
      const videoUrl = await uploadVideo(recordedBlob, `video_${Date.now()}.webm`);
      
      if (videoUrl) {
        onVideoSaved(videoUrl);
        resetRecording();
      }
      
    } catch (error) {
      console.error('Error saving video:', error);
    }
  }, [recordedBlob, uploadVideo, onVideoSaved, resetRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          Максимальная длительность: {maxDuration} секунд
        </p>
      </div>

      {/* Видео превью */}
      <div className="relative">
        <div className="w-64 h-64 mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {isRecording && (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          )}
          
          {recordedUrl && !isRecording && (
            <video
              ref={previewRef}
              src={recordedUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              onEnded={() => setIsPlaying(false)}
            />
          )}
          
          {!isRecording && !recordedUrl && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <VideoIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Индикатор записи */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {formatTime(recordingTime)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка воспроизведения */}
        {recordedUrl && !isRecording && (
          <Button
            onClick={playPreview}
            size="lg"
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/80 hover:bg-white/90 text-gray-800"
          >
            {isPlaying ? <StopCircle size={24} /> : <Play size={24} />}
          </Button>
        )}
      </div>

      {/* Контролы */}
      <div className="flex justify-center gap-3">
        {!isRecording && !recordedUrl && (
          <Button
            onClick={startRecording}
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <VideoIcon className="mr-2" size={20} />
            Начать запись
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <StopCircle className="mr-2" size={20} />
            Остановить
          </Button>
        )}

        {recordedUrl && !isRecording && (
          <>
            <Button
              onClick={resetRecording}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="mr-2" size={20} />
              Перезаписать
            </Button>
            
            <Button
              onClick={saveVideo}
              disabled={isUploading}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isUploading ? (
                <Upload className="mr-2 animate-spin" size={20} />
              ) : (
                <Check className="mr-2" size={20} />
              )}
              {isUploading ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
