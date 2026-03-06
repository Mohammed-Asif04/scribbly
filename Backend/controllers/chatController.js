import { getPlayers, getPlayerById, addPoints, getWaitingPlayers } from "./playerController.js";
import {
  getCurrentWord,
  getPlayerGuessedRightWord,
  addPlayerGuessedRight,
  endTurn,
  getRemainingTime,
  getTurnDuration,
  getDrawerId,
} from "./gameController.js";

const BASE_POINTS = 300;
const DRAWER_POINTS_PER_GUESS = 50;

export const handleChat = (io, socket, inputMessage) => {
  const players = getPlayers();
  const userId = socket.id;
  const index = players.findIndex((p) => p.id === userId);

  if (index === -1) return;

  const word = getCurrentWord();
  let rightGuess = false;

  // Check if the message matches the current word
  if (word && inputMessage && inputMessage.toLowerCase() === word.toLowerCase()) {
    // Don't allow the drawer to guess their own word
    const drawerId = getDrawerId();
    if (userId === drawerId) return;

    // Don't allow duplicate guesses
    const alreadyGuessed = getPlayerGuessedRightWord();
    if (alreadyGuessed.includes(userId)) return;

    console.log("Right guess by", userId);
    rightGuess = true;

    // Guesser score: 300 × (timeRemaining / 75)
    const remaining = getRemainingTime();
    const turnDuration = getTurnDuration();
    const guessScore = Math.round(BASE_POINTS * (remaining / turnDuration));
    addPoints(userId, Math.max(guessScore, 10)); // minimum 10 points

    // Drawer score: 50 per correct guess
    if (drawerId) {
      addPoints(drawerId, DRAWER_POINTS_PER_GUESS);
    }
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
    addPlayerGuessedRight(userId);

    // If all non-drawing, non-spectator players guessed correctly, end the turn
    if (getPlayerGuessedRightWord().length === players.length - 1 - getWaitingPlayers().length) {
      io.emit("all-guessed-correct", {});
      endTurn(io);
    }
  }
};
