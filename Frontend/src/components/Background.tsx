import React from "react";

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200" />

      {/* Floating shapes */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/30 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

      {/* Decorative pencil/brush doodles using SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="doodle-pattern"
          x="0"
          y="0"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          {/* Squiggly line */}
          <path
            d="M10 60 Q30 20 50 60 Q70 100 90 60"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
          />
          {/* Star */}
          <path
            d="M60 10 L63 20 L73 20 L65 26 L68 36 L60 30 L52 36 L55 26 L47 20 L57 20 Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />
          {/* Circle */}
          <circle
            cx="100"
            cy="90"
            r="12"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#doodle-pattern)" />
      </svg>
    </div>
  );
};

export default Background;
