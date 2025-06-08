
import React, { useImperativeHandle, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, User, Building2, ExternalLink } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

type UserProfile = Tables<'users'>;

interface TinderCardProps {
  target: Vacancy | UserProfile;
  isVacancy: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  preventSwipe?: string[];
}

const SwipeTinderCard = React.forwardRef<any, TinderCardProps>(
  ({ target, isVacancy, onSwipe, preventSwipe = [] }, ref) => {
    const [lastDirection, setLastDirection] = useState<string>();

    const swiped = (direction: string) => {
      console.log('removing: ' + target.id + ' to the ' + direction);
      setLastDirection(direction);
      onSwipe(direction as 'left' | 'right');
    };

    const outOfFrame = (id: string, idx: number) => {
      console.log(id + ' left the screen! ' + ' order: ' + idx);
    };

    return (
      <TinderCard
        ref={ref}
        className="absolute inset-0"
        onSwipe={swiped}
        onCardLeftScreen={() => outOfFrame(target.id, 0)}
        preventSwipe={preventSwipe}
        swipeRequirementType="position"
        swipeThreshold={100}
      >
        <Card className="h-full bg-white shadow-lg cursor-grab active:cursor-grabbing">
          {isVacancy ? (
            <>
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                    <Building2 className="text-white" size={24} />
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{(target as Vacancy).title}</CardTitle>
                {(target as Vacancy).employer?.company && (
                  <p className="text-gray-600">{(target as Vacancy).employer?.company}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{(target as Vacancy).description}</p>
                
                {((target as Vacancy).salary_min || (target as Vacancy).salary_max) && (
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign size={16} />
                    <span className="font-medium">
                      {(target as Vacancy).salary_min && (target as Vacancy).salary_max 
                        ? `${(target as Vacancy).salary_min?.toLocaleString()} - ${(target as Vacancy).salary_max?.toLocaleString()} ₽`
                        : (target as Vacancy).salary_min 
                          ? `от ${(target as Vacancy).salary_min?.toLocaleString()} ₽`
                          : `до ${(target as Vacancy).salary_max?.toLocaleString()} ₽`
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{target.city}</span>
                </div>

                {(target as Vacancy).skills_required && (target as Vacancy).skills_required.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Требуемые навыки:</p>
                    <div className="flex flex-wrap gap-2">
                      {(target as Vacancy).skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(target as Vacancy).team_lead_name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={(target as Vacancy).team_lead_avatar} />
                      <AvatarFallback>{(target as Vacancy).team_lead_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{(target as Vacancy).team_lead_name}</p>
                      <p className="text-xs text-gray-500">Тимлид</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-4">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={(target as UserProfile).avatar_url} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {(target as UserProfile).first_name} {(target as UserProfile).last_name}
                </CardTitle>
                {(target as UserProfile).username && (
                  <p className="text-gray-500">@{(target as UserProfile).username}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {(target as UserProfile).city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{(target as UserProfile).city}</span>
                  </div>
                )}

                {(target as UserProfile).salary_expectation && (
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign size={16} />
                    <span className="font-medium">от {(target as UserProfile).salary_expectation.toLocaleString()} ₽</span>
                  </div>
                )}

                {(target as UserProfile).experience && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Опыт работы:</p>
                    <p className="text-gray-600">{(target as UserProfile).experience}</p>
                  </div>
                )}

                {(target as UserProfile).achievement && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Главное достижение:</p>
                    <p className="text-gray-600">{(target as UserProfile).achievement}</p>
                  </div>
                )}

                {(target as UserProfile).skills && (target as UserProfile).skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Навыки:</p>
                    <div className="flex flex-wrap gap-2">
                      {(target as UserProfile).skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {((target as UserProfile).resume_url || (target as UserProfile).portfolio_url) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Ссылки:</p>
                    <div className="flex flex-wrap gap-2">
                      {(target as UserProfile).resume_url && (
                        <a 
                          href={(target as UserProfile).resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                          Резюме
                        </a>
                      )}
                      {(target as UserProfile).portfolio_url && (
                        <a 
                          href={(target as UserProfile).portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                          Портфолио
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </TinderCard>
    );
  }
);

SwipeTinderCard.displayName = 'SwipeTinderCard';

export default SwipeTinderCard;
