import { getPlayers } from "./playerController.js";

// Game state
let drawerIndex = 0;
let word = null;
let timeout = null;
let timerInterval = null;
let drawStartTime = null;
const TURN_DURATION = 75; // seconds
let round = 0;
let playerGuessedRightWord = [];

const clearTimers = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  drawStartTime = null;
};

export const startGame = (io) => {
  console.log("Game started");
  io.emit("game-start", {});
  startTurn(io);
};

export const stopGame = (io) => {
  console.log("Game stopped");
  io.emit("game-stop", {});
  drawerIndex = 0;
  clearTimers();
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

  // Track the draw start time for synchronized timer
  drawStartTime = Date.now();

  // Emit initial timer value
  io.emit("timer-sync", TURN_DURATION);

  // Broadcast remaining time every second to keep all clients in sync
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - drawStartTime) / 1000);
    const remaining = Math.max(0, TURN_DURATION - elapsed);
    io.emit("timer-sync", remaining);

    if (remaining <= 0) {
      clearTimers();
      endTurn(io);
    }
  }, 1000);
};

export const endTurn = (io) => {
  const players = getPlayers();
  io.emit("end-turn", { player: players[drawerIndex], word });

  playerGuessedRightWord = [];
  clearTimers();

  // Clear the canvas for all players before the next turn
  io.emit("clear-canvas");

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
