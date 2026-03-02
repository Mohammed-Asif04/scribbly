import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

interface GameOverProps {
  players: Player[];
  currentUserId?: string;
  onBackToLobby: () => void;
}

const positionLabels: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const getPositionLabel = (pos: number) =>
  positionLabels[pos] || `${pos}th`;

const GameOver: React.FC<GameOverProps> = ({
  players,
  currentUserId,
  onBackToLobby,
}) => {
  const winner = players[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 overflow-hidden">
        {/* Winner Header */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-6 pt-8 pb-6 text-center">
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-3">
            Game Over
          </p>
          <h2 className="text-white text-2xl font-bold mb-5">
            {winner?.name} wins!
          </h2>

          {winner && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-yellow-400 ring-offset-2 ring-offset-purple-700 bg-gray-200 mx-auto">
                <img
                  src={winner.avatar}
                  alt={winner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-1">
                <span className="text-white font-bold text-lg">
                  {winner.name}
                </span>
                {currentUserId === winner.id && (
                  <span className="ml-1.5 text-purple-200 text-xs font-normal">
                    (You)
                  </span>
                )}
              </div>
              <span className="text-yellow-300 font-bold text-sm">
                {winner.points} points
              </span>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <CardContent className="px-5 pt-5 pb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Final Standings
          </p>

          <div className="flex flex-col gap-1.5">
            {players.map((player, index) => {
              const position = index + 1;
              const isCurrentUser = currentUserId === player.id;
              const isWinner = position === 1;

              return (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isWinner
                      ? "bg-yellow-50 border border-yellow-200"
                      : isCurrentUser
                        ? "bg-purple-50 border border-purple-200"
                        : "bg-gray-50 border border-transparent"
                  )}
                >
                  {/* Position */}
                  <span
                    className={cn(
                      "text-sm font-extrabold w-8 text-center shrink-0",
                      position === 1 && "text-yellow-500",
                      position === 2 && "text-gray-400",
                      position === 3 && "text-amber-600",
                      position > 3 && "text-gray-500"
                    )}
                  >
                    {getPositionLabel(position)}
                  </span>

                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-offset-1",
                      isWinner ? "ring-yellow-400" : "ring-purple-300"
                    )}
                  >
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={cn(
                        "font-semibold text-sm truncate",
                        isCurrentUser ? "text-purple-600" : "text-gray-800"
                      )}
                    >
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-purple-400 font-normal">
                          (You)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Score */}
                  <span
                    className={cn(
                      "text-sm font-bold shrink-0",
                      isWinner ? "text-yellow-600" : "text-gray-600"
                    )}
                  >
                    {player.points} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* Back to Lobby */}
          <Button
            onClick={onBackToLobby}
            className="w-full mt-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Back to Lobby
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOver;
