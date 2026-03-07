import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlayerCard from "@/components/PlayerCard";
import type { Player } from "@/types";

interface PlayerListSidebarProps {
  allPlayers: Player[];
  currentUserId?: string;
  playerDrawing: Player | null;
}

const PlayerListSidebar: React.FC<PlayerListSidebarProps> = ({
  allPlayers,
  currentUserId,
  playerDrawing,
}) => {
  return (
    <Card className="w-56 shrink-0 backdrop-blur-sm bg-white/90 shadow-lg self-start transition-all duration-300">
      <CardHeader className="pb-2 px-3 pt-4">
        <CardTitle className="text-base text-purple-600 text-center">
          Players
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="flex flex-col gap-1">
          {[...allPlayers].sort((a, b) => b.points - a.points).map((player, index) => (
            <PlayerCard
              key={player.id}
              pl={player}
              rank={index + 1}
              curruser={player.id === currentUserId}
              playerDrawing={playerDrawing}
            />
          ))}
          {allPlayers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Connecting...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerListSidebar;
