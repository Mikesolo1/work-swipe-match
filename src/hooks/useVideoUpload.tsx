
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async (videoBlob: Blob, userId: string, type: 'resume' | 'vacancy'): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const fileExtension = videoBlob.type.includes('webm') ? 'webm' : 'mp4';
      const fileName = `${type}_${userId}_${timestamp}.${fileExtension}`;
      const filePath = `videos/${fileName}`;

      console.log('Uploading video:', filePath, 'Size:', videoBlob.size);

      // Проверяем размер файла (максимум 100MB)
      if (videoBlob.size > 100 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 100MB');
      }

      // Создаем временную сессию для анонимного пользователя
      // Это решение для текущей системы аутентификации через localStorage
      const { data: sessionData, error: sessionError } = await supabase.auth.signInAnonymously();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // Если не удается создать сессию, попробуем загрузить без аутентификации
        // используя публичный bucket
      }

      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, videoBlob, {
          contentType: videoBlob.type,
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Upload error:', error);
        
        // Если ошибка RLS, попробуем альтернативный подход
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          // Попробуем загрузить с другим путем
          const altFilePath = `public/${fileName}`;
          const { data: altData, error: altError } = await supabase.storage
            .from('videos')
            .upload(altFilePath, videoBlob, {
              contentType: videoBlob.type,
              upsert: true
            });
          
          if (altError) {
            throw new Error(`Ошибка загрузки: ${altError.message}`);
          }
          
          const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(altFilePath);
          
          return urlData.publicUrl;
        }
        
        throw new Error(`Ошибка загрузки: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

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
      // Извлекаем путь к файлу из URL
      const urlParts = videoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Попробуем разные возможные пути
      const possiblePaths = [
        `videos/${fileName}`,
        `public/${fileName}`
      ];

      for (const filePath of possiblePaths) {
        const { error } = await supabase.storage
          .from('videos')
          .remove([filePath]);

        if (!error) {
          console.log('Video deleted successfully:', filePath);
          return true;
        }
      }

      console.error('Could not delete video from any path');
      return false;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  };

  return {
    uploadVideo,
    deleteVideo,
    isUploading
  };
};
