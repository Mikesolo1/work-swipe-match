
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadVideo = async (videoBlob: Blob, userId: string, type: 'resume' | 'vacancy'): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      // Проверяем авторизацию через кастомную систему
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const fileExtension = videoBlob.type.includes('webm') ? 'webm' : 'mp4';
      const fileName = `${type}_${userId}_${timestamp}.${fileExtension}`;

      console.log('Uploading video:', fileName, 'Size:', videoBlob.size, 'Type:', videoBlob.type);

      // Проверяем размер файла (максимум 100MB)
      if (videoBlob.size > 100 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 100MB');
      }

      // Проверяем, что файл не пустой
      if (videoBlob.size === 0) {
        throw new Error('Файл видео пустой');
      }

      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, videoBlob, {
          contentType: videoBlob.type,
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Ошибка загрузки: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить видео';
      toast({
        title: "Ошибка загрузки",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVideo = async (videoUrl: string): Promise<boolean> => {
    try {
      // Проверяем авторизацию через кастомную систему
      if (!user) {
        console.error('User not authenticated for video deletion');
        return false;
      }

      // Извлекаем имя файла из URL
      const fileName = extractFileNameFromUrl(videoUrl);
      if (!fileName) {
        console.error('Could not extract filename from URL:', videoUrl);
        return false;
      }

      console.log('Attempting to delete video file:', fileName);

      // Удаляем файл из Supabase Storage
      const { error } = await supabase.storage
        .from('videos')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting video from storage:', error);
        // Не возвращаем false здесь, так как файл мог быть уже удален
        // или URL мог быть недействительным
        console.log('Continuing despite storage deletion error...');
      } else {
        console.log('Video deleted successfully from storage:', fileName);
      }

      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  };

  // Функция для извлечения имени файла из URL
  const extractFileNameFromUrl = (url: string): string | null => {
    try {
      // Пример URL: https://txwlkuplxvgjxpephszy.supabase.co/storage/v1/object/public/videos/resume_user123_1234567890.mp4
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Проверяем, что это похоже на имя файла видео
      if (fileName && (fileName.includes('.mp4') || fileName.includes('.webm'))) {
        return fileName;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return null;
    }
  };

  return {
    uploadVideo,
    deleteVideo,
    isUploading
  };
};
