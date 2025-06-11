
import React from 'react';
import { Heart, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: 'profile' | 'swipe' | 'matches';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const tabs = [
    { id: 'profile', icon: User, label: 'Профиль', href: '/profile' },
    { id: 'swipe', icon: Heart, label: 'Поиск', href: '/swipe' },
    { id: 'matches', icon: MessageCircle, label: 'Мэтчи', href: '/matches' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-matchwork-border px-4 py-2 shadow-2xl">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <a
                key={tab.id}
                href={tab.href}
                className="flex flex-col items-center py-2 px-3 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'matchwork-gradient-primary text-white shadow-lg' 
                      : 'text-matchwork-text-muted hover:bg-matchwork-primary/10 hover:text-matchwork-primary'
                  }`}
                >
                  <Icon size={20} />
                </motion.div>
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  isActive ? 'text-matchwork-primary' : 'text-matchwork-text-muted'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 matchwork-gradient-primary rounded-full"
                  />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
