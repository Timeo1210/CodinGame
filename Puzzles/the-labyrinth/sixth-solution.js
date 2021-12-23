// Explore all dots
const inputs = readline().split(" ");
const R = parseInt(inputs[0]); // number of rows.
const C = parseInt(inputs[1]); // number of columns.
const A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.
const gameStats = {
  allowedEnergie: 500,
  energie: 1200,
  explored: false,
  powerFieldOn: true,
};
const player = {
  r: null,
  c: null,
};
const avoidType = ["#", "C"];

const offsets = [
  {
    r: -1,
    c: 0,
    d: "UP",
  },
  {
    r: 0,
    c: 1,
    d: "RIGHT",
  },
  {
    r: 1,
    c: 0,
    d: "DOWN",
  },
  {
    r: 0,
    c: -1,
    d: "LEFT",
  },
];
const modifyStrAt = (str, index, value) => {
  return str.substring(0, index) + value + str.substring(index + 1);
};
const isTileEqualTile = (nodeA, nodeB) =>
  nodeA.r === nodeB.r && nodeA.c === nodeB.c;
const updateData = (KR, KC) => {
  // Energie
  gameStats.energie--;
  if (gameStats.energie <= gameStats.allowedEnergie) {
    return console.log("BREAK");
  }

  // Player
  (player.r = KR), (player.c = KC);
};
const updateMatrice = (matrice) => {
  // Show Player
  matrice[player.r] = modifyStrAt(matrice[player.r], player.c, "P");
};

const bfs = (matrice, goal) => {
  const visited = [];
  const queue = [];
  const cameFrom = {};
  queue.push(player);
  visited.push(player);

  while (queue.length !== 0) {
    const position = queue.shift();
    for (const neighbor of getNeighbors(matrice, position)) {
      if (!visited.some((value) => isTileEqualTile(value, neighbor))) {
        visited.push(neighbor);
        queue.push(neighbor);
        cameFrom[`${neighbor.r}|${neighbor.c}`] = position;
        if (matrice[neighbor.r][neighbor.c] === goal)
          return [cameFrom, neighbor];
      }
    }
  }

  return [null, null];
};

const getNeighbors = (matrice, position) => {
  const neighbors = [];
  const addToNeighbors = (newPosR, newPosC) => {
    if (!avoidType.includes(matrice[newPosR][newPosC]))
      neighbors.push({ r: newPosR, c: newPosC });
  };
  if (position.r > 0) addToNeighbors(position.r - 1, position.c);
  if (position.r < R - 1) addToNeighbors(position.r + 1, position.c);
  if (position.c > 0) addToNeighbors(position.r, position.c - 1);
  if (position.c < C - 1) addToNeighbors(position.r, position.c + 1);

  return neighbors;
};

const constructPath = (cameFrom, neighbor) => {
  let currPos = neighbor;
  const stack = [];
  while (cameFrom[`${currPos.r}|${currPos.c}`] !== undefined) {
    stack.push(currPos);
    currPos = cameFrom[`${currPos.r}|${currPos.c}`];
  }
  stack.push(currPos);
  return stack;
};

const getOutput = (nextPos) => {
  const newOffset = {
    r: nextPos.r - player.r,
    c: nextPos.c - player.c,
  };
  const offsetIndex = offsets.findIndex((value) =>
    isTileEqualTile(value, newOffset)
  );
  return offsets[offsetIndex].d;
};

while (true) {
  const inputs = readline().split(" ");
  const KR = parseInt(inputs[0]); // row where Rick is located.
  const KC = parseInt(inputs[1]); // column where Rick is located.
  const matrice = [];
  for (let i = 0; i < R; i++) {
    const ROW = readline();
    matrice.push(ROW);
  }

  updateData(KR, KC);
  console.error("PlayerPos:", player);

  if (matrice[player.r][player.c] === "C") {
    gameStats.powerFieldOn = false;
  }

  let cameFrom, neighbor;
  if (!gameStats.explored) {
    [cameFrom, neighbor] = bfs(matrice, "?");
    if (cameFrom === null) {
      gameStats.explored = true;
      avoidType.pop();
    }
  }
  if (gameStats.explored) {
    console.error("END");
    if (gameStats.powerFieldOn) {
      [cameFrom, neighbor] = bfs(matrice, "C");
    } else {
      [cameFrom, neighbor] = bfs(matrice, "T");
    }
  }

  const paths = constructPath(cameFrom, neighbor);
  const nextPos = paths[paths.length - 2];
  console.error("nextPos", nextPos);
  const output = getOutput(nextPos);

  console.log(output);

  updateMatrice(matrice);
  console.error(matrice);
}
