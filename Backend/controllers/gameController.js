import { getPlayers } from "./playerController.js";

// Game state
let drawerIndex = 0;
let word = null;
let timeout = null;
let round = 0;
let playerGuessedRightWord = [];

export const startGame = (io) => {
  console.log("Game started");
  io.emit("game-start", {});
  startTurn(io);
};

export const stopGame = (io) => {
  console.log("Game stopped");
  io.emit("game-stop", {});
  drawerIndex = 0;
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

export const startTurn = (io) => {
  const players = getPlayers();
  if (players.length === 0) return;

  if (drawerIndex >= players.length) {
    drawerIndex = 0;
  }

  // Notify frontend to start turn with current drawer
  io.emit("start-turn", players[drawerIndex]);
};

export const startDraw = (io) => {
  const players = getPlayers();
  io.emit("start-draw", players[drawerIndex]);

  timeout = setTimeout(() => {
    endTurn(io);
  }, 60000);
};

export const endTurn = (io) => {
  const players = getPlayers();
  io.emit("end-turn", players[drawerIndex]);

  playerGuessedRightWord = [];
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }

  // Advance to next drawer
  drawerIndex = (drawerIndex + 1) % players.length;
  startTurn(io);
};

export const handleWordSelect = (io, w) => {
  word = w;
  const wordLength = w.length;
  io.emit("word-len", wordLength);
  startDraw(io);
};

export const getCurrentWord = () => word;

export const getPlayerGuessedRightWord = () => playerGuessedRightWord;

export const addPlayerGuessedRight = (playerId) => {
  playerGuessedRightWord.push(playerId);
};

export const resetPlayerGuessedRight = () => {
  playerGuessedRightWord = [];
};
