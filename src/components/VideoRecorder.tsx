
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Square, RotateCcw, Upload, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void;
  onClose: () => void;
  maxDuration?: number; // в секундах
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
  onVideoRecorded, 
  onClose, 
  maxDuration = 90 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast({
        title: "Ошибка доступа к камере",
        description: "Разрешите доступ к камере и микрофону для записи видео",
        variant: "destructive"
      });
    }
  }, [toast]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    
    // Пробуем разные MIME типы для совместимости
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm',
      'video/mp4'
    ];
    
    let mimeType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }
    
    if (!mimeType) {
      toast({
        title: "Ошибка записи",
        description: "Ваш браузер не поддерживает запись видео",
        variant: "destructive"
      });
      return;
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      recordedBlobRef.current = blob;
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo(videoUrl);
      
      // Останавливаем камеру
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    
    mediaRecorder.start(1000); // Записываем чанками по 1 секунде
    setIsRecording(true);
    setRecordingTime(0);
    
    // Таймер для отсчета времени
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
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
    setRecordedVideo(null);
    setRecordingTime(0);
    recordedBlobRef.current = null;
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    startCamera();
  }, [recordedVideo, startCamera]);

  const handleSave = useCallback(async () => {
    if (!recordedBlobRef.current) {
      toast({
        title: "Ошибка",
        description: "Видео не найдено для сохранения",
        variant: "destructive"
      });
      return;
    }
    
    try {
      onVideoRecorded(recordedBlobRef.current);
      onClose();
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить видео",
        variant: "destructive"
      });
    }
  }, [onVideoRecorded, onClose, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "Файл слишком большой",
          description: "Максимальный размер видео: 100MB",
          variant: "destructive"
        });
        return;
      }
      
      onVideoRecorded(file);
      onClose();
    } else {
      toast({
        title: "Неверный формат файла",
        description: "Пожалуйста, выберите видео файл",
        variant: "destructive"
      });
    }
  }, [onVideoRecorded, onClose, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    startCamera();
    
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo);
      }
    };
  }, [startCamera, recordedVideo]);

  if (hasPermission === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Camera size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Нет доступа к камере</h3>
          <p className="text-gray-600 mb-4">
            Разрешите доступ к камере и микрофону для записи видео
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={startCamera} variant="outline">
              Попробовать снова
            </Button>
            <Button onClick={onClose} variant="ghost">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {recordedVideo ? 'Предварительный просмотр' : 'Запись видео'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="relative mb-4">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded-lg object-cover"
            autoPlay={!recordedVideo}
            muted={!recordedVideo}
            playsInline
            src={recordedVideo || undefined}
            controls={!!recordedVideo}
          />
          
          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              REC {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </div>
          )}
        </div>

        {!recordedVideo ? (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              {!isRecording ? (
                <Button onClick={startRecording} className="flex items-center gap-2">
                  <Play size={16} />
                  Начать запись
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                  <Square size={16} />
                  Остановить ({formatTime(recordingTime)})
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">или</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload size={16} />
                  Загрузить файл
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 justify-center">
            <Button onClick={handleSave} className="flex items-center gap-2">
              Сохранить видео
            </Button>
            <Button onClick={resetRecording} variant="outline" className="flex items-center gap-2">
              <RotateCcw size={16} />
              Перезаписать
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Максимальная длительность: {maxDuration} сек. Размер файла: до 100 МБ
        </p>
      </CardContent>
    </Card>
  );
};

export default VideoRecorder;
