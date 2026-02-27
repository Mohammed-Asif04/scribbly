import { getPlayers, getPlayerById, addPoints } from "./playerController.js";
import {
  getCurrentWord,
  getPlayerGuessedRightWord,
  addPlayerGuessedRight,
  endTurn,
} from "./gameController.js";

export const handleChat = (io, socket, inputMessage) => {
  const players = getPlayers();
  const userId = socket.id;
  const index = players.findIndex((p) => p.id === userId);

  if (index === -1) return;

  const word = getCurrentWord();
  let rightGuess = false;

  // Check if the message matches the current word
  if (word && inputMessage && inputMessage.toLowerCase() === word.toLowerCase()) {
    console.log("Right guess by", userId);
    rightGuess = true;
    addPoints(userId, 100);
  }

  const returnObject = {
    msg: inputMessage,
    player: players[index],
    rightGuess,
    players,
  };

  io.emit("recieve-chat", returnObject);

  // Handle all-guessed-correct scenario
  if (rightGuess) {
    const alreadyGuessed = getPlayerGuessedRightWord().filter(
      (pId) => pId === userId
    );

    if (alreadyGuessed.length === 0) {
      addPlayerGuessedRight(userId);

      // If all non-drawing players guessed correctly, end the turn
      if (getPlayerGuessedRightWord().length === players.length - 1) {
        io.emit("all-guessed-correct", {});
        endTurn(io);
      }
    }
  }
};
