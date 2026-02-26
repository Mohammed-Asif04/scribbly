import React, { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Card, CardContent } from "@/components/ui/card";

interface WordBarProps {
  showClock: boolean;
  wordLen: number;
  gameStarted: boolean;
  showWords: boolean;
  currentUserDrawing: boolean;
  selectedWord: string | null;
  round?: number;
  totalRounds?: number;
  duration?: number;
}

const WordBar: React.FC<WordBarProps> = ({
  showClock,
  wordLen,
  gameStarted,
  showWords,
  currentUserDrawing,
  selectedWord,
  round = 1,
  totalRounds = 3,
  duration = 60,
}) => {
  const [timerKey, setTimerKey] = useState(0);

  // Determine game state text
  const getStateLabel = () => {
    if (!gameStarted) return null;
    if (currentUserDrawing && selectedWord) return "DRAW";
    if (showWords) return "CHOOSING";
    return "GUESS THIS";
  };

  // Render the word display (actual word or underscores)
  const renderWordDisplay = () => {
    if (!gameStarted) return null;

    // Drawing: show the actual word
    if (currentUserDrawing && selectedWord) {
      return (
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-bold tracking-[0.3em] text-purple-700 uppercase">
            {selectedWord}
          </span>
        </div>
      );
    }

    // Choosing: show nothing for the word
    if (showWords) return null;

    // Guessing: show underscores matching word length
    if (wordLen > 0) {
      return (
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-bold tracking-[0.3em] text-foreground">
            {Array.from({ length: wordLen })
              .map(() => "_")
              .join(" ")}
          </span>
          <sup className="text-xs font-semibold text-muted-foreground ml-1">
            {wordLen}
          </sup>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="backdrop-blur-sm bg-white/95 shadow-lg border-2 border-black/10 py-0">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-5">
          {/* Countdown Timer */}
          <div className="shrink-0">
            {showClock ? (
              <CountdownCircleTimer
                key={timerKey}
                isPlaying
                duration={duration}
                size={56}
                strokeWidth={5}
                colors={["#6d28d9", "#2563eb", "#f59e0b", "#dc2626"]}
                colorsTime={[duration, duration * 0.66, duration * 0.33, 0]}
                trailColor="#e5e7eb"
                onComplete={() => {
                  setTimerKey((prev) => prev + 1);
                }}
              >
                {({ remainingTime }) => (
                  <span className="text-lg font-bold text-foreground font-mono">
                    {remainingTime}
                  </span>
                )}
              </CountdownCircleTimer>
            ) : (
              <div className="w-14 h-14 rounded-full border-[5px] border-muted flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground font-mono">
                  —
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-border" />

          {/* Round Info */}
          {gameStarted && (
            <>
              <div className="flex flex-col items-center shrink-0">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Round
                </span>
                <span className="text-lg font-bold text-foreground">
                  {round}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    of {totalRounds}
                  </span>
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-border" />
            </>
          )}

          {/* Game State + Word Display */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            {!gameStarted ? (
              <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                ⏳ Waiting for game to start…
              </span>
            ) : (
              <>
                {getStateLabel() && (
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                    {getStateLabel()}
                  </span>
                )}
                {renderWordDisplay()}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordBar;
