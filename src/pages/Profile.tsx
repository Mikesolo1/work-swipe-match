
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, DollarSign, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const Profile = () => {
  const [userRole, setUserRole] = useState<'seeker' | 'employer'>('seeker');
  const [telegramUser, setTelegramUser] = useState(null);
  const [profileData, setProfileData] = useState({
    city: '',
    skills: [] as string[],
    experience: '',
    achievement: '',
    salary_expectation: '',
    company: ''
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'seeker' | 'employer';
    const user = JSON.parse(localStorage.getItem('telegramUser') || '{}');
    setUserRole(role);
    setTelegramUser(user);
  }, []);

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSave = () => {
    console.log('Saving profile:', { ...profileData, role: userRole });
    // Here we would save to database
    window.location.href = '/swipe';
  };

  if (!telegramUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="p-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Мой профиль</h1>
          <p className="text-gray-600">
            {userRole === 'seeker' ? 'Настройте профиль соискателя' : 'Настройте профиль работодателя'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={telegramUser.photo_url} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">
                {telegramUser.first_name} {telegramUser.last_name}
              </CardTitle>
              <p className="text-gray-500">@{telegramUser.username}</p>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Город
                </label>
                <Input
                  placeholder="Москва"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                />
              </div>

              {userRole === 'employer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Компания
                  </label>
                  <Input
                    placeholder="Название компании"
                    value={profileData.company}
                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {userRole === 'seeker' ? 'Опыт работы' : 'О компании'}
                </label>
                <Textarea
                  placeholder={userRole === 'seeker' ? 'Кратко опишите ваш опыт...' : 'Кратко о вашей компании...'}
                  value={profileData.experience}
                  onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {userRole === 'seeker' ? 'Главное достижение' : 'Ключевые преимущества'}
                </label>
                <Textarea
                  placeholder={userRole === 'seeker' ? 'Ваше главное профессиональное достижение...' : 'Что выделяет вашу компанию...'}
                  value={profileData.achievement}
                  onChange={(e) => setProfileData({...profileData, achievement: e.target.value})}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {userRole === 'seeker' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Навыки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Добавить навык"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)}>
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Ожидания по зарплате
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="100000"
                    type="number"
                    value={profileData.salary_expectation}
                    onChange={(e) => setProfileData({...profileData, salary_expectation: e.target.value})}
                  />
                  <p className="text-sm text-gray-500 mt-1">Ожидаемая зарплата в рублях</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleSave}
          >
            Сохранить и продолжить
          </Button>
        </motion.div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
