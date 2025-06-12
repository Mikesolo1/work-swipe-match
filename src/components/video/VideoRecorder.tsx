import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Save } from 'lucide-react';
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
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { uploadVideo, isUploading } = useVideoUpload();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          aspectRatio: 1,
        },
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Не удалось получить доступ к камере');
    }
  };

  const startRecording = () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9' // Лучшее сжатие
      });

      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Таймер записи
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Не удалось начать запись');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Создаем видеофайл из записанных чанков
      setTimeout(() => {
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
        }
      }, 100);
    }
  };

  const resetRecording = () => {
    setRecordedChunks([]);
    setVideoUrl(null);
    setRecordingTime(0);
    startCamera();
  };

  const saveVideo = async () => {
    if (recordedChunks.length === 0) return;

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoUrl = await uploadVideo(blob);
      
      if (videoUrl) {
        onVideoSaved(videoUrl);
      }
    } catch (error) {
      console.error('Error saving video:', error);
      setError('Не удалось сохранить видео');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Автоматически запускаем камеру при загрузке
  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-center">{title}</h3>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          style={{ aspectRatio: '1/1' }}
        />
        
        {videoUrl && (
          <video
            src={videoUrl}
            controls
            className="absolute inset-0 w-full h-full rounded-lg object-cover"
            style={{ aspectRatio: '1/1' }}
          />
        )}

        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            REC {formatTime(recordingTime)}
          </div>
        )}

        {recordingTime > 0 && maxDuration > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-2">
        {!stream && !videoUrl && (
          <Button onClick={startCamera} variant="outline">
            Включить камеру
          </Button>
        )}

        {stream && !videoUrl && !isRecording && (
          <Button onClick={startRecording} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Начать запись
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Остановить
          </Button>
        )}

        {videoUrl && (
          <>
            <Button onClick={resetRecording} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Перезаписать
            </Button>
            <Button 
              onClick={saveVideo} 
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isUploading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </>
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        Максимальная длительность: {formatTime(maxDuration)}
      </div>
    </div>
  );
};

export default VideoRecorder;
