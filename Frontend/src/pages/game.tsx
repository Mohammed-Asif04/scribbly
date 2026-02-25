import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Background from "@/components/Background";
import PlayerCard from "@/components/PlayerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Player {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

const GamePage: React.FC = () => {
  const location = useLocation();
  const { username, avatar } = (location.state as { username: string; avatar: number }) || {
    username: "Player",
    avatar: 1,
  };

  // Generate a unique ID for this tab/player
  const myIdRef = useRef<string>(
    `player_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const myId = myIdRef.current;

  const currentPlayer: Player = {
    id: myId,
    name: username,
    avatar: `/avatars/avatar${avatar}.png`,
    points: 0,
  };

  const [players, setPlayers] = useState<Player[]>([currentPlayer]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("scribbly_game");
    channelRef.current = channel;

    // Save this player to localStorage so new tabs can pick up existing players
    const saveSelfToStorage = () => {
      const stored = JSON.parse(localStorage.getItem("scribbly_players") || "{}");
      stored[myId] = currentPlayer;
      localStorage.setItem("scribbly_players", JSON.stringify(stored));
    };
    saveSelfToStorage();

    // Load all existing players from localStorage on mount
    const loadPlayersFromStorage = (): Player[] => {
      const stored = JSON.parse(localStorage.getItem("scribbly_players") || "{}");
      return Object.values(stored) as Player[];
    };
    setPlayers(loadPlayersFromStorage());

    // Announce this player to other tabs
    channel.postMessage({ type: "player_joined", player: currentPlayer });

    // Listen for messages from other tabs
    channel.onmessage = (event) => {
      const { type, player } = event.data;

      if (type === "player_joined") {
        // Add new player and respond with our own info
        setPlayers((prev) => {
          if (prev.some((p) => p.id === player.id)) return prev;
          return [...prev, player];
        });
        // Respond so the new tab knows about us
        channel.postMessage({ type: "player_announce", player: currentPlayer });
      }

      if (type === "player_announce") {
        setPlayers((prev) => {
          if (prev.some((p) => p.id === player.id)) return prev;
          return [...prev, player];
        });
      }

      if (type === "player_left") {
        setPlayers((prev) => prev.filter((p) => p.id !== player.id));
      }
    };

    // On tab close, notify other tabs and remove from localStorage
    const handleBeforeUnload = () => {
      const stored = JSON.parse(localStorage.getItem("scribbly_players") || "{}");
      delete stored[myId];
      localStorage.setItem("scribbly_players", JSON.stringify(stored));
      channel.postMessage({ type: "player_left", player: currentPlayer });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      channel.close();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Background />

      <div className="relative z-10 flex gap-6 w-full max-w-5xl">
        {/* Player List Sidebar */}
        <Card className="w-64 shrink-0 backdrop-blur-sm bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-600 text-center">
              Players
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <div className="flex flex-col gap-1">
              {players.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  pl={player}
                  rank={index + 1}
                  curruser={player.id === myId}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Game Area */}
        <Card className="flex-1 backdrop-blur-sm bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-600 text-center">
              Game Room
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-gray-500">
              Waiting for players...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamePage;
