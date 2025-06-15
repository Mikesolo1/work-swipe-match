
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useVacancies, useDeleteVacancy } from '@/hooks/useVacancies';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import VacancyCard from '@/components/vacancy/VacancyCard';
import VacancyCandidates from '@/components/vacancy/VacancyCandidates';
import VacancyMatches from '@/components/vacancy/VacancyMatches';
import { useToast } from '@/hooks/use-toast';
import type { Vacancy } from '@/types/entities';

type ViewMode = 'list' | 'candidates' | 'matches';

const VacancyManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  const { data: vacancies = [], isLoading, error } = useVacancies();
  const deleteVacancyMutation = useDeleteVacancy();

  // Фильтруем только вакансии текущего пользователя
  const userVacancies = vacancies.filter(vacancy => vacancy.employer_id === user?.id);

  const handleCreateVacancy = () => {
    navigate('/create-vacancy');
  };

  const handleEditVacancy = (vacancy: Vacancy) => {
    // TODO: Implement edit functionality
    toast({
      title: "В разработке",
      description: "Функция редактирования вакансии будет добавлена позже",
    });
  };

  const handleDeleteVacancy = async (vacancyId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
      try {
        await deleteVacancyMutation.mutateAsync(vacancyId);
        toast({
          title: "Успешно",
          description: "Вакансия удалена",
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить вакансию",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewCandidates = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setViewMode('candidates');
  };

  const handleViewMatches = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setViewMode('matches');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedVacancy(null);
  };

  const handleBackToSwipe = () => {
    navigate('/swipe');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загружаем вакансии..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
        <EmptyState
          icon="❌"
          title="Ошибка загрузки"
          description="Не удалось загрузить вакансии"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen matchwork-gradient-bg pb-20">
      <div className="p-4 max-w-md mx-auto">
        {viewMode === 'list' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-2">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBackToSwipe}>
                  <ArrowLeft size={16} />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-white">Мои вакансии</h1>
                  <p className="text-white/70 text-sm">{userVacancies.length} вакансий</p>
                </div>
              </div>
              <Button
                onClick={handleCreateVacancy}
                size="sm"
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
              >
                <Plus size={16} className="mr-1" />
                Создать
              </Button>
            </div>

            {/* Vacancies List */}
            {userVacancies.length === 0 ? (
              <EmptyState
                icon="📋"
                title="Нет вакансий"
                description="Создайте свою первую вакансию, чтобы найти подходящих кандидатов"
                actionText="Создать вакансию"
                onAction={handleCreateVacancy}
              />
            ) : (
              <div className="space-y-4">
                {userVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id}
                    vacancy={vacancy}
                    onEdit={handleEditVacancy}
                    onDelete={handleDeleteVacancy}
                    onViewCandidates={handleViewCandidates}
                    onViewMatches={handleViewMatches}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === 'candidates' && selectedVacancy && (
          <VacancyCandidates
            vacancy={selectedVacancy}
            onBack={handleBackToList}
          />
        )}

        {viewMode === 'matches' && selectedVacancy && (
          <VacancyMatches
            vacancy={selectedVacancy}
            onBack={handleBackToList}
          />
        )}
      </div>

      <BottomNav activeTab="swipe" />
    </div>
  );
};

export default VacancyManagement;
