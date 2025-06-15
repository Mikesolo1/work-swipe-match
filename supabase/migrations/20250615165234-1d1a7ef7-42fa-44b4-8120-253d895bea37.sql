
-- Функция для получения отфильтрованных вакансий для соискателя
CREATE OR REPLACE FUNCTION get_filtered_vacancies_for_seeker(
  p_user_id UUID,
  p_city TEXT DEFAULT NULL,
  p_skills TEXT[] DEFAULT NULL,
  p_salary_min INTEGER DEFAULT NULL,
  p_salary_max INTEGER DEFAULT NULL,
  p_has_video BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  city TEXT,
  skills_required TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  video_url TEXT,
  team_lead_name TEXT,
  team_lead_avatar TEXT,
  employer_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  employer_first_name TEXT,
  employer_last_name TEXT,
  employer_company TEXT,
  employer_avatar_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.city,
    v.skills_required,
    v.salary_min,
    v.salary_max,
    v.video_url,
    v.team_lead_name,
    v.team_lead_avatar,
    v.employer_id,
    v.created_at,
    v.updated_at,
    u.first_name as employer_first_name,
    u.last_name as employer_last_name,
    u.company as employer_company,
    u.avatar_url as employer_avatar_url
  FROM vacancies v
  JOIN users u ON v.employer_id = u.id
  WHERE v.employer_id != p_user_id
    AND v.id NOT IN (
      SELECT target_id 
      FROM swipes 
      WHERE swiper_id = p_user_id 
        AND target_type = 'vacancy'
    )
    AND (p_city IS NULL OR v.city ILIKE '%' || p_city || '%')
    AND (p_skills IS NULL OR v.skills_required && p_skills)
    AND (p_salary_min IS NULL OR v.salary_max IS NULL OR v.salary_max >= p_salary_min)
    AND (p_salary_max IS NULL OR v.salary_min IS NULL OR v.salary_min <= p_salary_max)
    AND (p_has_video IS NULL OR (p_has_video = true AND v.video_url IS NOT NULL) OR (p_has_video = false))
  ORDER BY v.created_at DESC;
END;
$$;

-- Функция для получения отфильтрованных соискателей для работодателя
CREATE OR REPLACE FUNCTION get_filtered_seekers_for_employer(
  p_user_id UUID,
  p_city TEXT DEFAULT NULL,
  p_skills TEXT[] DEFAULT NULL,
  p_salary_min INTEGER DEFAULT NULL,
  p_salary_max INTEGER DEFAULT NULL,
  p_has_video BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  telegram_id BIGINT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  city TEXT,
  skills TEXT[],
  experience TEXT,
  achievement TEXT,
  salary_expectation INTEGER,
  resume_url TEXT,
  portfolio_url TEXT,
  video_resume_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.telegram_id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.city,
    u.skills,
    u.experience,
    u.achievement,
    u.salary_expectation,
    u.resume_url,
    u.portfolio_url,
    u.video_resume_url,
    u.role::TEXT,
    u.created_at,
    u.updated_at
  FROM users u
  WHERE u.role = 'seeker'
    AND u.id != p_user_id
    AND u.id NOT IN (
      SELECT target_id 
      FROM swipes 
      WHERE swiper_id = p_user_id 
        AND target_type = 'user'
    )
    AND (p_city IS NULL OR u.city ILIKE '%' || p_city || '%')
    AND (p_skills IS NULL OR u.skills && p_skills)
    AND (p_salary_min IS NULL OR u.salary_expectation IS NULL OR u.salary_expectation >= p_salary_min)
    AND (p_salary_max IS NULL OR u.salary_expectation IS NULL OR u.salary_expectation <= p_salary_max)
    AND (p_has_video IS NULL OR (p_has_video = true AND u.video_resume_url IS NOT NULL) OR (p_has_video = false))
  ORDER BY u.created_at DESC;
END;
$$;
