
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

      console.log('Uploading video:', filePath, 'Size:', videoBlob.size, 'Type:', videoBlob.type);

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
        .upload(filePath, videoBlob, {
          contentType: videoBlob.type,
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Upload error:', error);
        
        // Если ошибка связана с аутентификацией, попробуем публичную загрузку
        if (error.message.includes('JWT') || error.message.includes('auth') || error.message.includes('policy')) {
          console.log('Trying public upload approach...');
          
          // Попробуем загрузить в публичную папку
          const publicFilePath = `public/${fileName}`;
          const { data: publicData, error: publicError } = await supabase.storage
            .from('videos')
            .upload(publicFilePath, videoBlob, {
              contentType: videoBlob.type,
              upsert: true
            });
          
          if (publicError) {
            console.error('Public upload error:', publicError);
            throw new Error(`Ошибка загрузки: ${publicError.message}`);
          }
          
          console.log('Public upload successful:', publicData);
          
          const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(publicFilePath);
          
          return urlData.publicUrl;
        }
        
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
