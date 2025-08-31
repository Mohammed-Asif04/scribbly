"use client";
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Avatar data - 8 different avatars
const avatars = [
  { id: 1, src: '/avatars/avatar1.svg', alt: 'Avatar 1' },
  { id: 2, src: '/avatars/avatar2.svg', alt: 'Avatar 2' },
  { id: 3, src: '/avatars/avatar3.svg', alt: 'Avatar 3' },
  { id: 4, src: '/avatars/avatar4.svg', alt: 'Avatar 4' },
  { id: 5, src: '/avatars/avatar5.svg', alt: 'Avatar 5' },
  { id: 6, src: '/avatars/avatar6.svg', alt: 'Avatar 6' },
  { id: 7, src: '/avatars/avatar7.svg', alt: 'Avatar 7' },
  { id: 8, src: '/avatars/avatar8.svg', alt: 'Avatar 8' },
];

const ScribllyHome = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [language, setLanguage] = useState('English');

  // Function to handle random avatar selection
  const handleRandomAvatar = () => {
    const randomId = Math.floor(Math.random() * 8) + 1;
    setSelectedAvatar(randomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">Scriblly</h1>
            <p className="text-gray-600">Draw and guess words with friends!</p>
          </div>

          {/* Avatar Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-700">Choose your avatar</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRandomAvatar}
                className="text-xs"
              >
                Random
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map(avatar => (
                <div 
                  key={avatar.id}
                  className={`p-1 rounded-full cursor-pointer transition-all ${
                    selectedAvatar === avatar.id 
                      ? 'ring-4 ring-purple-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-purple-300'
                  }`}
                  onClick={() => setSelectedAvatar(avatar.id)}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-200 rounded-full">
                    <span className="text-xl">👤</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-6">
  <Label htmlFor="name" className="text-lg font-semibold mb-2">
    Enter your name
  </Label>
  <Input
    id="name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Your name"
  />
</div>

{/* Language Selection */}
<div className="mb-8">
  <Label htmlFor="language" className="text-lg font-semibold mb-2">
    Language
  </Label>
  <Select value={language} onValueChange={setLanguage}>
    <SelectTrigger id="language" className="w-full">
      <SelectValue placeholder="Select language" />
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              disabled={!name.trim()}
            >
              Play!
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-3 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold rounded-lg transition-colors"
            >
              Create Private Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScribllyHome;