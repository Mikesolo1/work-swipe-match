import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, MapPin, DollarSign, Plus, X, Link, FileText, Trash2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCities } from '@/hooks/useCities';
import { useJobCategories } from '@/hooks/useJobCategories';
import BottomNav from '@/components/BottomNav';
import { toast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { data: cities } = useCities();
  const { data: jobCategories } = useJobCategories();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    city: '',
    skills: [] as string[],
    experience: '',
    achievement: '',
    salary_expectation: '',
    company: '',
    resume_url: '',
    portfolio_url: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        city: user.city || '',
        skills: user.skills || [],
        experience: user.experience || '',
        achievement: user.achievement || '',
        salary_expectation: user.salary_expectation?.toString() || '',
        company: user.company || '',
        resume_url: (user as any).resume_url || '',
        portfolio_url: (user as any).portfolio_url || ''
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
      setIsLoading(true);
      
      const updateData = {
        ...profileData,
        salary_expectation: profileData.salary_expectation ? parseInt(profileData.salary_expectation) : null
      };
      
      await updateProfile(updateData);
      
      toast({
        title: "Профиль сохранён",
        description: "Ваши данные успешно обновлены",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Профиль удален",
        description: "Ваш профиль был успешно удален",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить профиль",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen matchwork-gradient-bg pb-20">
      <div className="p-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="matchwork-heading text-2xl">Мой профиль</h1>
            <div className="flex gap-2">
              {user.role === 'employer' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/vacancy-management')}
                >
                  <Settings size={16} />
                </Button>
              )}
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Редактировать
                </Button>
              )}
            </div>
          </div>
          <p className="matchwork-text">
            {user.role === 'seeker' ? 'Профиль соискателя' : 'Профиль работодателя'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 matchwork-card">
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-matchwork-text">{user.first_name} {user.last_name}</CardTitle>
              <p className="text-matchwork-text-secondary">@{user.username}</p>
            </CardHeader>
          </Card>
        </motion.div>

        {isEditing ? (
          <>
            {/* Форма редактирования */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="mb-6 matchwork-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} />
                    Основная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-matchwork-text mb-1">
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
                      <label className="block text-sm font-medium text-matchwork-text mb-1">
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
                    <label className="block text-sm font-medium text-matchwork-text mb-1">
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
                    <label className="block text-sm font-medium text-matchwork-text mb-1">
                      {user.role === 'seeker' ? 'Главное достижение' : 'Ключевые преимущества'}
                    </label>
                    <Textarea
                      placeholder={user.role === 'seeker' ? 'Ваше главное профессиональное достижение...' : 'Что выделяет вашу компанию...'}
                      value={profileData.achievement}
                      onChange={(e) => setProfileData({...profileData, achievement: e.target.value})}
                      className="min-h-[60px]"
                    />
                  </div>

                  {user.role === 'seeker' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-matchwork-text mb-1">
                          <FileText className="inline w-4 h-4 mr-1" />
                          Ссылка на резюме
                        </label>
                        <Input
                          placeholder="https://example.com/resume.pdf"
                          value={profileData.resume_url}
                          onChange={(e) => setProfileData({...profileData, resume_url: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-matchwork-text mb-1">
                          <Link className="inline w-4 h-4 mr-1" />
                          Ссылка на портфолио
                        </label>
                        <Input
                          placeholder="https://portfolio.example.com"
                          value={profileData.portfolio_url}
                          onChange={(e) => setProfileData({...profileData, portfolio_url: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="mb-6 matchwork-card">
                <CardHeader>
                  <CardTitle>Навыки и специализации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-matchwork-text mb-1">
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
                    <label className="block text-sm font-medium text-matchwork-text mb-1">
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
                <Card className="mb-6 matchwork-card">
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
                    <p className="text-sm text-matchwork-text-secondary mt-1">Ожидаемая зарплата в рублях</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-3"
            >
              <Button 
                className="w-full matchwork-button-primary"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(false)}
              >
                Отменить
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2" size={16} />
                    Удалить профиль
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Ваш профиль будет удален навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProfile}>
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          </>
        ) : (
          <>
            {/* Просмотр профиля */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="mb-6 matchwork-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} />
                    Основная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileData.city && (
                    <div>
                      <p className="text-sm font-medium text-matchwork-text">Город:</p>
                      <p className="text-matchwork-text-secondary">{profileData.city}</p>
                    </div>
                  )}
                  
                  {user.role === 'employer' && profileData.company && (
                    <div>
                      <p className="text-sm font-medium text-matchwork-text">Компания:</p>
                      <p className="text-matchwork-text-secondary">{profileData.company}</p>
                    </div>
                  )}
                  
                  {profileData.experience && (
                    <div>
                      <p className="text-sm font-medium text-matchwork-text">
                        {user.role === 'seeker' ? 'Опыт работы:' : 'О компании:'}
                      </p>
                      <p className="text-matchwork-text-secondary">{profileData.experience}</p>
                    </div>
                  )}
                  
                  {profileData.achievement && (
                    <div>
                      <p className="text-sm font-medium text-matchwork-text">
                        {user.role === 'seeker' ? 'Главное достижение:' : 'Ключевые преимущества:'}
                      </p>
                      <p className="text-matchwork-text-secondary">{profileData.achievement}</p>
                    </div>
                  )}

                  {user.role === 'seeker' && (
                    <>
                      {profileData.resume_url && (
                        <div>
                          <p className="text-sm font-medium text-matchwork-text">Резюме:</p>
                          <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                            <FileText size={14} />
                            Посмотреть резюме
                          </a>
                        </div>
                      )}

                      {profileData.portfolio_url && (
                        <div>
                          <p className="text-sm font-medium text-matchwork-text">Портфолио:</p>
                          <a href={profileData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                            <Link size={14} />
                            Посмотреть портфолио
                          </a>
                        </div>
                      )}

                      {profileData.salary_expectation && (
                        <div>
                          <p className="text-sm font-medium text-matchwork-text">Ожидаемая зарплата:</p>
                          <p className="text-green-600 font-medium">от {parseInt(profileData.salary_expectation).toLocaleString()} ₽</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {profileData.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="mb-6 matchwork-card">
                  <CardHeader>
                    <CardTitle>Навыки и специализации</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
