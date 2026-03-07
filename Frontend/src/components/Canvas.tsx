import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCanvas } from "@/hooks/useCanvas";
import type { Socket } from "socket.io-client";

interface CanvasProps {
  socket: Socket | null;
  currentUserDrawing: boolean;
}

const BASIC_COLORS = [
  "#000000", "#FFFFFF", "#808080", "#C0C0C0",
  "#FF0000", "#800000", "#FF6347",
  "#FF8C00", "#FFD700", "#FFFF00",
  "#00FF00", "#008000", "#008080",
  "#00FFFF", "#0000FF", "#000080",
  "#4B0082", "#FF00FF", "#FF69B4",
  "#8B4513",
];

const Canvas: React.FC<CanvasProps> = ({ socket, currentUserDrawing }) => {
  const {
    canvasRef,
    color,
    setColor,
    radius,
    setRadius,
    isEraser,
    setIsEraser,
    fillMode,
    setFillMode,
    cursorPos,
    setCursorPos,
    startPaint,
    paint,
    handleMouseUp,
    exitPaint,
    clearCanvas,
  } = useCanvas(socket, currentUserDrawing);

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas with cursor overlay */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={680}
          height={480}
          onMouseDown={startPaint}
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              setCursorPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
            paint(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            exitPaint();
            setCursorPos(null);
          }}
          className={cn(
            "rounded-lg border-2 border-gray-300 bg-white shadow-inner",
            !currentUserDrawing ? "cursor-not-allowed" : fillMode ? "cursor-pointer" : isEraser ? "cursor-none" : "cursor-crosshair"
          )}
        />
        {/* Eraser cursor */}
        {isEraser && currentUserDrawing && cursorPos && (() => {
          const canvas = canvasRef.current;
          const rect = canvas?.getBoundingClientRect();
          const cssScale = rect ? rect.width / 680 : 1;
          const cssRadius = radius * cssScale;
          return (
            <div
              className="pointer-events-none absolute border-2 border-gray-500 rounded-full"
              style={{
                width: cssRadius * 2,
                height: cssRadius * 2,
                left: cursorPos.x - cssRadius,
                top: cursorPos.y - cssRadius,
              }}
            />
          );
        })()}
      </div>

      {/* Drawing Tools */}
      {currentUserDrawing && (
        <div className="flex flex-col gap-2 p-3 bg-white/80 rounded-lg backdrop-blur-sm border border-gray-200">
          {/* Color Palette */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {BASIC_COLORS.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 shrink-0",
                  color === c ? "border-purple-500 ring-2 ring-purple-300 scale-110" : "border-gray-300"
                )}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setIsEraser(false);
              }}
              className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
            />
          </div>

          {/* Tool Buttons + Size Slider */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={!isEraser && !fillMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsEraser(false);
                setFillMode(false);
              }}
              className={cn(
                "text-xs font-semibold",
                !isEraser && !fillMode && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              ✏️ Draw
            </Button>
            <Button
              variant={isEraser ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsEraser(true);
                setFillMode(false);
              }}
              className={cn(
                "text-xs font-semibold",
                isEraser && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              🧹 Eraser
            </Button>
            <Button
              variant={fillMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFillMode(!fillMode);
                setIsEraser(false);
              }}
              className={cn(
                "text-xs font-semibold",
                fillMode && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              🎨 Fill
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              🗑️ Clear
            </Button>

            {/* Size Slider */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500 font-medium">Size:</span>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-24 accent-purple-600"
              />
              <span className="text-xs text-gray-600 font-mono w-6">{radius}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
