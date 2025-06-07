
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatchModalProps {
  isOpen: boolean;
  matchData: any;
  onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ isOpen, matchData, onClose }) => {
  if (!matchData) return null;

  const handleTelegramContact = () => {
    // В реальном приложении здесь будет настоящий telegram_id
    const telegramUrl = `https://t.me/user?id=123456789`;
    window.open(telegramUrl, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mb-6"
          >
            <div className="flex justify-center items-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute"
              >
                <Heart className="text-red-500" size={60} fill="currentColor" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-2">
              У вас мэтч! 🎉
            </h2>
            <p className="text-gray-600">
              Взаимный интерес обнаружен
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-lg">
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarImage 
                  src={matchData.type === 'vacancy' ? matchData.teamLead?.avatar : matchData.avatar} 
                />
                <AvatarFallback>
                  <User size={20} />
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-gray-800">
                {matchData.type === 'vacancy' ? matchData.teamLead?.name : matchData.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {matchData.type === 'vacancy' ? matchData.title : matchData.city}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              onClick={handleTelegramContact}
              className="w-full bg-blue-500 hover:bg-blue-600"
              size="lg"
            >
              <MessageCircle size={20} className="mr-2" />
              Написать в Telegram
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Продолжить поиск
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
