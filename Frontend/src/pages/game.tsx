import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Background from "@/components/Background";
import Canvas from "@/components/Canvas";
import WordBar from "@/components/Wordbar";
import ChatSidebar from "@/components/ChatSidebar";
import GameOver from "@/components/GameOver";
import WordSelectionOverlay from "@/components/WordSelectionOverlay";
import PlayerListSidebar from "@/components/PlayerListSidebar";
import WaitingBanner from "@/components/WaitingBanner";
import { useGameSocket } from "@/hooks/useGameSocket";

const GamePage: React.FC = () => {
  const {
    socket,
    navigate,
    allPlayers,
    currentUserDrawing,
    gameStarted,
    playerDrawing,
    showWords,
    words,
    selectedWord,
    showClock,
    wordLen,
    guessedWord,
    inputMessage,
    setInputMessage,
    allChats,
    round,
    totalRounds,
    remainingTime,
    gameOverData,
    isWaiting,
    handleWordSelect,
    handleSubmitChat,
  } = useGameSocket();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Background />

      {/* Game Over Overlay */}
      {gameOverData && (
        <GameOver
          players={gameOverData.players}
          currentUserId={socket?.id}
          onBackToLobby={() => navigate("/")}
        />
      )}

      {/* Word Selection Overlay */}
      {showWords && playerDrawing && socket && (
        <WordSelectionOverlay
          playerDrawing={playerDrawing}
          isCurrentUser={playerDrawing.id === socket.id}
          words={words}
          onWordSelect={handleWordSelect}
        />
      )}

      <div className="relative z-10 flex flex-col gap-3 w-full max-w-6xl">
        {isWaiting && <WaitingBanner />}

        <WordBar
          showClock={showClock}
          wordLen={wordLen}
          gameStarted={gameStarted}
          showWords={showWords}
          currentUserDrawing={currentUserDrawing}
          selectedWord={selectedWord}
          round={round}
          totalRounds={totalRounds}
          remainingTime={remainingTime}
          isWaiting={isWaiting}
        />

        {/* Players | Canvas | Chat */}
        <div className="flex gap-4 items-stretch h-[540px]">
          <PlayerListSidebar
            allPlayers={allPlayers}
            currentUserId={socket?.id}
            playerDrawing={playerDrawing}
          />

          <Card className="backdrop-blur-sm bg-white/90 shadow-lg flex-1">
            <CardContent className="p-3">
              <Canvas socket={socket} currentUserDrawing={currentUserDrawing} />
            </CardContent>
          </Card>

          <ChatSidebar
            allChats={allChats}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSubmitChat={handleSubmitChat}
            disabled={currentUserDrawing || showWords || !gameStarted || guessedWord || isWaiting}
            sendDisabled={currentUserDrawing || showWords || !gameStarted || guessedWord || isWaiting || !inputMessage.trim()}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
