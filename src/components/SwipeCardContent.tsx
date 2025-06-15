
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, User, Building2, Link, FileText } from 'lucide-react';
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
      <>
        <CardHeader className="text-center pb-3">
          <div className="flex items-center justify-center mb-3">
            {vacancy.video_url ? (
              <VideoPlayer 
                videoUrl={vacancy.video_url} 
                size="large" 
                showControls={true}
                className="shadow-lg"
              />
            ) : (
              <div className="matchwork-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
            )}
          </div>
          <CardTitle className="text-lg mb-1 leading-tight text-slate-800">{vacancy.title}</CardTitle>
          {vacancy.employer?.company && (
            <p className="text-sm text-slate-500 font-medium">{vacancy.employer?.company}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3 overflow-y-auto">
          <p className="text-sm text-slate-600 line-clamp-3">{vacancy.description}</p>
          
          {(vacancy.salary_min || vacancy.salary_max) && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
              <DollarSign size={14} />
              <span className="font-semibold text-sm">
                {vacancy.salary_min && vacancy.salary_max 
                  ? `${vacancy.salary_min?.toLocaleString()} - ${vacancy.salary_max?.toLocaleString()} ₽`
                  : vacancy.salary_min 
                    ? `от ${vacancy.salary_min?.toLocaleString()} ₽`
                    : `до ${vacancy.salary_max?.toLocaleString()} ₽`
                }
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin size={14} />
            <span className="text-sm">{target.city}</span>
          </div>

          {vacancy.skills_required && vacancy.skills_required.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Требуемые навыки:</p>
              <div className="flex flex-wrap gap-1">
                {vacancy.skills_required.slice(0, 6).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700">{skill}</Badge>
                ))}
                {vacancy.skills_required.length > 6 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-100">+{vacancy.skills_required.length - 6}</Badge>
                )}
              </div>
            </div>
          )}

          {vacancy.team_lead_name && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={vacancy.team_lead_avatar} />
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">{vacancy.team_lead_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold text-slate-700">{vacancy.team_lead_name}</p>
                <p className="text-xs text-slate-500">Тимлид</p>
              </div>
            </div>
          )}
        </CardContent>
      </>
    );
  } else {
    const user = target as UserProfile;
    return (
      <>
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-3">
            {user.video_resume_url ? (
              <VideoPlayer 
                videoUrl={user.video_resume_url} 
                size="large" 
                showControls={true}
                className="shadow-lg"
              />
            ) : (
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <CardTitle className="text-lg leading-tight text-slate-800">
            {user.first_name} {user.last_name}
          </CardTitle>
          {user.username && (
            <p className="text-sm text-slate-500">@{user.username}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between text-sm">
            {user.city && (
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={12} />
                <span>{user.city}</span>
              </div>
            )}
            {user.salary_expectation && (
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign size={12} />
                <span className="font-semibold">от {user.salary_expectation.toLocaleString()} ₽</span>
              </div>
            )}
          </div>

          {user.experience && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Опыт работы:</p>
              <p className="text-sm text-slate-600 line-clamp-2">{user.experience}</p>
            </div>
          )}

          {user.achievement && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Главное достижение:</p>
              <p className="text-sm text-slate-600 line-clamp-2">{user.achievement}</p>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Навыки:</p>
              <div className="flex flex-wrap gap-1">
                {user.skills.slice(0, 6).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700">{skill}</Badge>
                ))}
                {user.skills.length > 6 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-100">+{user.skills.length - 6}</Badge>
                )}
              </div>
            </div>
          )}

          {(user.resume_url || user.portfolio_url) && (
            <div className="flex gap-2">
              {user.resume_url && (
                <a href={user.resume_url} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                  <FileText size={12} />
                  Резюме
                </a>
              )}
              {user.portfolio_url && (
                <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                  <Link size={12} />
                  Портфолио
                </a>
              )}
            </div>
          )}
        </CardContent>
      </>
    );
  }
};

export default SwipeCardContent;
