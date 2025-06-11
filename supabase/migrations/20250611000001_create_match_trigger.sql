
-- Create a function to handle match creation when there's a mutual like
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only process 'like' swipes
    IF NEW.direction = 'like' THEN
        -- Check for mutual like based on target type
        IF NEW.target_type = 'vacancy' THEN
            -- Seeker liked a vacancy, check if employer liked the seeker
            IF EXISTS (
                SELECT 1 FROM swipes s
                JOIN vacancies v ON v.id = NEW.target_id
                WHERE s.swiper_id = v.employer_id
                AND s.target_id = NEW.swiper_id
                AND s.target_type = 'user'
                AND s.direction = 'like'
            ) THEN
                -- Create match
                INSERT INTO matches (participant_a, participant_b, vacancy_id, expires_at)
                SELECT 
                    NEW.swiper_id,
                    v.employer_id,
                    NEW.target_id,
                    NOW() + INTERVAL '24 hours'
                FROM vacancies v
                WHERE v.id = NEW.target_id
                ON CONFLICT DO NOTHING;
            END IF;
        ELSIF NEW.target_type = 'user' THEN
            -- Employer liked a seeker, check if seeker liked any of employer's vacancies
            IF EXISTS (
                SELECT 1 FROM swipes s
                JOIN vacancies v ON v.id = s.target_id
                WHERE s.swiper_id = NEW.target_id
                AND v.employer_id = NEW.swiper_id
                AND s.target_type = 'vacancy'
                AND s.direction = 'like'
            ) THEN
                -- Create match with the first matching vacancy
                INSERT INTO matches (participant_a, participant_b, vacancy_id, expires_at)
                SELECT 
                    NEW.target_id,
                    NEW.swiper_id,
                    v.id,
                    NOW() + INTERVAL '24 hours'
                FROM swipes s
                JOIN vacancies v ON v.id = s.target_id
                WHERE s.swiper_id = NEW.target_id
                AND v.employer_id = NEW.swiper_id
                AND s.target_type = 'vacancy'
                AND s.direction = 'like'
                LIMIT 1
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_match_on_mutual_like ON swipes;
CREATE TRIGGER trigger_create_match_on_mutual_like
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION public.create_match_on_mutual_like();

-- Function to clean up expired matches
CREATE OR REPLACE FUNCTION public.clean_expired_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM matches WHERE expires_at < NOW();
END;
$$;
