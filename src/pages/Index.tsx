
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, UserSearch, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    const initTelegram = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        if (tg.initDataUnsafe.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        } else {
          // Mock для разработки
          const mockUser = {
            id: 123456789,
            first_name: "Александр",
            last_name: "Петров",
            username: "alex_petrov",
            photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
          };
          setTelegramUser(mockUser);
        }
      } else {
        // Для разработки без Telegram
        const mockUser = {
          id: 123456789,
          first_name: "Александр",
          last_name: "Петров",
          username: "alex_petrov",
          photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
        };
        setTelegramUser(mockUser);
      }
      setIsInitializing(false);
    };

    initTelegram();
  }, []);

  useEffect(() => {
    if (user && !loading) {
      navigate('/swipe');
    }
  }, [user, loading, navigate]);

  const handleRoleSelect = async (role: 'seeker' | 'employer') => {
    if (!telegramUser) return;
    
    try {
      await signIn(telegramUser, role);
      navigate('/profile');
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Подключение к Telegram...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-pink-500 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Heart className="text-white" size={32} />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Мэтчворк
          </h1>
          <p className="text-gray-600 text-lg">
            Найди свою идеальную работу или кандидата
          </p>
        </div>

        {telegramUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
              <img 
                src={telegramUser.photo_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-700 font-medium">
              Привет, {telegramUser.first_name}!
            </p>
            <p className="text-gray-500 text-sm">
              Выберите свою роль, чтобы продолжить
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer" 
                  onClick={() => handleRoleSelect('seeker')}>
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserSearch className="text-white" size={24} />
                </div>
                <CardTitle className="text-xl">Я ищу работу</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Просматривайте вакансии и находите идеальные предложения
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer" 
                  onClick={() => handleRoleSelect('employer')}>
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="text-white" size={24} />
                </div>
                <CardTitle className="text-xl">Я ищу кандидатов</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Размещайте вакансии и находите талантливых специалистов
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-gray-400">
            Powered by Telegram Web App
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
