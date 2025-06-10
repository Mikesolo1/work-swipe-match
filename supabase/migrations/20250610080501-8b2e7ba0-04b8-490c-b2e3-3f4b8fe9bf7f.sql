
-- Добавляем демо данные городов
INSERT INTO public.cities (name, region, is_remote) VALUES
('Москва', 'Россия', false),
('Санкт-Петербург', 'Россия', false),
('Новосибирск', 'Россия', false),
('Екатеринбург', 'Россия', false),
('Казань', 'Россия', false),
('Нижний Новгород', 'Россия', false),
('Краснодар', 'Россия', false),
('Удаленно', 'Глобально', true),
('Remote', 'Global', true),
('Лондон', 'Великобритания', false),
('Нью-Йорк', 'США', false),
('Берлин', 'Германия', false),
('Токио', 'Япония', false),
('Сингапур', 'Сингапур', false),
('Дубай', 'ОАЭ', false)
ON CONFLICT (name) DO NOTHING;

-- Добавляем демо категории вакансий (если ограничение не существует, создаем его)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_categories_name_unique') THEN
        ALTER TABLE public.job_categories ADD CONSTRAINT job_categories_name_unique UNIQUE (name);
    END IF;
END $$;

INSERT INTO public.job_categories (name, parent_id) VALUES
('IT и разработка', NULL),
('Frontend разработка', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('Backend разработка', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('Мобильная разработка', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('DevOps', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('Data Science', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('QA и тестирование', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('Product Management', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('UI/UX дизайн', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка')),
('Системное администрирование', (SELECT id FROM public.job_categories WHERE name = 'IT и разработка'))
ON CONFLICT (name) DO NOTHING;

-- Добавляем демо пользователей-соискателей
INSERT INTO public.users (telegram_id, username, first_name, last_name, role, city, skills, experience, achievement, salary_expectation, avatar_url) VALUES
(123456001, 'alex_dev', 'Александр', 'Петров', 'seeker', 'Москва', ARRAY['React', 'TypeScript', 'Node.js', 'GraphQL'], 'Frontend разработчик с 3 годами опыта. Работал в стартапах и крупных компаниях. Специализируюсь на React экосистеме.', 'Увеличил конверсию интернет-магазина на 25% за счет оптимизации UX', 180000, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
(123456002, 'maria_backend', 'Мария', 'Сидорова', 'seeker', 'Санкт-Петербург', ARRAY['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'], 'Backend разработчик с 4 годами опыта. Специализируюсь на высоконагруженных системах и API.', 'Оптимизировала API, что привело к уменьшению времени отклика на 40%', 220000, 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face'),
(123456003, 'dmitry_mobile', 'Дмитрий', 'Козлов', 'seeker', 'Новосибирск', ARRAY['React Native', 'iOS', 'Swift', 'Kotlin', 'Firebase'], 'Мобильный разработчик с 5 годами опыта. Создавал приложения для iOS и Android с нуля.', 'Приложение, которое я разработал, набрало 100K+ скачиваний в первый месяц', 250000, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
(123456004, 'anna_data', 'Анна', 'Волкова', 'seeker', 'Екатеринбург', ARRAY['Python', 'Pandas', 'TensorFlow', 'SQL', 'Machine Learning'], 'Data Scientist с 3 годами опыта. Специализируюсь на машинном обучении и анализе данных.', 'Создала модель прогнозирования, которая увеличила прибыль компании на 15%', 200000, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
(123456005, 'sergey_devops', 'Сергей', 'Морозов', 'seeker', 'Казань', ARRAY['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'], 'DevOps инженер с 4 годами опыта. Автоматизирую процессы развертывания и мониторинга.', 'Сократил время развертывания с 2 часов до 10 минут с помощью CI/CD', 240000, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
(123456006, 'elena_qa', 'Елена', 'Новикова', 'seeker', 'Нижний Новгород', ARRAY['Selenium', 'Cypress', 'Jest', 'Postman', 'API Testing'], 'QA Engineer с 3 годами опыта. Специализируюсь на автоматизации тестирования.', 'Автоматизировала 80% регрессионных тестов, что сократило время тестирования в 3 раза', 160000, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face')
ON CONFLICT (telegram_id) DO NOTHING;

-- Добавляем демо пользователей-работодателей
INSERT INTO public.users (telegram_id, username, first_name, last_name, role, city, company, avatar_url) VALUES
(123456101, 'startup_ceo', 'Владимир', 'Иванов', 'employer', 'Москва', 'TechStart', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'),
(123456102, 'fintech_hr', 'Ольга', 'Смирнова', 'employer', 'Санкт-Петербург', 'FinTech Solutions', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'),
(123456103, 'ecom_founder', 'Андрей', 'Кузнецов', 'employer', 'Новосибирск', 'E-Commerce Pro', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'),
(123456104, 'gamedev_lead', 'Екатерина', 'Федорова', 'employer', 'Екатеринбург', 'GameDev Studio', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face')
ON CONFLICT (telegram_id) DO NOTHING;

-- Добавляем демо вакансии
INSERT INTO public.vacancies (title, description, city, salary_min, salary_max, skills_required, employer_id, team_lead_name, team_lead_avatar) VALUES
('Senior Frontend Developer', 'Ищем опытного Frontend разработчика для работы над продуктом следующего поколения. Вы будете работать с современным стеком технологий и участвовать в архитектурных решениях.', 'Москва', 200000, 280000, ARRAY['React', 'TypeScript', 'Redux', 'GraphQL', 'CSS'], (SELECT id FROM public.users WHERE telegram_id = 123456101), 'Алексей Технарь', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('Backend Python Developer', 'Приглашаем Python разработчика в команду финтех продукта. Работаем с высокими нагрузками и сложными бизнес-процессами.', 'Санкт-Петербург', 180000, 250000, ARRAY['Python', 'Django', 'PostgreSQL', 'Redis', 'Celery'], (SELECT id FROM public.users WHERE telegram_id = 123456102), 'Мария Архитектор', 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face'),
('React Native Developer', 'Разрабатываем мобильное приложение для e-commerce. Ищем разработчика с опытом в React Native и желанием создавать качественный продукт.', 'Новосибирск', 160000, 220000, ARRAY['React Native', 'JavaScript', 'Redux', 'Firebase', 'iOS', 'Android'], (SELECT id FROM public.users WHERE telegram_id = 123456103), 'Дмитрий Мобайлер', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('DevOps Engineer', 'Нужен DevOps инженер для автоматизации процессов и поддержки инфраструктуры нашего игрового проекта.', 'Екатеринбург', 190000, 260000, ARRAY['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Monitoring'], (SELECT id FROM public.users WHERE telegram_id = 123456104), 'Сергей Системщик', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
('Junior Frontend Developer', 'Отличная возможность начать карьеру в IT! Мы поможем вам вырасти и стать профессионалом.', 'Москва', 80000, 120000, ARRAY['HTML', 'CSS', 'JavaScript', 'React'], (SELECT id FROM public.users WHERE telegram_id = 123456101), 'Анна Ментор', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('Data Scientist', 'Ищем специалиста по машинному обучению для работы с большими данными в финтех.', 'Санкт-Петербург', 200000, 300000, ARRAY['Python', 'TensorFlow', 'Pandas', 'SQL', 'Machine Learning'], (SELECT id FROM public.users WHERE telegram_id = 123456102), 'Владимир Данные', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'),
('QA Automation Engineer', 'Приглашаем QA инженера для автоматизации тестирования e-commerce платформы.', 'Удаленно', 140000, 200000, ARRAY['Selenium', 'Python', 'Cypress', 'API Testing', 'Jest'], (SELECT id FROM public.users WHERE telegram_id = 123456103), 'Елена Тестер', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'),
('Full Stack Developer', 'Ищем универсального разработчика для работы над игровой платформой. От идеи до релиза!', 'Екатеринбург', 170000, 240000, ARRAY['React', 'Node.js', 'MongoDB', 'Express', 'WebSocket'], (SELECT id FROM public.users WHERE telegram_id = 123456104), 'Игорь Универсал', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face');
