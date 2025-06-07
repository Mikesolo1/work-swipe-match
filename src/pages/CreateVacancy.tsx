
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, X, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCities } from '@/hooks/useCities';
import { useJobCategories } from '@/hooks/useJobCategories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateVacancy = () => {
  const { user } = useAuth();
  const { data: cities } = useCities();
  const { data: jobCategories } = useJobCategories();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    salary_min: '',
    salary_max: '',
    team_lead_name: '',
    team_lead_avatar: '',
    skills_required: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const addCategoryAsSkill = () => {
    if (selectedCategory && !formData.skills_required.includes(selectedCategory)) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, selectedCategory]
      });
      setSelectedCategory('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const vacancyData = {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        employer_id: user.id,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        team_lead_name: formData.team_lead_name || null,
        team_lead_avatar: formData.team_lead_avatar || null,
        skills_required: formData.skills_required
      };

      const { error } = await supabase
        .from('vacancies')
        .insert(vacancyData);

      if (error) {
        console.error('Error creating vacancy:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось создать вакансию. Попробуйте еще раз.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Успешно!",
        description: "Вакансия создана и доступна для просмотра соискателями."
      });

      navigate('/swipe');
    } catch (error) {
      console.error('Error creating vacancy:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании вакансии.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="p-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/swipe')}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Создать вакансию</h1>
            <p className="text-gray-600">Привлеките лучших кандидатов</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={20} />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название вакансии *
                  </label>
                  <Input
                    placeholder="Frontend разработчик"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание вакансии *
                  </label>
                  <Textarea
                    placeholder="Опишите обязанности, требования и условия работы..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Город *
                  </label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Зарплата от
                    </label>
                    <Input
                      placeholder="100000"
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({...formData, salary_min: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Зарплата до
                    </label>
                    <Input
                      placeholder="200000"
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({...formData, salary_max: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Тимлид (опционально)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя тимлида
                  </label>
                  <Input
                    placeholder="Анна Иванова"
                    value={formData.team_lead_name}
                    onChange={(e) => setFormData({...formData, team_lead_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Аватар тимлида (URL)
                  </label>
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.team_lead_avatar}
                    onChange={(e) => setFormData({...formData, team_lead_avatar: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Требуемые навыки</CardTitle>
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
                    <Button onClick={addCategoryAsSkill} size="sm" disabled={!selectedCategory} type="button">
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
                      placeholder="React, TypeScript, ..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1"
                    />
                    <Button onClick={addSkill} size="sm" type="button">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => removeSkill(skill)} type="button">
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
            transition={{ delay: 0.4 }}
          >
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.city}
            >
              {isSubmitting ? 'Создание...' : 'Создать вакансию'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateVacancy;
