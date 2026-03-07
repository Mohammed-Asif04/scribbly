import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Player } from "@/types";

interface WordSelectionOverlayProps {
  playerDrawing: Player;
  isCurrentUser: boolean;
  words: string[];
  onWordSelect: (word: string) => void;
}

const WordSelectionOverlay: React.FC<WordSelectionOverlayProps> = ({
  playerDrawing,
  isCurrentUser,
  words,
  onWordSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="bg-white/95 shadow-2xl">
        <CardContent className="p-8">
          {isCurrentUser ? (
            <>
              <h3 className="text-lg font-bold text-purple-700 mb-4 text-center">
                Choose a word to draw:
              </h3>
              <div className="flex gap-4">
                {words.map((w, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => onWordSelect(w)}
                    className="text-sm font-semibold px-6 py-3 border-purple-300 hover:bg-purple-100 hover:border-purple-500 transition-colors"
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-lg font-semibold text-gray-700 text-center">
              ✏️ {playerDrawing.name} is choosing a word...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WordSelectionOverlay;
