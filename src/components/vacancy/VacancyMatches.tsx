
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Clock, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Vacancy, Match } from '@/types/entities';

interface VacancyMatchesProps {
  vacancy: Vacancy;
  onBack: () => void;
}

const VacancyMatches: React.FC<VacancyMatchesProps> = ({ vacancy, onBack }) => {
  const { data: matches = [], isLoading, error } = useQuery({
    queryKey: ['vacancy-matches', vacancy.id],
    queryFn: async (): Promise<Match[]> => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          participant_a_user:users!matches_participant_a_fkey(*),
          participant_b_user:users!matches_participant_b_fkey(*),
          vacancy:vacancies(*)
        `)
        .eq('vacancy_id', vacancy.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(match => {
        const now = new Date();
        const expiresAt = new Date(match.expires_at);
        const timeLeft = expiresAt.getTime() - now.getTime();

        return {
          ...match,
          isExpired: timeLeft <= 0,
          timeLeft: Math.max(0, timeLeft),
        };
      });
    },
  });

  const formatTimeLeft = (timeLeft: number) => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" text="Загружаем мэтчи..." />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="❌"
        title="Ошибка загрузки"
        description="Не удалось загрузить мэтчи"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Мэтчи для "{vacancy.title}"</h2>
          <p className="text-gray-600 text-sm">{matches.length} мэтчей</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon="💫"
          title="Нет мэтчей"
          description="Пока нет мэтчей для этой вакансии"
        />
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const candidate = match.participant_a === vacancy.employer_id 
              ? match.participant_b_user 
              : match.participant_a_user;
            
            const timeLeft = formatTimeLeft(match.timeLeft || 0);
            const isExpired = match.isExpired || false;

            return (
              <Card key={match.id} className={`p-4 ${isExpired ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={candidate?.avatar_url || ''} />
                    <AvatarFallback>
                      {candidate?.first_name?.[0]}{candidate?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {candidate?.first_name} {candidate?.last_name}
                      </h3>
                      {!isExpired && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>
                            {timeLeft.hours > 0 && `${timeLeft.hours}ч `}
                            {timeLeft.minutes}м
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      {candidate?.city && <span>{candidate.city}</span>}
                      {candidate?.salary_expectation && (
                        <span>• от {candidate.salary_expectation}₽</span>
                      )}
                    </div>

                    {candidate?.experience && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {candidate.experience}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {candidate?.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {!isExpired && (
                        <Button size="sm" className="ml-auto">
                          <MessageCircle size={14} className="mr-1" />
                          Написать
                        </Button>
                      )}
                    </div>

                    {isExpired && (
                      <Badge variant="destructive" className="mt-2">
                        Мэтч истек
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VacancyMatches;
