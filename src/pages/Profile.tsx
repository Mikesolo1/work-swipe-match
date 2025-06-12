import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUser } from '@/hooks/useUsers';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import VideoModal from '@/components/video/VideoModal';
import VideoPlayer from '@/components/video/VideoPlayer';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Trophy, 
  DollarSign, 
  Link,
  FileText,
  Settings,
  HelpCircle,
  VideoIcon,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const updateUserMutation = useUpdateUser();
  const { startOnboarding } = useOnboarding();
  const { uploadVideo, deleteVideo, isUploading } = useVideoUpload();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    city: user?.city || '',
    experience: user?.experience || '',
    achievement: user?.achievement || '',
    salary_expectation: user?.salary_expectation || '',
    portfolio_url: user?.portfolio_url || '',
    resume_url: user?.resume_url || '',
    company: user?.company || '',
    skills: user?.skills || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      skills: value.split(',').map(s => s.trim())
    }));
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      salary_expectation: parseInt(value) || 0
    }));
  };

  const saveProfile = async () => {
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        city: formData.city,
        experience: formData.experience,
        achievement: formData.achievement,
        salary_expectation: formData.salary_expectation,
        portfolio_url: formData.portfolio_url,
        resume_url: formData.resume_url,
        company: formData.company,
        skills: formData.skills,
      });
      setIsEditing(false);
      toast({
        title: "Успешно!",
        description: "Профиль обновлен",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVideoSaved = async (videoBlob: Blob) => {
    try {
      const videoUrl = await uploadVideo(videoBlob, `resume_${Date.now()}.webm`);
      
      if (videoUrl && user) {
        await updateProfile({ 
          video_resume_url: videoUrl 
        });
        
        toast({
          title: "Успешно!",
          description: "Видео-резюме сохранено",
        });
      }
    } catch (error) {
      console.error('Error saving video resume:', error);
    }
  };

  const handleDeleteVideo = async () => {
    if (!user?.video_resume_url) return;
    
    const success = await deleteVideo(user.video_resume_url);
    
    if (success) {
      await updateProfile({ 
        video_resume_url: null 
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Профиль недоступен</h2>
          <p className="text-gray-600">Необходимо войти в систему</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Профиль</h1>
            <p className="text-gray-600">Управляйте своей информацией</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startOnboarding}
              className="bg-white/80 backdrop-blur-sm"
            >
              <HelpCircle size={16} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/80 backdrop-blur-sm"
            >
              <Settings size={16} />
            </Button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center space-y-4">
                {/* Video Resume or Avatar */}
                <div className="relative">
                  {user.video_resume_url ? (
                    <div className="relative">
                      <VideoPlayer 
                        videoUrl={user.video_resume_url} 
                        size="large"
                        autoPlay={true}
                        showControls={true}
                      />
                      {isEditing && (
                        <Button
                          onClick={handleDeleteVideo}
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-4xl">
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Video Recording Button */}
                {isEditing && (
                  <Button
                    onClick={() => setShowVideoModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    disabled={isUploading}
                  >
                    <VideoIcon className="mr-2" size={16} />
                    {user.video_resume_url ? 'Перезаписать видео' : 'Записать видео-резюме'}
                  </Button>
                )}

                <div>
                  <CardTitle className="text-2xl text-gray-800">
                    {user.first_name} {user.last_name}
                  </CardTitle>
                  {user.username && (
                    <p className="text-gray-500 mt-1">@{user.username}</p>
                  )}
                  <Badge 
                    variant="secondary" 
                    className="mt-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700"
                  >
                    {user.role === 'seeker' ? 'Соискатель' : 'Работодатель'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  Информация
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      name="first_name"
                      placeholder="Имя"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="last_name"
                      placeholder="Фамилия"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Input
                  type="text"
                  name="city"
                  placeholder="Город"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                {user.role === 'employer' && (
                  <Input
                    type="text"
                    name="company"
                    placeholder="Компания"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  Опыт и достижения
                </h3>
                <Textarea
                  name="experience"
                  placeholder="Опыт работы"
                  value={formData.experience}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Textarea
                  name="achievement"
                  placeholder="Главное достижение"
                  value={formData.achievement}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  Навыки и зарплата
                </h3>
                <Input
                  type="text"
                  name="skills"
                  placeholder="Навыки (через запятую)"
                  value={formData.skills?.join(', ') || ''}
                  onChange={handleSkillsChange}
                  disabled={!isEditing}
                />
                <Input
                  type="number"
                  name="salary_expectation"
                  placeholder="Ожидаемая зарплата"
                  value={formData.salary_expectation || ''}
                  onChange={handleSalaryChange}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  Контакты
                </h3>
                <Input
                  type="url"
                  name="portfolio_url"
                  placeholder="Ссылка на портфолио"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  type="url"
                  name="resume_url"
                  placeholder="Ссылка на резюме"
                  value={formData.resume_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {isEditing ? (
                <Button onClick={saveProfile} className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Сохранить
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  {user.city && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin size={16} />
                      <span>{user.city}</span>
                    </div>
                  )}
                  {user.experience && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase size={16} />
                      <span>{user.experience}</span>
                    </div>
                  )}
                  {user.achievement && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Trophy size={16} />
                      <span>{user.achievement}</span>
                    </div>
                  )}
                  {user.salary_expectation && (
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign size={16} />
                      <span>{user.salary_expectation.toLocaleString()} ₽</span>
                    </div>
                  )}
                  {user.portfolio_url && (
                    <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Link size={16} />
                      Портфолио
                    </a>
                  )}
                  {user.resume_url && (
                    <a href={user.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <FileText size={16} />
                      Резюме
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Video Recording Modal */}
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          onVideoSaved={handleVideoSaved}
          title="Записать видео-резюме"
          maxDuration={90}
        />
      </div>
    </div>
  );
};

export default Profile;
