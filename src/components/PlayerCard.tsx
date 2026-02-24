// components/PlayerCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/game';

interface PlayerCardProps {
  player: Player;
  isCurrentUser: boolean;
  isDrawing?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  isCurrentUser, 
  isDrawing = false 
}) => {
  return (
    <Card className={`m-2 ${isDrawing ? 'border-green-500 border-2' : ''} ${isCurrentUser ? 'bg-blue-50' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
            {player.avatar || player.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">
              {isCurrentUser ? 'You' : player.name}
            </div>
            <div className="text-xs text-gray-500">
              Score: {player.score || 0}
            </div>
          </div>
          {isDrawing && (
            <Badge variant="secondary" className="text-xs">
              Drawing
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;