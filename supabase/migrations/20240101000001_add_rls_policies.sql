
-- Включаем RLS для таблицы users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

-- Включаем RLS для таблицы vacancies
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы vacancies
CREATE POLICY "Anyone can view vacancies" ON public.vacancies
    FOR SELECT USING (true);

CREATE POLICY "Employers can create vacancies" ON public.vacancies
    FOR INSERT WITH CHECK (
        employer_id IN (
            SELECT id FROM public.users 
            WHERE role = 'employer' 
            AND telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
        )
    );

CREATE POLICY "Employers can update their own vacancies" ON public.vacancies
    FOR UPDATE USING (
        employer_id IN (
            SELECT id FROM public.users 
            WHERE role = 'employer' 
            AND telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
        )
    );

CREATE POLICY "Employers can delete their own vacancies" ON public.vacancies
    FOR DELETE USING (
        employer_id IN (
            SELECT id FROM public.users 
            WHERE role = 'employer' 
            AND telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
        )
    );

-- Включаем RLS для таблицы swipes
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы swipes
CREATE POLICY "Users can view their own swipes" ON public.swipes
    FOR SELECT USING (
        swiper_id IN (
            SELECT id FROM public.users 
            WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
        )
    );

CREATE POLICY "Users can create their own swipes" ON public.swipes
    FOR INSERT WITH CHECK (
        swiper_id IN (
            SELECT id FROM public.users 
            WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
        )
    );

-- Включаем RLS для таблицы matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы matches
CREATE POLICY "Users can view their own matches" ON public.matches
    FOR SELECT USING (
        participant_a IN (
            SELECT id FROM public.users 
            WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
        ) OR 
        participant_b IN (
            SELECT id FROM public.users 
            WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
        )
    );

-- Политики для справочных таблиц (публичное чтение)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);

ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view job categories" ON public.job_categories FOR SELECT USING (true);
