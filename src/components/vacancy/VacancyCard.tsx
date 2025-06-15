
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Users, User } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

interface VacancyCardProps {
  vacancy: Vacancy;
  onEdit: (vacancy: Vacancy) => void;
  onDelete: (vacancyId: string) => void;
  onViewCandidates: (vacancy: Vacancy) => void;
  onViewMatches: (vacancy: Vacancy) => void;
}

const VacancyCard: React.FC<VacancyCardProps> = ({
  vacancy,
  onEdit,
  onDelete,
  onViewCandidates,
  onViewMatches
}) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{vacancy.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{vacancy.city}</span>
          {vacancy.salary_min && vacancy.salary_max && (
            <span>• {vacancy.salary_min}₽ - {vacancy.salary_max}₽</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-3 line-clamp-2">{vacancy.description}</p>
        
        {vacancy.team_lead_name && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} />
              <span className="font-medium">Рекрутер:</span>
              <span>{vacancy.team_lead_name}</span>
              {vacancy.team_lead_avatar && (
                <span className="text-blue-600">{vacancy.team_lead_avatar}</span>
              )}
            </div>
          </div>
        )}
        
        {vacancy.skills_required && vacancy.skills_required.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {vacancy.skills_required.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {vacancy.skills_required.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{vacancy.skills_required.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewCandidates(vacancy)}
            className="flex items-center gap-1"
          >
            <Eye size={14} />
            Кандидаты
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewMatches(vacancy)}
            className="flex items-center gap-1"
          >
            <Users size={14} />
            Мэтчи
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(vacancy)}
            className="flex items-center gap-1"
          >
            <Edit size={14} />
            Изменить
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(vacancy.id)}
            className="flex items-center gap-1"
          >
            <Trash2 size={14} />
            Удалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VacancyCard;
