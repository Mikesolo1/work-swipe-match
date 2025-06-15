
-- Создаем политику для загрузки видео (только аутентифицированные пользователи)  
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Создаем политику для чтения видео (публичный доступ)
CREATE POLICY "Anyone can view videos" 
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Создаем политику для удаления своих видео
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE  
USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
