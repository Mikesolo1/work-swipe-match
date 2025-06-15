
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Briefcase, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

type User = Tables<'users'>;

interface VacancyCandidatesProps {
  vacancy: Vacancy;
  onBack: () => void;
}

const VacancyCandidates: React.FC<VacancyCandidatesProps> = ({ vacancy, onBack }) => {
  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ['vacancy-candidates', vacancy.id],
    queryFn: async (): Promise<User[]> => {
      console.log('Fetching candidates for vacancy:', vacancy.id);
      
      // Получаем кандидатов с помощью функции базы данных
      const { data, error } = await supabase.rpc('get_filtered_seekers_for_employer', {
        p_user_id: vacancy.employer_id,
        p_city: vacancy.city,
        p_skills: vacancy.skills_required || [],
        p_salary_min: vacancy.salary_min,
        p_salary_max: vacancy.salary_max,
        p_has_video: null
      });

      if (error) {
        console.error('Error fetching candidates:', error);
        throw error;
      }

      // Фильтруем кандидатов, исключая тех, кто уже получил свайп от работодателя
      const { data: existingSwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('swiper_id', vacancy.employer_id)
        .eq('target_type', 'user');

      if (swipesError) {
        console.error('Error fetching swipes:', swipesError);
        throw swipesError;
      }

      const swipedUserIds = new Set(existingSwipes?.map(s => s.target_id) || []);
      const filteredCandidates = (data || []).filter(candidate => !swipedUserIds.has(candidate.id));

      return filteredCandidates;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" text="Загружаем кандидатов..." />
      </div>
    );
  }

  if (error) {
    console.error('VacancyCandidates error:', error);
    return (
      <EmptyState
        icon="❌"
        title="Ошибка загрузки"
        description="Не удалось загрузить кандидатов"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-white">Кандидаты для "{vacancy.title}"</h2>
          <p className="text-white/70 text-sm">{candidates.length} подходящих кандидатов</p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Нет подходящих кандидатов"
          description="Пока нет кандидатов, которые подходят для этой вакансии"
        />
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={candidate.avatar_url || ''} />
                  <AvatarFallback>
                    {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">
                      {candidate.first_name} {candidate.last_name}
                    </h3>
                    {candidate.username && (
                      <span className="text-sm text-gray-500">@{candidate.username}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {candidate.city && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{candidate.city}</span>
                      </div>
                    )}
                    {candidate.salary_expectation && (
                      <div className="flex items-center gap-1">
                        <Briefcase size={14} />
                        <span>от {candidate.salary_expectation}₽</span>
                      </div>
                    )}
                  </div>

                  {candidate.experience && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {candidate.experience}
                    </p>
                  )}

                  {candidate.achievement && (
                    <div className="flex items-start gap-1 mb-3">
                      <Star size={14} className="text-yellow-500 mt-0.5" />
                      <p className="text-sm text-gray-700 line-clamp-1">
                        {candidate.achievement}
                      </p>
                    </div>
                  )}

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VacancyCandidates;
