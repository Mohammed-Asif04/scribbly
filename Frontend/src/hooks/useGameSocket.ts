import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { wordsArray, getWordsArrayLength } from "@/components/word";
import type { Player, ChatMessage } from "@/types";

const ENDPOINT_LOCAL = "http://localhost:3001/";

export const useGameSocket = () => {
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

  // Redirect to landing if no username exists
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername && !username) {
      navigate("/");
    }
  }, []);

  // Socket connection lifecycle
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

  // Send user data when server requests it
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

  // Player list updates
  useEffect(() => {
    if (!socket) return;
    socket.on("updated-players", (updatedPlayers: Player[]) => {
      setAllPlayers(updatedPlayers);
    });
    return () => { socket.off("updated-players"); };
  }, [socket]);

  // Player join/leave chat notifications
  useEffect(() => {
    if (!socket) return;
    socket.on("player-joined", ({ name }: { name: string }) => {
      setAllChats((prev) => [
        { sender: "", message: `${name} joined the match`, rightGuess: false, system: true, type: "join" as const },
        ...prev,
      ].slice(0, 20));
    });
    socket.on("player-left", ({ name }: { name: string }) => {
      setAllChats((prev) => [
        { sender: "", message: `${name} left the match`, rightGuess: false, system: true, type: "leave" as const },
        ...prev,
      ].slice(0, 20));
    });
    return () => {
      socket.off("player-joined");
      socket.off("player-left");
    };
  }, [socket]);

  // Game lifecycle events (start, stop, rounds, spectator sync)
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

    socket.on("waiting-for-round", () => {
      setIsWaiting(true);
    });

    socket.on("waiting-players-activated", () => {
      setIsWaiting(false);
    });

    // Sync full game state for mid-game joiners
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

  // Turn events (start, draw, end, timer)
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
      setAllChats((prev) => [
        { sender: "", message: `${player.name} is drawing now!`, rightGuess: false, system: true, type: "drawing" as const },
        ...prev,
      ].slice(0, 20));
    });

    socket.on("end-turn", ({ player, word: correctWord }: { player: Player; word: string }) => {
      if (correctWord) {
        setAllChats((prev) => [
          { sender: "", message: `The word was '${correctWord}'`, rightGuess: false, system: true, type: "word-reveal" as const },
          ...prev,
        ].slice(0, 20));
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

    socket.on("all-guessed-correct", () => {});

    return () => {
      socket.off("start-turn");
      socket.off("start-draw");
      socket.off("end-turn");
      socket.off("word-len");
      socket.off("timer-sync");
      socket.off("all-guessed-correct");
    };
  }, [socket]);

  // Chat message handling
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
            { sender: player.name, message: `${player.name} guessed the word!`, rightGuess, type: "right-guess" as const },
            ...prev,
          ].slice(0, 20));
        } else {
          setAllChats((prev) => [
            { sender: player.name, message: `${player.name} guessed the word!`, rightGuess, type: "right-guess" as const },
            ...prev,
          ].slice(0, 20));
        }
      } else {
        if (player.id === socket.id) {
          setAllChats((prev) => [
            { sender: player.name, message: msg, rightGuess },
            ...prev,
          ].slice(0, 20));
        } else {
          setAllChats((prev) => [
            { sender: player.name, message: msg, rightGuess },
            ...prev,
          ].slice(0, 20));
        }
      }
    });

    return () => { socket.off("recieve-chat"); };
  }, [socket]);

  const handleWordSelect = (w: string) => {
    setShowWords(false);
    setSelectedWord(w);
    socket?.emit("word-select", w);
    setWords([]);
  };

  const handleSubmitChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    socket?.emit("sending-chat", inputMessage.toLowerCase());
    setInputMessage("");
  };

  // Pick 3 unique random words from the word bank
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

  return {
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
  };
};
