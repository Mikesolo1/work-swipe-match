
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Filter, X, MapPin, DollarSign, Star } from 'lucide-react';
import type { SwipeFilters } from '@/types/filters';

interface SwipeFiltersProps {
  userRole?: string;
  onFiltersChange: (filters: SwipeFilters) => void;
  initialFilters?: SwipeFilters;
  availableCities?: string[];
  popularSkills?: string[];
}

const SwipeFilters: React.FC<SwipeFiltersProps> = ({ 
  userRole, 
  onFiltersChange, 
  initialFilters = {},
  availableCities = [],
  popularSkills = []
}) => {
  const [filters, setFilters] = useState<SwipeFilters>({
    city: initialFilters.city || '',
    skills: initialFilters.skills || [],
    salaryMin: initialFilters.salaryMin || 0,
    salaryMax: initialFilters.salaryMax || 500000,
    hasVideo: initialFilters.hasVideo || false,
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const defaultCities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
    'Нижний Новгород', 'Казань', 'Челябинск', 'Омск', 'Самара', 'Ростов-на-Дону'
  ];

  const defaultSkills = [
    'JavaScript', 'React', 'Python', 'Java', 'Node.js', 'TypeScript',
    'Vue.js', 'Angular', 'PHP', 'C#', 'SQL', 'MongoDB', 'Docker',
    'Kubernetes', 'AWS', 'Git', 'HTML/CSS', 'Redux', 'GraphQL', 'REST API'
  ];

  // Используем переданные данные или значения по умолчанию
  const citiesToShow = availableCities.length > 0 ? availableCities.slice(0, 10) : defaultCities;
  const skillsToShow = popularSkills.length > 0 ? popularSkills.slice(0, 10) : defaultSkills.slice(0, 10);

  const handleAddSkill = useCallback((skill: string) => {
    if (skill && !filters.skills?.includes(skill)) {
      const newSkills = [...(filters.skills || []), skill];
      updateFilters({ skills: newSkills });
    }
    setSkillInput('');
  }, [filters.skills]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    const newSkills = filters.skills?.filter(skill => skill !== skillToRemove) || [];
    updateFilters({ skills: newSkills });
  }, [filters.skills]);

  const updateFilters = useCallback((newFilters: Partial<SwipeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    const emptyFilters: SwipeFilters = {
      city: '',
      skills: [],
      salaryMin: 0,
      salaryMax: 500000,
      hasVideo: false
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  }, [onFiltersChange]);

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value !== '';
    if (typeof value === 'number') return value !== 0 && value !== 500000;
    return false;
  }).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
        >
          <Filter size={16} />
          Фильтры
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            Настройка поиска
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Очистить все
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Город */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <MapPin size={16} />
              Город
            </Label>
            <div className="flex flex-wrap gap-2">
              {citiesToShow.map(city => (
                <button
                  key={city}
                  onClick={() => updateFilters({ 
                    city: filters.city === city ? '' : city 
                  })}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.city === city
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Зарплата */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign size={16} />
              {userRole === 'seeker' ? 'Зарплатные ожидания' : 'Бюджет на позицию'}
            </Label>
            <div className="space-y-4">
              <Slider
                value={[filters.salaryMin || 0, filters.salaryMax || 500000]}
                onValueChange={([min, max]) => updateFilters({ salaryMin: min, salaryMax: max })}
                max={500000}
                min={0}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{(filters.salaryMin || 0).toLocaleString()} ₽</span>
                <span>{(filters.salaryMax || 500000).toLocaleString()} ₽</span>
              </div>
            </div>
          </div>

          {/* Навыки */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Навыки</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Добавить навык..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSkill(skillInput);
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleAddSkill(skillInput)}
                  size="sm"
                  disabled={!skillInput.trim()}
                >
                  +
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skillsToShow.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleAddSkill(skill)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      filters.skills?.includes(skill)
                        ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={filters.skills?.includes(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {filters.skills && filters.skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Выбранные навыки:</p>
                  <div className="flex flex-wrap gap-2">
                    {filters.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Видео */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Star size={16} />
              <span className="text-sm font-medium">
                {userRole === 'seeker' ? 'Только вакансии с видео' : 'Только с видео-резюме'}
              </span>
            </div>
            <Switch
              checked={filters.hasVideo || false}
              onCheckedChange={(checked) => updateFilters({ hasVideo: checked })}
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={() => setIsOpen(false)} 
              className="w-full"
              size="lg"
            >
              Применить фильтры
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SwipeFilters;
