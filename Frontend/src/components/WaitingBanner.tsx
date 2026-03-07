import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock } from "lucide-react";

const WaitingBanner: React.FC = () => {
  return (
    <Alert className="border-amber-300 bg-amber-50/95 backdrop-blur-sm shadow-lg animate-pulse">
      <Clock className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800 font-bold">Waiting to join</AlertTitle>
      <AlertDescription className="text-amber-700">
        A round is in progress. You'll join the game when the current turn ends!
      </AlertDescription>
    </Alert>
  );
};

export default WaitingBanner;
