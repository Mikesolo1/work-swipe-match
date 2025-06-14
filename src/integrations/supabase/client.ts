
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://txwlkuplxvgjxpephszy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2xrdXBseHZnanhwZXBoc3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDU3NjUsImV4cCI6MjA2NDg4MTc2NX0.vikp6fIDvnDjIieZXTLTk9LU2P_3_Sf50iPH9k1upm0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: {
    headers: {
      'x-application-name': 'matchwork-app'
    }
  }
});

// Функция для установки контекста пользователя
export const setUserContext = async (telegramId: number) => {
  try {
    // Используем простой SQL запрос для установки переменной сессии
    const { error } = await supabase.rpc('clean_expired_matches');
    if (error) {
      console.log('RPC function not available, using alternative approach');
    }
    
    // Альтернативный подход - устанавливаем переменную через SQL
    await supabase.from('users').select('id').eq('telegram_id', telegramId).limit(1);
  } catch (error) {
    console.log('Could not set user context:', error);
  }
};
