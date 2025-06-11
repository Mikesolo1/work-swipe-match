
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MapPin, DollarSign, Building2, User } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeCardProps {
  card: any;
  onSwipe?: (direction: 'like' | 'dislike') => void;
  style?: any;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ card, onSwipe, style = {} }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > 100 || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'like' : 'dislike';
      onSwipe?.(direction);
    } else {
      x.set(0);
    }
  };

  const handleButtonClick = (direction: 'like' | 'dislike') => {
    onSwipe?.(direction);
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x,
        rotate,
        opacity,
        ...style
      }}
      drag={onSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      <Card className="h-full shadow-xl border-0">
        {card.type === 'vacancy' ? (
          <>
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-white" size={24} />
              </div>
              <CardTitle className="text-xl text-gray-800">{card.title}</CardTitle>
              <p className="text-gray-600 font-medium">{card.company}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-center leading-relaxed">
                {card.description}
              </p>
              
              <div className="flex items-center justify-center gap-2 bg-green-50 p-3 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
                <span className="font-semibold text-green-700">
                  {card.salary} ₽
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Тимлид:</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={card.teamLead.avatar} />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-800">
                    {card.teamLead.name}
                  </span>
                </div>
              </div>

              {onSwipe && (
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-2 border-red-200 hover:bg-red-50 text-red-600"
                    onClick={() => handleButtonClick('dislike')}
                  >
                    <X size={24} />
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                    onClick={() => handleButtonClick('like')}
                  >
                    <Heart size={24} />
                  </Button>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center pb-4">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={card.avatar} />
                <AvatarFallback>
                  <User size={24} />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-gray-800">{card.name}</CardTitle>
              {card.city && (
                <div className="flex items-center justify-center gap-1 text-gray-600">
                  <MapPin size={16} />
                  <span>{card.city}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {card.skills && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Навыки:</p>
                  <div className="flex flex-wrap gap-2">
                    {card.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Опыт:</p>
                <p className="text-gray-700">{card.experience}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Достижение:</p>
                <p className="text-gray-700">{card.achievement}</p>
              </div>

              {card.salary_expectation && (
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                  <DollarSign className="text-green-600" size={20} />
                  <span className="font-semibold text-green-700">
                    {card.salary_expectation.toLocaleString()} ₽
                  </span>
                </div>
              )}

              {onSwipe && (
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-2 border-red-200 hover:bg-red-50 text-red-600"
                    onClick={() => handleButtonClick('dislike')}
                  >
                    <X size={24} />
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                    onClick={() => handleButtonClick('like')}
                  >
                    <Heart size={24} />
                  </Button>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default SwipeCard;
