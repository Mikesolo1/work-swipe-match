
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Eye, Edit, Trash2, MapPin, DollarSign, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'>;
type VacancyMatch = Tables<'matches'> & {
  participant_a: Tables<'users'>;
  participant_b: Tables<'users'>;
  vacancy: Tables<'vacancies'>;
};

const VacancyManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);

  const { data: vacancies, isLoading: vacanciesLoading } = useQuery({
    queryKey: ['my-vacancies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vacancy[];
    },
    enabled: !!user && user.role === 'employer',
  });

  const { data: vacancyMatches } = useQuery({
    queryKey: ['vacancy-matches', selectedVacancy],
    queryFn: async () => {
      if (!selectedVacancy) return [];
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          participant_a:users!matches_participant_a_fkey(*),
          participant_b:users!matches_participant_b_fkey(*),
          vacancy:vacancies(*)
        `)
        .eq('vacancy_id', selectedVacancy);

      if (error) throw error;
      return data as VacancyMatch[];
    },
    enabled: !!selectedVacancy,
  });

  const deleteVacancy = async (vacancyId: string) => {
    const { error } = await supabase
      .from('vacancies')
      .delete()
      .eq('id', vacancyId);

    if (!error) {
      window.location.reload();
    }
  };

  if (user?.role !== 'employer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p>Доступ запрещен. Эта страница только для работодателей.</p>
      </div>
    );
  }

  if (vacanciesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedVacancy) {
    const vacancy = vacancies?.find(v => v.id === selectedVacancy);
    const candidates = vacancyMatches?.map(match => 
      match.participant_a.id === user.id ? match.participant_b : match.participant_a
    ) || [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
        <div className="p-4 max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <Button 
              variant="outline" 
              onClick={() => setSelectedVacancy(null)}
              className="mb-4"
            >
              ← Назад к вакансиям
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{vacancy?.title}</h1>
            <p className="text-gray-600">Кандидаты: {candidates.length}</p>
          </motion.div>

          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={candidate.avatar_url} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{candidate.first_name} {candidate.last_name}</h3>
                        {candidate.username && <p className="text-sm text-gray-500">@{candidate.username}</p>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {candidate.city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} />
                        <span className="text-sm">{candidate.city}</span>
                      </div>
                    )}
                    
                    {candidate.salary_expectation && (
                      <div className="flex items-center gap-2 text-green-600">
                        <DollarSign size={14} />
                        <span className="text-sm">от {candidate.salary_expectation.toLocaleString()} ₽</span>
                      </div>
                    )}

                    {candidate.skills && candidate.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Навыки:</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{candidate.skills.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {candidate.experience && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Опыт:</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{candidate.experience}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {candidates.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Пока нет кандидатов для этой вакансии</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="p-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Мои вакансии</h1>
          <p className="text-gray-600">Управление вакансиями и просмотр кандидатов</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            onClick={() => navigate('/create-vacancy')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="mr-2" size={16} />
            Создать новую вакансию
          </Button>
        </motion.div>

        <div className="space-y-4">
          {vacancies?.map((vacancy, index) => (
            <motion.div
              key={vacancy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{vacancy.title}</CardTitle>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} />
                    <span className="text-sm">{vacancy.city}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700 text-sm line-clamp-2">{vacancy.description}</p>
                  
                  {(vacancy.salary_min || vacancy.salary_max) && (
                    <div className="flex items-center gap-2 text-green-600">
                      <DollarSign size={14} />
                      <span className="text-sm">
                        {vacancy.salary_min && vacancy.salary_max 
                          ? `${vacancy.salary_min.toLocaleString()} - ${vacancy.salary_max.toLocaleString()} ₽`
                          : vacancy.salary_min 
                            ? `от ${vacancy.salary_min.toLocaleString()} ₽`
                            : `до ${vacancy.salary_max?.toLocaleString()} ₽`
                        }
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedVacancy(vacancy.id)}
                      className="flex-1"
                    >
                      <Eye className="mr-1" size={14} />
                      Кандидаты
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/create-vacancy?edit=${vacancy.id}`)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteVacancy(vacancy.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {vacancies?.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">У вас пока нет вакансий</p>
                <Button onClick={() => navigate('/create-vacancy')}>
                  Создать первую вакансию
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default VacancyManagement;
