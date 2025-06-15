
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import VideoModal from '@/components/video/VideoModal';
import VideoPlayer from '@/components/video/VideoPlayer';

const ProfileSeekerForm = ({ user }: { user: any }) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    city: user?.city || '',
    skills: user?.skills?.join(', ') || '',
    salary_expectation: user?.salary_expectation?.toString() || '',
    experience: user?.experience || '',
    achievement: user?.achievement || '',
    portfolio_url: user?.portfolio_url || '',
    resume_url: user?.resume_url || '',
    video_resume_url: user?.video_resume_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      skills: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const updateData: any = {
        ...formData,
        skills: skillsArray,
        salary_expectation: formData.salary_expectation ? parseInt(formData.salary_expectation) : null,
      };
      await updateProfile(updateData);
      toast({ title: 'Успешно!', description: 'Профиль обновлен' });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const handleVideoSaved = async (videoUrl: string) => {
    setFormData(prev => ({
      ...prev,
      video_resume_url: videoUrl,
    }));
    await updateProfile({ video_resume_url: videoUrl });
    toast({ title: "Успешно!", description: "Видео-резюме сохранено" });
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-bold mb-2">Профиль соискателя</h1>
      {formData.video_resume_url ? (
        <VideoPlayer src={formData.video_resume_url} size="large" className="mb-4" />
      ) : (
        <div className="mb-4 text-sm text-gray-500">Нет видео-резюме</div>
      )}
      <Button onClick={() => setShowVideoModal(true)} variant="outline" className="mb-4">
        {formData.video_resume_url ? 'Перезаписать видео' : 'Записать видео-резюме'}
      </Button>
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onVideoSaved={handleVideoSaved}
        title="Записать видео-резюме"
        maxDuration={90}
      />
      <div className="space-y-4">
        <Input label="Имя" name="first_name" value={formData.first_name} onChange={handleChange} disabled={!isEditing} />
        <Input label="Фамилия" name="last_name" value={formData.last_name} onChange={handleChange} disabled={!isEditing} />
        <Input label="Город" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing} />
        <Input label="Навыки (через запятую)" name="skills" value={formData.skills} onChange={handleSkillsChange} disabled={!isEditing} />
        <Input label="Ожидаемая зарплата" name="salary_expectation" type="number" value={formData.salary_expectation} onChange={handleChange} disabled={!isEditing} />
        <Textarea label="Опыт работы" name="experience" value={formData.experience} onChange={handleChange} disabled={!isEditing} />
        <Textarea label="Главное достижение" name="achievement" value={formData.achievement} onChange={handleChange} disabled={!isEditing} />
        <Input label="Ссылка на портфолио" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} disabled={!isEditing} />
        <Input label="Ссылка на резюме" name="resume_url" value={formData.resume_url} onChange={handleChange} disabled={!isEditing} />
      </div>
      <div className="flex gap-4 mt-4">
        {isEditing ? (
          <>
            <Button onClick={handleSave} className="bg-green-500 text-white">Сохранить</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Отмена</Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white">Редактировать</Button>
        )}
      </div>
    </div>
  );
};
export default ProfileSeekerForm;
