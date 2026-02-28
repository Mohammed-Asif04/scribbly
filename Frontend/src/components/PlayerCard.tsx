import React from "react";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  pl: {
    id: string | number;
    name: string;
    avatar: string;
    points: number;
  };
  rank?: number;
  curruser?: boolean;
  playerDrawing?: { id: string | number } | null;
}

const rankStyles: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-600",
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  pl,
  rank = 0,
  curruser = false,
  playerDrawing = null,
}) => {
  const isDrawing = playerDrawing && playerDrawing.id === pl.id;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent",
        isDrawing
          ? "bg-purple-100 border-purple-300"
          : "hover:bg-gray-50"
      )}
    >
      {/* Rank */}
      <span
        className={cn(
          "text-lg font-extrabold w-8 text-center shrink-0",
          rankStyles[rank ?? 0] || "text-gray-500"
        )}
      >
        #{rank}
      </span>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-purple-300 ring-offset-1">
        <img
          src={pl.avatar}
          alt={`${pl.name}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name & Points */}
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={cn(
            "font-semibold text-sm truncate",
            curruser ? "text-purple-600" : "text-gray-800"
          )}
        >
          {pl.name}
          {curruser && (
            <span className="ml-1 text-xs text-purple-400 font-normal">
              (You)
            </span>
          )}
        </span>
        <span className="text-xs text-gray-500">{pl.points} points</span>
      </div>

      {/* Drawing indicator */}
      {isDrawing && (
        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium shrink-0">
          ✏️ 
        </span>
      )}
    </div>
  );
};

export default PlayerCard;
