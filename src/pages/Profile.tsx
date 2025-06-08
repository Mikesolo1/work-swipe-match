
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, DollarSign, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCities } from '@/hooks/useCities';
import { useJobCategories } from '@/hooks/useJobCategories';
import BottomNav from '@/components/BottomNav';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { data: cities } = useCities();
  const { data: jobCategories } = useJobCategories();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    city: '',
    skills: [] as string[],
    experience: '',
    achievement: '',
    salary_expectation: '',
    company: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        city: user.city || '',
        skills: user.skills || [],
        experience: user.experience || '',
        achievement: user.achievement || '',
        salary_expectation: user.salary_expectation?.toString() || '',
        company: user.company || ''
      });
    }
  }, [user]);

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const addCategoryAsSkill = () => {
    if (selectedCategory && !profileData.skills.includes(selectedCategory)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, selectedCategory]
      });
      setSelectedCategory('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const updateData = {
        ...profileData,
        salary_expectation: profileData.salary_expectation ? parseInt(profileData.salary_expectation) : null
      };
      
      await updateProfile(updateData);
      navigate('/swipe');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (!user) {
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
            {user.role === 'seeker' ? 'Настройте профиль соискателя' : 'Настройте профиль работодателя'}
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
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <p className="text-gray-500">@{user.username}</p>
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
                <Select value={profileData.city} onValueChange={(value) => setProfileData({...profileData, city: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {user.role === 'employer' && (
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
                  {user.role === 'seeker' ? 'Опыт работы' : 'О компании'}
                </label>
                <Textarea
                  placeholder={user.role === 'seeker' ? 'Кратко опишите ваш опыт...' : 'Кратко о вашей компании...'}
                  value={profileData.experience}
                  onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {user.role === 'seeker' ? 'Главное достижение' : 'Ключевые преимущества'}
                </label>
                <Textarea
                  placeholder={user.role === 'seeker' ? 'Ваше главное профессиональное достижение...' : 'Что выделяет вашу компанию...'}
                  value={profileData.achievement}
                  onChange={(e) => setProfileData({...profileData, achievement: e.target.value})}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Навыки и специализации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Выбрать из категорий
                </label>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Выберите специализацию" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories?.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addCategoryAsSkill} size="sm" disabled={!selectedCategory}>
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Добавить навык вручную
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить навык"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1"
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
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

        {user.role === 'seeker' && (
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
