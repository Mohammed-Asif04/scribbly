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
        "flex items-center gap-2 pl-3 pr-1 py-2 rounded-lg transition-colors border border-transparent relative",
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

      {/* Avatar + Drawing indicator grouped together */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        {isDrawing && (
          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
            ✏️
          </span>
        )}
        <div className="w-12 h-12 flex items-center justify-center">
          <img
            src={pl.avatar}
            alt={`${pl.name}'s avatar`}
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
