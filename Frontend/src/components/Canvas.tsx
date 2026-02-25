import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#000000");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [straightLineMode, setStraightLineMode] = useState(false);
  const [radius, setRadius] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineWidth = radius;
      ctx.strokeStyle = color;
      setContext(ctx);
    }
  }, []);

  // Update context when color or radius changes
  useEffect(() => {
    if (!context) return;
    context.lineCap = "round";
    context.lineWidth = radius;
    context.strokeStyle = color;
  }, [color, radius, context]);

  // Listen for incoming drawings from other players
  useEffect(() => {
    if (!socket || !context) return;

    const handleReceiving = (data: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const base64String = data.split(",")[1];
      const byteArray = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        URL.revokeObjectURL(imageUrl);
      };
      img.src = imageUrl;
    };

    socket.on("receiving", handleReceiving);
    return () => {
      socket.off("receiving", handleReceiving);
    };
  }, [socket, context]);

  const getCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    []
  );

  const emitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;
    const dataURL = canvas.toDataURL("image/png");
    socket.emit("sending", dataURL);
  }, [socket]);

  const startPaint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentUserDrawing) return;
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
      if (straightLineMode) {
        setStartPoint(coordinates);
      }
    }
  };

  const paint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || straightLineMode || !context) return;
    const newPos = getCoordinates(event);
    if (!mousePosition || !newPos) return;

    if (isEraser) {
      const imageData = context.getImageData(
        newPos.x - radius,
        newPos.y - radius,
        2 * radius,
        2 * radius
      );
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = 0;
      }
      context.putImageData(imageData, newPos.x - radius, newPos.y - radius);
    } else {
      context.strokeStyle = color;
      context.lineWidth = radius;
      context.beginPath();
      context.moveTo(mousePosition.x, mousePosition.y);
      context.lineTo(newPos.x, newPos.y);
      context.stroke();
    }

    emitCanvas();
    setMousePosition(newPos);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (straightLineMode && startPoint && context) {
      const endPoint = getCoordinates(event);
      if (endPoint) {
        context.strokeStyle = color;
        context.lineWidth = radius;
        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(endPoint.x, endPoint.y);
        context.stroke();
        emitCanvas();
      }
    }
    setIsPainting(false);
    setMousePosition(null);
    setStartPoint(null);
  };

  const exitPaint = () => {
    setIsPainting(false);
    setMousePosition(null);
    setStartPoint(null);
  };

  const fillCanvas = () => {
    if (!currentUserDrawing || !context) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    emitCanvas();
  };

  const clearCanvas = () => {
    if (!currentUserDrawing || !context) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    emitCanvas();
  };

  // Public method to clear canvas after turn (called externally)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Expose clearCanvasAfterTurn on the canvas element for parent to call
    (canvas as any).clearAfterTurn = () => {
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [context]);

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={680}
        height={480}
        onMouseDown={startPaint}
        onMouseMove={paint}
        onMouseUp={handleMouseUp}
        onMouseLeave={exitPaint}
        className={cn(
          "rounded-lg border-2 border-gray-300 bg-white shadow-inner",
          !currentUserDrawing ? "cursor-not-allowed" : "cursor-crosshair"
        )}
      />

      {/* Drawing Tools - only shown when it's the user's turn */}
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

          {/* Tool Buttons + Radius */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={isEraser ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEraser(!isEraser)}
              className={cn(
                "text-xs font-semibold",
                isEraser && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {isEraser ? "✏️ Draw" : "🧹 Eraser"}
            </Button>
            <Button
              variant={straightLineMode ? "default" : "outline"}
              size="sm"
              onClick={() => setStraightLineMode(!straightLineMode)}
              className={cn(
                "text-xs font-semibold",
                straightLineMode && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {straightLineMode ? "📏 Line ON" : "📏 Line"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fillCanvas}
              className="text-xs font-semibold"
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

            {/* Radius Slider */}
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
