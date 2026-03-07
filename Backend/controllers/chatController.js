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

  // Correct guess detection — ignore drawer's own guesses and duplicates
  if (word && inputMessage && inputMessage.toLowerCase() === word.toLowerCase()) {
    const drawerId = getDrawerId();
    if (userId === drawerId) return;

    const alreadyGuessed = getPlayerGuessedRightWord();
    if (alreadyGuessed.includes(userId)) return;

    console.log("Right guess by", userId);
    rightGuess = true;

    // Scoring: guesser gets time-based points, drawer gets flat bonus
    const remaining = getRemainingTime();
    const turnDuration = getTurnDuration();
    const guessScore = Math.round(BASE_POINTS * (remaining / turnDuration));
    addPoints(userId, Math.max(guessScore, 10));

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

  // End the turn early if all eligible players guessed correctly
  if (rightGuess) {
    addPlayerGuessedRight(userId);

    if (getPlayerGuessedRightWord().length === players.length - 1 - getWaitingPlayers().length) {
      io.emit("all-guessed-correct", {});
      endTurn(io);
    }
  }
};
