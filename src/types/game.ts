// types/game.ts
export interface Player {
  id: string;
  name: string;
  avatar: string;
  score?: number;
  isDrawing?: boolean;
}

export interface ChatMessage {
  sender: string;
  message: string;
  rightGuess?: boolean;
}

export interface DrawingLine {
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
  radius: number;
}

export interface UserData {
  username: string;
  avatar: string;
}

export interface GameState {
  gameStarted: boolean;
  showWords: boolean;
  showClock: boolean;
  playerDrawing: Player | null;
  currentUserDrawing: boolean;
  selectedWord: string | null;
  wordLen: number;
  guessedWord: boolean;
}