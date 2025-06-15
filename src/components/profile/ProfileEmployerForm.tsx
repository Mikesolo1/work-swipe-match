
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProfileEmployerForm = ({ user }: { user: any }) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    company: user?.company || '',
    requisites: user?.requisites || '',
    company_description: user?.company_description || '',
    logo_url: user?.logo_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        ...formData,
      };
      await updateProfile(updateData);
      toast({ title: 'Успешно!', description: 'Профиль компании обновлен' });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-bold mb-2">Профиль работодателя</h1>
      <div className="space-y-4">
        <Input label="Имя" name="first_name" value={formData.first_name} onChange={handleChange} disabled={!isEditing} />
        <Input label="Фамилия" name="last_name" value={formData.last_name} onChange={handleChange} disabled={!isEditing} />
        <Input label="Компания" name="company" value={formData.company} onChange={handleChange} disabled={!isEditing} />
        <Input label="Реквизиты" name="requisites" value={formData.requisites} onChange={handleChange} disabled={!isEditing} />
        <Textarea label="Описание деятельности" name="company_description" value={formData.company_description} onChange={handleChange} disabled={!isEditing} />
        <Input label="Логотип (url)" name="logo_url" value={formData.logo_url} onChange={handleChange} disabled={!isEditing} />
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
export default ProfileEmployerForm;
