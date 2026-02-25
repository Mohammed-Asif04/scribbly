import React from "react";
import Background from "@/components/Background";

const GamePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Background />
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-purple-600 mb-4 bg-white/80 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
          Game Room
        </h1>
        <p className="text-xl text-gray-700 bg-white/80 p-4 rounded-xl shadow backdrop-blur-sm">
          Waiting for players...
        </p>
      </div>
    </div>
  );
};

export default GamePage;
