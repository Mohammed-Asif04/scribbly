import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Background from "@/components/Background";
import PlayerCard from "@/components/PlayerCard";
import Canvas from "@/components/Canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { wordsArray, getWordsArrayLength } from "@/components/word";

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
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Game start/stop events
  useEffect(() => {
    if (!socket) return;

    socket.on("game-start", () => {
      setGameStarted(true);
    });

    socket.on("game-already-started", () => {
      setGameStarted(true);
    });

    socket.on("game-stop", () => {
      setGameStarted(false);
      setShowClock(false);
      setCurrentUserDrawing(false);
      setPlayerDrawing(null);
    });

    return () => {
      socket.off("game-start");
      socket.off("game-already-started");
      socket.off("game-stop");
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
    });

    socket.on("end-turn", (player: Player) => {
      setGuessedWord(false);
      setPlayerDrawing(null);
      setShowClock(false);
      setSelectedWord(null);
      if (socket.id === player.id) {
        setCurrentUserDrawing(false);
      }
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
            { sender: "you", message: `You guessed the right word! (${msg})`, rightGuess },
            ...prev,
          ]);
        } else {
          setAllChats((prev) => [
            { sender: player.name, message: `${player.name} guessed the word right!`, rightGuess },
            ...prev,
          ]);
        }
      } else {
        if (player.id === socket.id) {
          setAllChats((prev) => [
            { sender: "you", message: msg, rightGuess },
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

  // Word hint display
  const renderWordHint = () => {
    if (currentUserDrawing && selectedWord) {
      return <span className="font-bold text-purple-700">{selectedWord}</span>;
    }
    if (wordLen > 0) {
      return (
        <span className="font-mono tracking-widest text-lg">
          {Array.from({ length: wordLen }, () => "_ ").join("")}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Background />

      {/* Word Selection Overlay */}
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

      <div className="relative z-10 flex gap-4 w-full max-w-6xl">
        {/* Player List Sidebar */}
        <Card className="w-56 shrink-0 backdrop-blur-sm bg-white/90 shadow-lg self-start">
          <CardHeader className="pb-2 px-3 pt-4">
            <CardTitle className="text-base text-purple-600 text-center">
              Players
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="flex flex-col gap-1">
              {allPlayers.map((player, index) => (
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

        {/* Main Game Area */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Word Hint Bar */}
          {gameStarted && (
            <Card className="backdrop-blur-sm bg-white/90 shadow-lg">
              <CardContent className="py-3 px-4 flex items-center justify-center gap-4">
                {showClock && (
                  <span className="text-sm text-gray-500">⏰</span>
                )}
                <div className="text-center">{renderWordHint()}</div>
              </CardContent>
            </Card>
          )}

          {/* Canvas */}
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg">
            <CardContent className="p-3">
              <Canvas
                socket={socket}
                currentUserDrawing={currentUserDrawing}
              />
            </CardContent>
          </Card>
        </div>

        {/* Chat Sidebar */}
        <Card className="w-64 shrink-0 backdrop-blur-sm bg-white/90 shadow-lg self-start flex flex-col" style={{ maxHeight: "600px" }}>
          <CardHeader className="pb-2 px-3 pt-4">
            <CardTitle className="text-base text-purple-600 text-center">
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 flex flex-col flex-1 overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-1 mb-2 min-h-[300px] max-h-[440px]">
              {allChats.map((chat, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "text-xs px-2 py-1 rounded",
                    chat.rightGuess
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "text-gray-700"
                  )}
                >
                  {chat.rightGuess ? (
                    <span>🎉 {chat.message}</span>
                  ) : (
                    <span>
                      <strong>{chat.sender}:</strong> {chat.message}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmitChat} className="flex gap-1.5">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your guess..."
                disabled={currentUserDrawing || showWords || !gameStarted || guessedWord}
                className={cn(
                  "text-xs h-8",
                  (currentUserDrawing || showWords || !gameStarted) && "cursor-not-allowed opacity-50"
                )}
              />
              <Button
                type="submit"
                size="sm"
                disabled={currentUserDrawing || showWords || !gameStarted || guessedWord || !inputMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 text-xs shrink-0"
              >
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Status bar */}
      {!gameStarted && (
        <div className="relative z-10 mt-4">
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg">
            <CardContent className="py-3 px-6">
              <p className="text-sm text-gray-500 text-center">
                ⏳ Waiting for the game to start...
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GamePage;
