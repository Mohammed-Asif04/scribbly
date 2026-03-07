import React from "react";
import { Button } from "@/components/ui/button";

interface AvatarSelectorProps {
  selectedAvatar: number;
  onAvatarChange: (avatarId: number) => void;
}

const avatars = [
  { id: 1, src: "/avatars/avatar1.png", label: "Avatar 1" },
  { id: 2, src: "/avatars/avatar2.png", label: "Avatar 2" },
  { id: 3, src: "/avatars/avatar3.png", label: "Avatar 3" },
  { id: 4, src: "/avatars/avatar4.png", label: "Avatar 4" },
  { id: 5, src: "/avatars/avatar5.png", label: "Avatar 5" },
  { id: 6, src: "/avatars/avatar6.png", label: "Avatar 6" },
  { id: 7, src: "/avatars/avatar7.png", label: "Avatar 7" },
  { id: 8, src: "/avatars/avatar8.png", label: "Avatar 8" },
  { id: 9, src: "/avatars/avatar9.png", label: "Avatar 9" },
  { id: 10, src: "/avatars/avatar10.png", label: "Avatar 10" }, 
  { id: 11, src: "/avatars/avatar11.png", label: "Avatar 11" },
  { id: 12, src: "/avatars/avatar12.png", label: "Avatar 12" }, 
  { id: 13, src: "/avatars/avatar13.png", label: "Avatar 13" },
  { id: 14, src: "/avatars/avatar14.png", label: "Avatar 14" },
  { id: 15, src: "/avatars/avatar15.png", label: "Avatar 15" },
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarChange,
}) => {
  const handleRandomAvatar = () => {
    let randomId;
    do {
      randomId = Math.floor(Math.random() * 15) + 1;
    } while (randomId === selectedAvatar);
    onAvatarChange(randomId);
  };

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
              <img
                src={currentAvatar.src}
                alt={currentAvatar.label}
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
