
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUser } from '@/hooks/useUsers';
import { useCities } from '@/hooks/useCities';
import { useJobCategories } from '@/hooks/useJobCategories';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, Briefcase, Star, DollarSign, Link, FileText, Video, Trash2 } from 'lucide-react';
import { formatSalary, generateInitials } from '@/utils/formatters';
import VideoModal from '@/components/video/VideoModal';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useVideoUpload } from '@/hooks/useVideoUpload';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const updateUser = useUpdateUser();
  const { data: cities = [] } = useCities();
  const { data: jobCategories = [] } = useJobCategories();
  const { toast } = useToast();
  const { deleteVideo } = useVideoUpload();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    city: '',
    skills: [] as string[],
    experience: '',
    achievement: '',
    salary_expectation: 0,
    portfolio_url: '',
    resume_url: '',
    company: '',
    video_resume_url: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [salaryRange, setSalaryRange] = useState([0]);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (user) {
      const userData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        city: user.city || '',
        skills: user.skills || [],
        experience: user.experience || '',
        achievement: user.achievement || '',
        salary_expectation: user.salary_expectation || 0,
        portfolio_url: user.portfolio_url || '',
        resume_url: user.resume_url || '',
        company: user.company || '',
        video_resume_url: user.video_resume_url || '',
      };
      setFormData(userData);
      setSalaryRange([user.salary_expectation || 0]);
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalaryChange = (value: number[]) => {
    setSalaryRange(value);
    handleInputChange('salary_expectation', value[0]);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      const newSkills = [...formData.skills, skillInput.trim()];
      handleInputChange('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = formData.skills.filter(skill => skill !== skillToRemove);
    handleInputChange('skills', newSkills);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form data:', formData);
      await updateProfile(formData);
      toast({
        title: "Успешно!",
        description: "Профиль обновлен",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };

  const handleVideoSaved = async (videoUrl: string) => {
    try {
      console.log('Saving video URL:', videoUrl);
      handleInputChange('video_resume_url', videoUrl);
      setShowVideoModal(false);
      
      await updateProfile({ video_resume_url: videoUrl });
      toast({
        title: "Успешно!",
        description: "Видео-резюме добавлено",
      });
    } catch (error) {
      console.error('Error updating video resume:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить видео-резюме",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVideo = async () => {
    if (!formData.video_resume_url) return;
    
    try {
      console.log('Deleting video:', formData.video_resume_url);
      const success = await deleteVideo(formData.video_resume_url);
      if (success) {
        handleInputChange('video_resume_url', '');
        await updateProfile({ video_resume_url: null });
        toast({
          title: "Успешно!",
          description: "Видео-резюме удалено",
        });
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить видео-резюме",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
        <div className="matchwork-card p-8 shadow-xl">
          <p className="text-center matchwork-text-muted">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen matchwork-gradient-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="matchwork-card shadow-xl">
          <CardHeader className="text-center border-b border-matchwork-border">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url || ''} alt={user.first_name} />
                <AvatarFallback className="bg-matchwork-primary text-white text-xl">
                  {generateInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl matchwork-text mb-2">
                  {user.first_name} {user.last_name}
                </CardTitle>
                <Badge variant="secondary" className="text-sm">
                  {user.role === 'seeker' ? 'Соискатель' : 'Работодатель'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Базовая информация */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold matchwork-text flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Основная информация
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Имя</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="matchwork-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Фамилия</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="matchwork-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger className="matchwork-input">
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {user.role === 'employer' && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Компания</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="matchwork-input"
                      placeholder="Название компании"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Видео-резюме */}
              {user.role === 'seeker' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold matchwork-text flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Видео-резюме
                  </h3>
                  
                  {formData.video_resume_url ? (
                    <div className="flex items-center gap-4">
                      <VideoPlayer src={formData.video_resume_url} size="medium" />
                      <div className="space-y-2">
                        <p className="text-sm matchwork-text-muted">Видео-резюме добавлено</p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowVideoModal(true)}
                            className="text-sm"
                          >
                            Перезаписать
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteVideo}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowVideoModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      📹 Записать видео-резюме
                    </Button>
                  )}
                </div>
              )}

              {/* Профессиональная информация для соискателей */}
              {user.role === 'seeker' && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold matchwork-text flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Профессиональная информация
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Опыт работы</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="matchwork-input"
                        placeholder="Расскажите о своем опыте работы"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="achievement">Достижения</Label>
                      <Textarea
                        id="achievement"
                        value={formData.achievement}
                        onChange={(e) => handleInputChange('achievement', e.target.value)}
                        className="matchwork-input"
                        placeholder="Ваши основные достижения"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Навыки</Label>
                      <div className="flex gap-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Добавить навык"
                          className="matchwork-input"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} variant="outline">
                          Добавить
                        </Button>
                      </div>
                      
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="cursor-pointer hover:bg-red-100"
                              onClick={() => removeSkill(skill)}
                            >
                              {skill} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label>Ожидаемая зарплата: {formatSalary(salaryRange[0])}</Label>
                      <Slider
                        value={salaryRange}
                        onValueChange={handleSalaryChange}
                        max={500000}
                        min={20000}
                        step={10000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm matchwork-text-muted">
                        <span>20 000 ₽</span>
                        <span>500 000 ₽</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold matchwork-text flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Дополнительные ссылки
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="portfolio_url">Портфолио</Label>
                      <Input
                        id="portfolio_url"
                        type="url"
                        value={formData.portfolio_url}
                        onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                        className="matchwork-input"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resume_url">Резюме (ссылка)</Label>
                      <Input
                        id="resume_url"
                        type="url"
                        value={formData.resume_url}
                        onChange={(e) => handleInputChange('resume_url', e.target.value)}
                        className="matchwork-input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  className="matchwork-button-primary px-8 py-2"
                  disabled={updateUser.isPending}
                >
                  {updateUser.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onVideoSaved={handleVideoSaved}
        title="Записать видео-резюме"
        maxDuration={90}
      />
    </div>
  );
};

export default Profile;
