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
  const [radius, setRadius] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [fillMode, setFillMode] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

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
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
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

  // Throttled emit to avoid encoding PNG on every single mouse move
  const emitThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttledEmit = useCallback(() => {
    if (emitThrottleRef.current) return; // already scheduled
    emitThrottleRef.current = setTimeout(() => {
      emitCanvas();
      emitThrottleRef.current = null;
    }, 80);
  }, [emitCanvas]);

  // --- Flood Fill Algorithm ---
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  const colorsMatch = (
    data: Uint8ClampedArray,
    idx: number,
    target: [number, number, number, number],
    tolerance: number = 32
  ): boolean => {
    return (
      Math.abs(data[idx] - target[0]) <= tolerance &&
      Math.abs(data[idx + 1] - target[1]) <= tolerance &&
      Math.abs(data[idx + 2] - target[2]) <= tolerance &&
      Math.abs(data[idx + 3] - target[3]) <= tolerance
    );
  };

  const floodFill = useCallback(
    (startX: number, startY: number, fillColor: string) => {
      if (!context) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      const imageData = context.getImageData(0, 0, width, height);
      const data = imageData.data;

      const sx = Math.floor(startX);
      const sy = Math.floor(startY);
      const startIdx = (sy * width + sx) * 4;

      const targetColor: [number, number, number, number] = [
        data[startIdx],
        data[startIdx + 1],
        data[startIdx + 2],
        data[startIdx + 3],
      ];

      const [fr, fg, fb] = hexToRgb(fillColor);
      const fillRgba: [number, number, number, number] = [fr, fg, fb, 255];

      // Don't fill if clicking on the same color
      if (
        Math.abs(targetColor[0] - fillRgba[0]) <= 5 &&
        Math.abs(targetColor[1] - fillRgba[1]) <= 5 &&
        Math.abs(targetColor[2] - fillRgba[2]) <= 5 &&
        Math.abs(targetColor[3] - fillRgba[3]) <= 5
      ) {
        return;
      }

      const stack: [number, number][] = [[sx, sy]];
      const visited = new Uint8Array(width * height);

      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;

        const pixelIdx = cy * width + cx;
        if (visited[pixelIdx]) continue;
        visited[pixelIdx] = 1;

        const idx = pixelIdx * 4;
        if (!colorsMatch(data, idx, targetColor)) continue;

        data[idx] = fillRgba[0];
        data[idx + 1] = fillRgba[1];
        data[idx + 2] = fillRgba[2];
        data[idx + 3] = fillRgba[3];

        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }

      context.putImageData(imageData, 0, 0);
      emitCanvas();
    },
    [context, emitCanvas]
  );

  const startPaint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentUserDrawing) return;
    const coordinates = getCoordinates(event);
    if (!coordinates) return;

    // If fill mode, do flood fill at click position
    if (fillMode) {
      floodFill(coordinates.x, coordinates.y, color);
      return;
    }

    setIsPainting(true);
    setMousePosition(coordinates);
    if (context) {
      if (isEraser) {
        // Erase a full circle on click
        context.save();
        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.arc(coordinates.x, coordinates.y, radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      } else {
        // Draw a dot at the start for single-click drawing
        context.strokeStyle = color;
        context.lineWidth = radius;
        context.beginPath();
        context.moveTo(coordinates.x, coordinates.y);
        context.lineTo(coordinates.x, coordinates.y);
        context.stroke();
      }
    }
  };

  const paint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || !context || fillMode) return;
    const newPos = getCoordinates(event);
    if (!mousePosition || !newPos) return;

    if (isEraser) {
      // Erase along the path using filled circles for smooth coverage
      context.save();
      context.fillStyle = "#FFFFFF";
      // Draw filled circles along the line from old to new position
      const dx = newPos.x - mousePosition.x;
      const dy = newPos.y - mousePosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.ceil(dist / 2));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = mousePosition.x + dx * t;
        const cy = mousePosition.y + dy * t;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    } else {
      context.strokeStyle = color;
      context.lineWidth = radius;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      context.moveTo(mousePosition.x, mousePosition.y);
      context.lineTo(newPos.x, newPos.y);
      context.stroke();
    }

    throttledEmit();
    setMousePosition(newPos);
  };

  const handleMouseUp = () => {
    // Always emit final canvas state on mouse up for sync
    if (emitThrottleRef.current) {
      clearTimeout(emitThrottleRef.current);
      emitThrottleRef.current = null;
    }
    emitCanvas();
    setIsPainting(false);
    setMousePosition(null);
  };

  const exitPaint = () => {
    setIsPainting(false);
    setMousePosition(null);
  };

  const clearCanvas = () => {
    if (!currentUserDrawing || !context) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    emitCanvas();
  };

  // Clear canvas when turn changes (new drawer starts)
  useEffect(() => {
    if (!socket || !context) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClearCanvas = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on("clear-canvas", handleClearCanvas);
    socket.on("start-turn", handleClearCanvas);

    return () => {
      socket.off("clear-canvas", handleClearCanvas);
      socket.off("start-turn", handleClearCanvas);
    };
  }, [socket, context]);

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
            // Track cursor position in CSS pixels for overlay
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
        {/* Eraser circle cursor - uses CSS-scaled radius */}
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
