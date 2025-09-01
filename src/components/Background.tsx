"use client";
import Image from "next/image";

const Background = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Image
        src="/scribbly-background.jpg"
        alt="Scriblly background"
        fill
        className="object-cover"
        priority
        quality={90}
      />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100/70 to-purple-100/70" />
    </div>
  );
};

export default Background;