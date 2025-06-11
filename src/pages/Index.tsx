import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, UserSearch, Building2, Sparkles, Users, Zap } from 'lucide-react';
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
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 matchwork-gradient-primary rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-slate-600 font-medium">Инициализация Matchwork...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Hero Section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="matchwork-gradient-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 matchwork-pulse"
          >
            <Heart className="text-white" size={32} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="matchwork-heading text-4xl mb-3"
          >
            Matchwork
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="matchwork-text text-lg mb-2"
          >
            Найди свою идеальную работу или кандидата
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 text-sm text-slate-500"
          >
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>10K+ пользователей</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={16} />
              <span>Мгновенные мэтчи</span>
            </div>
          </motion.div>
        </div>

        {/* User Profile Section */}
        {telegramUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="matchwork-card p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                <img 
                  src={telegramUser.photo_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  Привет, {telegramUser.first_name}! 👋
                </p>
                <p className="text-sm text-slate-500">
                  Выберите свою роль для начала
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Role Selection Cards */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card 
              className="matchwork-card transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group" 
              onClick={() => handleRoleSelect('seeker')}
            >
              <CardHeader className="text-center pb-3">
                <div className="matchwork-gradient-success w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UserSearch className="text-white" size={24} />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">Я ищу работу</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="matchwork-text">
                  Просматривайте вакансии и находите идеальные предложения
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                  <Sparkles size={12} />
                  <span>Умный алгоритм подбора</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card 
              className="matchwork-card transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group" 
              onClick={() => handleRoleSelect('employer')}
            >
              <CardHeader className="text-center pb-3">
                <div className="matchwork-gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="text-white" size={24} />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">Я ищу кандидатов</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="matchwork-text">
                  Размещайте вакансии и находите талантливых специалистов
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                  <Sparkles size={12} />
                  <span>Точный таргетинг</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold">Telegram Web App</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
