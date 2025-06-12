
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProfileSetupStep from './steps/ProfileSetupStep';
import VacancyCreationStep from './steps/VacancyCreationStep';
import SwipeGuideStep from './steps/SwipeGuideStep';
import MatchesGuideStep from './steps/MatchesGuideStep';
import WelcomeStep from './steps/WelcomeStep';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'seeker' | 'employer' | null;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, userRole }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'welcome', component: WelcomeStep, title: 'Добро пожаловать!' },
    { id: 'profile', component: ProfileSetupStep, title: 'Настройка профиля' },
    ...(userRole === 'employer' ? [{ id: 'vacancy', component: VacancyCreationStep, title: 'Создание вакансий' }] : []),
    { id: 'swipe', component: SwipeGuideStep, title: 'Как работает поиск' },
    { id: 'matches', component: MatchesGuideStep, title: 'Раздел матчей' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{steps[currentStep]?.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-white hover:bg-white/20"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="mt-2">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full flex-1 ${
                      index <= currentStep ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {CurrentStepComponent && <CurrentStepComponent userRole={userRole} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Назад
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} из {steps.length}
            </span>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {currentStep === steps.length - 1 ? 'Готово' : 'Далее'}
              {currentStep !== steps.length - 1 && <ChevronRight size={16} />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
