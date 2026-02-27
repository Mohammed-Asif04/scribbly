// In-memory player store
const players = [];

export const addPlayer = (id, name, avatar) => {
  const newPlayer = {
    id,
    name,
    points: 0,
    avatar,
  };
  players.push(newPlayer);
  return newPlayer;
};

export const removePlayer = (id) => {
  const index = players.findIndex((p) => p.id === id);
  if (index > -1) {
    players.splice(index, 1);
  }
};

export const getPlayers = () => players;

export const getPlayerById = (id) => players.find((p) => p.id === id);

export const addPoints = (id, points) => {
  const player = getPlayerById(id);
  if (player) {
    player.points += points;
  }
};
