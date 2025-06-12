
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadVideo = async (videoBlob: Blob, fileName?: string): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const fileExtension = videoBlob.type.includes('webm') ? 'webm' : 'mp4';
      const finalFileName = fileName || `video_${timestamp}.${fileExtension}`;
      const filePath = `${user.id}/${finalFileName}`;

      console.log('Uploading video to:', filePath);

      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, videoBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: videoBlob.type,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      if (!urlData.publicUrl) {
        throw new Error('Не удалось получить URL видео');
      }

      console.log('Public URL:', urlData.publicUrl);

      toast({
        title: "Успешно!",
        description: "Видео загружено",
      });

      return urlData.publicUrl;

    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось загрузить видео: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVideo = async (videoUrl: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Извлекаем путь к файлу из URL
      const url = new URL(videoUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      console.log('Deleting video:', filePath);

      const { error } = await supabase.storage
        .from('videos')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast({
        title: "Успешно!",
        description: "Видео удалено",
      });

      return true;

    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось удалить видео: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadVideo,
    deleteVideo,
    isUploading,
  };
};
