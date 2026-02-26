import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  sender: string;
  message: string;
  rightGuess: boolean;
}

interface ChatSidebarProps {
  allChats: ChatMessage[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onSubmitChat: (e: React.FormEvent) => void;
  disabled: boolean;
  sendDisabled: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  allChats,
  inputMessage,
  setInputMessage,
  onSubmitChat,
  disabled,
  sendDisabled,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="w-64 shrink-0 backdrop-blur-sm bg-white/90 shadow-lg self-stretch flex flex-col">
      <CardHeader className="pb-2 px-3 pt-4">
        <CardTitle className="text-base text-purple-600 text-center">
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2 flex flex-col flex-1 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-1 mb-2 min-h-[300px] max-h-[440px]">
          {allChats.map((chat, idx) => (
            <div
              key={idx}
              className={cn(
                "text-xs px-2 py-1 rounded",
                chat.rightGuess
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "text-gray-700"
              )}
            >
              {chat.rightGuess ? (
                <span>🎉 {chat.message}</span>
              ) : (
                <span>
                  <strong>{chat.sender}:</strong> {chat.message}
                </span>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={onSubmitChat} className="flex gap-1.5">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your guess..."
            disabled={disabled}
            className={cn(
              "text-xs h-8",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
          <Button
            type="submit"
            size="sm"
            disabled={sendDisabled}
            className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 text-xs shrink-0"
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
