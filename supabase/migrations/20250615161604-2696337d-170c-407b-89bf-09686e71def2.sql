
-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can upload videos to videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos in videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete videos in videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update videos in videos bucket" ON storage.objects;

-- Создаем более открытые политики для работы с кастомной аутентификацией
CREATE POLICY "Allow video uploads to videos bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Создаем политику для чтения видео (публичный доступ)
CREATE POLICY "Public read access to videos bucket" 
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Создаем политику для удаления видео
CREATE POLICY "Allow video deletion in videos bucket"
ON storage.objects
FOR DELETE  
USING (bucket_id = 'videos');

-- Создаем политику для обновления видео
CREATE POLICY "Allow video updates in videos bucket"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'videos');
