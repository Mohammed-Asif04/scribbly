import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Background from "@/components/Background";
import PlayerCard from "@/components/PlayerCard";
import Canvas from "@/components/Canvas";
import WordBar from "@/components/Wordbar";
import ChatSidebar from "@/components/ChatSidebar";
import GameOver from "@/components/GameOver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wordsArray, getWordsArrayLength } from "@/components/word";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

interface ChatMessage {
  sender: string;
  message: string;
  rightGuess: boolean;
  system?: boolean;
  type?: "join" | "leave" | "drawing" | "word-reveal" | "right-guess";
}

const ENDPOINT_LOCAL = "http://localhost:3001/";

const GamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, avatar } = (location.state as { username: string; avatar: number }) || {
    username: "",
    avatar: 1,
  };

  const [socket, setSocket] = useState<Socket | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [currentUserDrawing, setCurrentUserDrawing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerDrawing, setPlayerDrawing] = useState<Player | null>(null);
  const [showWords, setShowWords] = useState(false);
  const [words, setWords] = useState<string[]>(["car", "bike", "cycle"]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showClock, setShowClock] = useState(false);
  const [wordLen, setWordLen] = useState(0);
  const [guessedWord, setGuessedWord] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [allChats, setAllChats] = useState<ChatMessage[]>([]);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [remainingTime, setRemainingTime] = useState(0);
  const [gameOverData, setGameOverData] = useState<{ players: Player[] } | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);

  // Redirect if no username at all
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    // Only redirect if we have NO username from any source
    if (!storedUsername && !username) {
      navigate("/");
    }
  }, []);

  // Connect to socket
  useEffect(() => {
    try {
      const newSocket = io(ENDPOINT_LOCAL);
      setSocket(newSocket);

      window.onbeforeunload = () => {
        localStorage.removeItem("username");
      };

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
        localStorage.removeItem("username");
      };
    } catch (err) {
      console.error("Failed to connect to socket:", err);
    }
  }, []);

  // Send user data when server asks
  useEffect(() => {
    if (!socket) return;
    socket.on("send-user-data", () => {
      socket.emit("recieve-user-data", {
        username,
        avatar: `/avatars/avatar${avatar}.png`,
      });
    });
    return () => { socket.off("send-user-data"); };
  }, [socket, username, avatar]);

  // Listen for updated player list
  useEffect(() => {
    if (!socket) return;
    socket.on("updated-players", (updatedPlayers: Player[]) => {
      setAllPlayers(updatedPlayers);
    });
    return () => { socket.off("updated-players"); };
  }, [socket]);

  // Listen for player join/leave events
  useEffect(() => {
    if (!socket) return;
    socket.on("player-joined", ({ name }: { name: string }) => {
      setAllChats((prev) => [
        { sender: "", message: `${name} joined the match`, rightGuess: false, system: true, type: "join" },
        ...prev,
      ]);
    });
    socket.on("player-left", ({ name }: { name: string }) => {
      setAllChats((prev) => [
        { sender: "", message: `${name} left the match`, rightGuess: false, system: true, type: "leave" },
        ...prev,
      ]);
    });
    return () => {
      socket.off("player-joined");
      socket.off("player-left");
    };
  }, [socket]);

  // Game start/stop events
  useEffect(() => {
    if (!socket) return;

    socket.on("game-start", () => {
      setGameStarted(true);
      setGameOverData(null);
    });

    socket.on("game-already-started", () => {
      setGameStarted(true);
      setGameOverData(null);
    });

    socket.on("game-stop", () => {
      setGameStarted(false);
      setShowClock(false);
      setCurrentUserDrawing(false);
      setPlayerDrawing(null);
      setIsWaiting(false);
    });

    socket.on("round-update", ({ round: r, totalRounds: tr }: { round: number; totalRounds: number }) => {
      setRound(r);
      setTotalRounds(tr);
    });

    socket.on("game-over", ({ players }: { players: Player[] }) => {
      setGameOverData({ players });
    });

    // Mid-game join: server tells us to wait
    socket.on("waiting-for-round", () => {
      setIsWaiting(true);
    });

    // Server activated waiting players — we can now play
    socket.on("waiting-players-activated", () => {
      setIsWaiting(false);
    });

    // Sync current game state for mid-game joiners (spectators)
    socket.on("game-state-sync", ({ drawerPlayer, wordLength, word, remainingTime: rt, round: r, totalRounds: tr }: {
      drawerPlayer: Player | null;
      wordLength: number;
      word: string | null;
      remainingTime: number;
      round: number;
      totalRounds: number;
    }) => {
      if (drawerPlayer) setPlayerDrawing(drawerPlayer);
      if (wordLength > 0) setWordLen(wordLength);
      if (word) setSelectedWord(word);
      setRemainingTime(rt);
      setRound(r);
      setTotalRounds(tr);
      if (wordLength > 0) setShowClock(true);
    });

    return () => {
      socket.off("game-start");
      socket.off("game-already-started");
      socket.off("game-stop");
      socket.off("round-update");
      socket.off("game-over");
      socket.off("waiting-for-round");
      socket.off("waiting-players-activated");
      socket.off("game-state-sync");
    };
  }, [socket]);

  // Turn events
  useEffect(() => {
    if (!socket) return;

    socket.on("start-turn", (player: Player) => {
      setGuessedWord(false);
      setPlayerDrawing(player);
      const newRandomWords = getRandomWords();
      setWords(newRandomWords);
      setShowWords(true);
    });

    socket.on("start-draw", (player: Player) => {
      setShowWords(false);
      setShowClock(true);
      if (player.id === socket.id) {
        setCurrentUserDrawing(true);
      }
      // System message: "X is drawing now!"
      setAllChats((prev) => [
        { sender: "", message: `${player.name} is drawing now!`, rightGuess: false, system: true, type: "drawing" },
        ...prev,
      ]);
    });

    socket.on("end-turn", ({ player, word: correctWord }: { player: Player; word: string }) => {
      // System message: "The word was 'X'"
      if (correctWord) {
        setAllChats((prev) => [
          { sender: "", message: `The word was '${correctWord}'`, rightGuess: false, system: true, type: "word-reveal" },
          ...prev,
        ]);
      }
      setGuessedWord(false);
      setPlayerDrawing(null);
      setShowClock(false);
      setSelectedWord(null);
      setRemainingTime(0);
      if (socket.id === player.id) {
        setCurrentUserDrawing(false);
      }
    });

    socket.on("timer-sync", (time: number) => {
      setRemainingTime(time);
    });

    socket.on("word-len", (wl: number) => {
      setWordLen(wl);
    });

    socket.on("all-guessed-correct", () => {
      // All players guessed correctly
    });

    return () => {
      socket.off("start-turn");
      socket.off("start-draw");
      socket.off("end-turn");
      socket.off("word-len");
      socket.off("timer-sync");
      socket.off("all-guessed-correct");
    };
  }, [socket]);

  // Chat events
  useEffect(() => {
    if (!socket) return;

    socket.on("recieve-chat", ({ msg, player, rightGuess, players }: {
      msg: string;
      player: Player;
      rightGuess: boolean;
      players: Player[];
    }) => {
      setAllPlayers(players);
      if (rightGuess) {
        if (player.id === socket.id) {
          setGuessedWord(true);
          setAllChats((prev) => [
            { sender: player.name, message: `${player.name} guessed the word!`, rightGuess, type: "right-guess" },
            ...prev,
          ]);
        } else {
          setAllChats((prev) => [
            { sender: player.name, message: `${player.name} guessed the word!`, rightGuess, type: "right-guess" },
            ...prev,
          ]);
        }
      } else {
        if (player.id === socket.id) {
          setAllChats((prev) => [
            { sender: player.name, message: msg, rightGuess },
            ...prev,
          ]);
        } else {
          setAllChats((prev) => [
            { sender: player.name, message: msg, rightGuess },
            ...prev,
          ]);
        }
      }
    });

    return () => { socket.off("recieve-chat"); };
  }, [socket]);

  // Word selection
  const handleWordSelect = (w: string) => {
    setShowWords(false);
    setSelectedWord(w);
    socket?.emit("word-select", w);
    setWords([]);
  };

  // Chat submit
  const handleSubmitChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    socket?.emit("sending-chat", inputMessage.toLowerCase());
    setInputMessage("");
  };

  // Get random words
  const getRandomWords = (): string[] => {
    const lengthWordArray = getWordsArrayLength();
    const newWordsArray: string[] = [];
    let prevIndex = -1;
    for (let i = 0; i < 3; i++) {
      let newIndex = Math.floor(Math.random() * lengthWordArray);
      while (newIndex === prevIndex) {
        newIndex = Math.floor(Math.random() * lengthWordArray);
      }
      newWordsArray.push(wordsArray[newIndex]);
      prevIndex = newIndex;
    }
    return newWordsArray;
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Background />

      {/* Word Selection Overlay */}
      {/* Game Over Overlay */}
      {gameOverData && (
        <GameOver
          players={gameOverData.players}
          currentUserId={socket?.id}
          onBackToLobby={() => navigate("/")}
        />
      )}

      {showWords && playerDrawing && socket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="bg-white/95 shadow-2xl">
            <CardContent className="p-8">
              {playerDrawing.id === socket.id ? (
                <>
                  <h3 className="text-lg font-bold text-purple-700 mb-4 text-center">
                    Choose a word to draw:
                  </h3>
                  <div className="flex gap-4">
                    {words.map((w, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => handleWordSelect(w)}
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
      )}

      <div className="relative z-10 flex flex-col gap-3 w-full max-w-6xl">
        {/* Waiting Banner for mid-game joiners */}
        {isWaiting && (
          <Alert className="border-amber-300 bg-amber-50/95 backdrop-blur-sm shadow-lg animate-pulse">
            <Clock className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-bold">Waiting to join</AlertTitle>
            <AlertDescription className="text-amber-700">
              A round is in progress. You'll join the game when the current turn ends!
            </AlertDescription>
          </Alert>
        )}

        {/* Word Bar - full width above the 3-column row */}
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

        {/* 3-column row: Players | Canvas | Chat */}
        <div className="flex gap-4 items-stretch h-[540px]">
          {/* Player List Sidebar */}
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
                    curruser={player.id === socket?.id}
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

          {/* Canvas */}
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg flex-1">
            <CardContent className="p-3">
              <Canvas
                socket={socket}
                currentUserDrawing={currentUserDrawing}
              />
            </CardContent>
          </Card>

          {/* Chat Sidebar */}
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
