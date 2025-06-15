
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, User, Building2, Link, FileText, Clock, Star } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

type UserProfile = Tables<'users'>;

interface SwipeCardContentProps {
  target: Vacancy | UserProfile;
  isVacancy: boolean;
}

const SwipeCardContent: React.FC<SwipeCardContentProps> = ({ target, isVacancy }) => {
  if (isVacancy) {
    const vacancy = target as Vacancy;
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white to-purple-50/30">
        {/* Header с видео или логотипом */}
        <div className="relative">
          {vacancy.video_url ? (
            <div className="w-full h-48 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <VideoPlayer 
                videoUrl={vacancy.video_url} 
                size="large" 
                showControls={true}
                className="shadow-xl border-4 border-white/20"
              />
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Building2 className="text-white" size={32} />
            </div>
          )}
          
          {/* Компания бейдж */}
          {vacancy.employer?.company && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-gray-800 shadow-lg">
                {vacancy.employer.company}
              </Badge>
            </div>
          )}
        </div>

        {/* Контент */}
        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Заголовок и зарплата */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
              {vacancy.title}
            </h2>
            
            {(vacancy.salary_min || vacancy.salary_max) && (
              <div className="flex items-center gap-2 bg-green-50 p-3 rounded-xl border border-green-100">
                <DollarSign size={18} className="text-green-600" />
                <span className="font-bold text-green-700 text-lg">
                  {vacancy.salary_min && vacancy.salary_max 
                    ? `${vacancy.salary_min?.toLocaleString()} - ${vacancy.salary_max?.toLocaleString()} ₽`
                    : vacancy.salary_min 
                      ? `от ${vacancy.salary_min?.toLocaleString()} ₽`
                      : `до ${vacancy.salary_max?.toLocaleString()} ₽`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Локация */}
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
            <MapPin size={16} />
            <span className="text-sm font-medium">{target.city}</span>
          </div>

          {/* Описание */}
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
              {vacancy.description}
            </p>
          </div>

          {/* Навыки */}
          {vacancy.skills_required && vacancy.skills_required.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Star size={14} />
                Требуемые навыки
              </p>
              <div className="flex flex-wrap gap-2">
                {vacancy.skills_required.slice(0, 8).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {skill}
                  </Badge>
                ))}
                {vacancy.skills_required.length > 8 && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    +{vacancy.skills_required.length - 8}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Тимлид */}
          {vacancy.team_lead_name && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                <AvatarImage src={vacancy.team_lead_avatar} />
                <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                  {vacancy.team_lead_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-800">{vacancy.team_lead_name}</p>
                <p className="text-xs text-purple-600 font-medium">Тимлид проекта</p>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    );
  } else {
    const user = target as UserProfile;
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white to-indigo-50/30">
        {/* Header с видео или аватаром */}
        <div className="relative">
          {user.video_resume_url ? (
            <div className="w-full h-48 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <VideoPlayer 
                videoUrl={user.video_resume_url} 
                size="large" 
                showControls={true}
                className="shadow-xl border-4 border-white/20"
              />
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <Avatar className="w-20 h-20 border-4 border-white shadow-xl">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-white text-indigo-600 text-xl font-bold">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Зарплатные ожидания бейдж */}
          {user.salary_expectation && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white shadow-lg flex items-center gap-1">
                <DollarSign size={12} />
                от {user.salary_expectation.toLocaleString()} ₽
              </Badge>
            </div>
          )}
        </div>

        {/* Контент */}
        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Имя и юзернейм */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            {user.username && (
              <p className="text-sm text-indigo-600 font-medium">@{user.username}</p>
            )}
          </div>

          {/* Локация */}
          {user.city && (
            <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
              <MapPin size={16} />
              <span className="text-sm font-medium">{user.city}</span>
            </div>
          )}

          {/* Опыт работы */}
          {user.experience && (
            <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Clock size={14} />
                Опыт работы
              </p>
              <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                {user.experience}
              </p>
            </div>
          )}

          {/* Главное достижение */}
          {user.achievement && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200 space-y-2">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Star size={14} className="text-yellow-600" />
                Главное достижение
              </p>
              <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                {user.achievement}
              </p>
            </div>
          )}

          {/* Навыки */}
          {user.skills && user.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-800">Навыки</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.slice(0, 8).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {skill}
                  </Badge>
                ))}
                {user.skills.length > 8 && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    +{user.skills.length - 8}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Резюме и портфолио */}
          {(user.resume_url || user.portfolio_url) && (
            <div className="flex gap-3 pt-2">
              {user.resume_url && (
                <a 
                  href={user.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <FileText size={14} />
                  Резюме
                </a>
              )}
              {user.portfolio_url && (
                <a 
                  href={user.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  <Link size={14} />
                  Портфолио
                </a>
              )}
            </div>
          )}
        </CardContent>
      </div>
    );
  }
};

export default SwipeCardContent;
