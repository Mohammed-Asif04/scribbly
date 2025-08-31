"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AvatarSelector from "@/components/AvatarSelector";

const ScribllyHome = () => {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [language, setLanguage] = useState("English");
  const [isCreatingPrivateRoom, setIsCreatingPrivateRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");

  const handleAvatarChange = (avatarId: number) => {
    setSelectedAvatar(avatarId);
  };

  const handleCreatePrivateRoom = () => {
    setIsCreatingPrivateRoom(true);
    // Generate a random room code (6 characters)
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newRoomCode);
    
    // Here you would typically:
    // 1. Create the room on your backend
    // 2. Navigate to the room page
    // 3. Or show the room code to share with friends
    console.log("Created private room with code:", newRoomCode);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    // You could add a toast notification here
    alert("Room code copied to clipboard!");
  };

  const handleJoinRoom = () => {
    if (joinRoomCode.trim()) {
      // Logic to join an existing room would go here
      console.log("Joining room with code:", joinRoomCode);
      // Typically you would navigate to the room page: /room/${joinRoomCode}
    }
  };

  const handleBackToMain = () => {
    setIsCreatingPrivateRoom(false);
    setRoomCode("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-5">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">
              Scriblly
            </h1>
            <p className="text-sm text-gray-600">
              Draw and guess words with friends!
            </p>
          </div>

          {/* Name and Language in one line */}
          <div className="flex gap-3 mb-5">
            <div className="flex-2">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full text-sm"
              />
            </div>
            <div className="flex-1">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Avatar Selection Component */}
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onAvatarChange={handleAvatarChange}
          />

          {/* Join Room Input (always visible) */}
          <div className="mb-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full text-sm flex-1"
                maxLength={6}
              />
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!joinRoomCode.trim() || !name.trim()}
                onClick={handleJoinRoom}
                size="sm"
              >
                Join
              </Button>
            </div>
          </div>

          {/* Private Room Section */}
          {isCreatingPrivateRoom ? (
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-700 mb-2 text-center">
                Private Room Created!
              </h3>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl font-mono font-bold text-purple-800">
                  {roomCode}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRoomCode}
                  className="text-xs"
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-purple-600 text-center mb-3">
                Share this code with friends to join your room
              </p>
              <div className="space-y-2">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => console.log("Starting game...")}
                >
                  Start Game
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-purple-600 hover:bg-purple-50"
                  onClick={handleBackToMain}
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-sm"
                disabled={!name.trim()}
                onClick={() => console.log("Quick play...")}
              >
                Quick Play
              </Button>
              <Button
                variant="outline"
                className="w-full py-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold rounded-lg transition-colors text-sm"
                disabled={!name.trim()}
                onClick={handleCreatePrivateRoom}
              >
                Create Private Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScribllyHome;