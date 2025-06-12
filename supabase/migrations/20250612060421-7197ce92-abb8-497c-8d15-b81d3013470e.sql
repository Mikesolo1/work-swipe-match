
-- Создаем bucket для видеофайлов
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true);

-- Создаем политики для работы с видео
CREATE POLICY "Allow public read access to videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Allow authenticated users to upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Добавляем поля для видео в таблицы пользователей и вакансий
ALTER TABLE users ADD COLUMN video_resume_url TEXT;
ALTER TABLE vacancies ADD COLUMN video_url TEXT;
