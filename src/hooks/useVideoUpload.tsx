
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

      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, videoBlob, {
          contentType: videoBlob.type,
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить видео. Попробуйте еще раз.",
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
      const filePath = `videos/${fileName}`;

      const { error } = await supabase.storage
        .from('videos')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

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
