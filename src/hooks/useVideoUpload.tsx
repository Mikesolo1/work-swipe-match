
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async (videoBlob: Blob, userId: string, type: 'resume' | 'vacancy'): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      // Проверяем аутентификацию пользователя
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Пользователь не авторизован');
      }

      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const fileExtension = videoBlob.type.includes('webm') ? 'webm' : 'mp4';
      const fileName = `${type}_${userId}_${timestamp}.${fileExtension}`;
      const filePath = `${fileName}`;

      console.log('Uploading video:', filePath, 'Size:', videoBlob.size, 'Type:', videoBlob.type);

      // Проверяем размер файла (максимум 100MB)
      if (videoBlob.size > 100 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 100MB');
      }

      // Проверяем, что файл не пустой
      if (videoBlob.size === 0) {
        throw new Error('Файл видео пустой');
      }

      // Загружаем файл в Supabase Storage с аутентификацией
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, videoBlob, {
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
        .getPublicUrl(filePath);

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
      // Проверяем аутентификацию пользователя
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('User not authenticated for video deletion');
        return false;
      }

      // Извлекаем путь к файлу из URL
      const urlParts = videoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from('videos')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting video:', error);
        return false;
      }

      console.log('Video deleted successfully:', fileName);
      return true;
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
