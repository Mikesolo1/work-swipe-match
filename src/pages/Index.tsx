
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, UserSearch, Building2, Sparkles, Users, Zap, ArrowRight } from 'lucide-react';
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
      <div className="min-h-screen bg-matchwork-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 matchwork-gradient-primary rounded-2xl flex items-center justify-center matchwork-pulse">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="matchwork-text font-medium">Инициализация Matchwork...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matchwork-background flex items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="matchwork-gradient-primary w-20 h-20 rounded-3xl flex items-center justify-center mx-auto matchwork-pulse shadow-2xl"
          >
            <Heart className="text-white" size={32} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h1 className="matchwork-heading-large">
              Matchwork
            </h1>
            <p className="matchwork-text text-lg text-balance">
              Найди свою идеальную работу или кандидата
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2 matchwork-text-muted">
              <Users size={16} className="text-matchwork-primary" />
              <span>10K+ пользователей</span>
            </div>
            <div className="flex items-center gap-2 matchwork-text-muted">
              <Zap size={16} className="text-matchwork-accent" />
              <span>Мгновенные мэтчи</span>
            </div>
          </motion.div>
        </div>

        {/* User Profile Section */}
        {telegramUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="matchwork-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 overflow-hidden ring-2 ring-white shadow-lg">
                {telegramUser.photo_url ? (
                  <img 
                    src={telegramUser.photo_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {telegramUser.first_name?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-matchwork-text">
                  Привет, {telegramUser.first_name}! 👋
                </p>
                <p className="matchwork-text-muted">
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
            transition={{ delay: 0.6 }}
          >
            <Card 
              className="matchwork-card matchwork-interactive group cursor-pointer" 
              onClick={() => handleRoleSelect('seeker')}
            >
              <CardHeader className="text-center pb-3">
                <div className="matchwork-gradient-accent w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <UserSearch className="text-white" size={24} />
                </div>
                <CardTitle className="text-xl font-bold text-matchwork-text">Я ищу работу</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0 space-y-3">
                <p className="matchwork-text">
                  Просматривайте вакансии и находите идеальные предложения
                </p>
                <div className="flex items-center justify-center gap-2 matchwork-text-muted">
                  <Sparkles size={14} className="text-matchwork-accent" />
                  <span>Умный алгоритм подбора</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-matchwork-primary font-medium group-hover:gap-2 transition-all">
                  <span>Начать поиск</span>
                  <ArrowRight size={16} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card 
              className="matchwork-card matchwork-interactive group cursor-pointer" 
              onClick={() => handleRoleSelect('employer')}
            >
              <CardHeader className="text-center pb-3">
                <div className="matchwork-gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="text-white" size={24} />
                </div>
                <CardTitle className="text-xl font-bold text-matchwork-text">Я ищу кандидатов</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0 space-y-3">
                <p className="matchwork-text">
                  Размещайте вакансии и находите талантливых специалистов
                </p>
                <div className="flex items-center justify-center gap-2 matchwork-text-muted">
                  <Sparkles size={14} className="text-matchwork-secondary" />
                  <span>Точный таргетинг</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-matchwork-primary font-medium group-hover:gap-2 transition-all">
                  <span>Создать вакансию</span>
                  <ArrowRight size={16} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-4"
        >
          <p className="matchwork-text-muted flex items-center justify-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-matchwork-primary">Telegram Web App</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
