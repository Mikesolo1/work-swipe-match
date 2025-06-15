
-- Создаем bucket для видео если его еще нет
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Создаем политику для загрузки видео (аутентифицированные пользователи)
CREATE POLICY "Users can upload videos to videos bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Создаем политику для чтения видео (публичный доступ)
CREATE POLICY "Anyone can view videos in videos bucket" 
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Создаем политику для удаления видео (только владельцы)
CREATE POLICY "Users can delete videos in videos bucket"
ON storage.objects
FOR DELETE  
USING (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Создаем политику для обновления видео
CREATE POLICY "Users can update videos in videos bucket"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);
