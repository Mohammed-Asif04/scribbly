export interface Player {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

export interface ChatMessage {
  sender: string;
  message: string;
  rightGuess: boolean;
  system?: boolean;
  type?: "join" | "leave" | "drawing" | "word-reveal" | "right-guess";
}
