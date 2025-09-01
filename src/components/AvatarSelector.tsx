"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Avatar data - 15 different avatars
export const avatars = [
  { id: 1, src: "/avatars/avatar1.png", alt: "Avatar 1" },
  { id: 2, src: "/avatars/avatar2.png", alt: "Avatar 2" },
  { id: 3, src: "/avatars/avatar3.png", alt: "Avatar 3" },
  { id: 4, src: "/avatars/avatar4.png", alt: "Avatar 4" },
  { id: 5, src: "/avatars/avatar5.png", alt: "Avatar 5" },
  { id: 6, src: "/avatars/avatar6.png", alt: "Avatar 6" },
  { id: 7, src: "/avatars/avatar7.png", alt: "Avatar 7" },
  { id: 8, src: "/avatars/avatar8.png", alt: "Avatar 8" },
  { id: 9, src: "/avatars/avatar9.png", alt: "Avatar 9" },
  { id: 10, src: "/avatars/avatar10.png", alt: "Avatar 10" },
  { id: 11, src: "/avatars/avatar11.png", alt: "Avatar 11" },
  { id: 12, src: "/avatars/avatar12.png", alt: "Avatar 12" },
  { id: 13, src: "/avatars/avatar13.png", alt: "Avatar 13" },
  { id: 14, src: "/avatars/avatar14.png", alt: "Avatar 14" },
  { id: 15, src: "/avatars/avatar15.png", alt: "Avatar 15" },
];

interface AvatarSelectorProps {
  selectedAvatar: number;
  onAvatarChange: (avatarId: number) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarChange,
}) => {
  // Function to handle random avatar selection
  const handleRandomAvatar = () => {
    let randomId;
    do {
      randomId = Math.floor(Math.random() * 15) + 1;
    } while (randomId === selectedAvatar);
    onAvatarChange(randomId);
  };

  // Get the current avatar based on selectedAvatar state
  const currentAvatar = avatars.find((avatar) => avatar.id === selectedAvatar);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-md font-semibold text-gray-700">
          Choose your avatar
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRandomAvatar}
          className="text-xs"
        >
          Random
        </Button>
      </div>
      <div className="flex justify-center">
        <div className="p-2 rounded-full cursor-pointer transition-all ring-4 ring-purple-500 ring-offset-2">
          <div className="w-18 h-19 flex items-center justify-center bg-gray-200 rounded-full overflow-hidden">
            {currentAvatar ? (
              <Image
                src={currentAvatar.src}
                alt={currentAvatar.alt}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;