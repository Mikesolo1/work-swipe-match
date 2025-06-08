
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type User = Tables<'users'>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (telegramUser: any, role: 'seeker' | 'employer') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли пользователь в localStorage
    const storedUser = localStorage.getItem('telegramUser');
    if (storedUser) {
      const telegramUser = JSON.parse(storedUser);
      checkUser(telegramUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const checkUser = async (telegramId: number) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user:', error);
      } else if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (telegramUser: any, role: 'seeker' | 'employer') => {
    try {
      setLoading(true);
      
      // Создаем или обновляем пользователя
      const userData = {
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        avatar_url: telegramUser.photo_url,
        role: role
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'telegram_id' })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      setUser(data);
      localStorage.setItem('telegramUser', JSON.stringify(telegramUser));
      localStorage.setItem('userRole', role);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setUser(data);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('telegramUser');
    localStorage.removeItem('userRole');
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
