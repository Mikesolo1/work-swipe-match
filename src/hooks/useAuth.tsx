
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, setUserContext } from '@/integrations/supabase/client';
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
      console.log('Checking user with telegram_id:', telegramId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user:', error);
      } else if (data) {
        console.log('User found:', data);
        setUser(data);
      } else {
        console.log('User not found');
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
      console.log('Signing in user:', telegramUser, 'with role:', role);
      
      // Создаем или обновляем пользователя
      const userData = {
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || 'Пользователь',
        last_name: telegramUser.last_name || null,
        avatar_url: telegramUser.photo_url || null,
        role: role
      };

      console.log('Upserting user with data:', userData);

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { 
          onConflict: 'telegram_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating user:', error);
        throw error;
      }

      console.log('User created/updated successfully:', data);
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
    if (!user) {
      console.error('No user found for profile update');
      throw new Error('No user found');
    }

    try {
      console.log('Updating profile for user:', user.id, 'with data:', profileData);
      
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

      console.log('Profile updated successfully:', data);
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
