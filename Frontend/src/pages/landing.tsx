import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import Background from "@/components/Background";

const ScribllyHome: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [language, setLanguage] = useState("English");

  const handleAvatarChange = (avatarId: number) => {
    setSelectedAvatar(avatarId);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <Background />

        {/* Content */}
        <div className="relative z-10">
          <Card className="w-full max-w-sm shadow-lg rounded-xl overflow-hidden backdrop-blur-sm bg-white/90">
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
                    className="w-full text-sm bg-white/80"
                  />
                </div>
                <div className="flex-1">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full text-sm bg-white/80">
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

              {/* Avatar Selection */}
              <AvatarSelector
                selectedAvatar={selectedAvatar}
                onAvatarChange={handleAvatarChange}
              />

              {/* Play Button */}
              <div className="mt-6">
                <Button
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-sm"
                  disabled={!name.trim()}
                  onClick={() => navigate("/game")}
                >
                  Quick Play
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ScribllyHome;
