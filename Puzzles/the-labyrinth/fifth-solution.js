// Explore all dots
const inputs = readline().split(" ");
const R = parseInt(inputs[0]); // number of rows.
const C = parseInt(inputs[1]); // number of columns.
const A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.
const gameStats = {
  allowedEnergie: 1150,
  energie: 1200,
  powerFieldOn: true,
  startPos: {
    r: null,
    c: null,
  },
  endPos: {
    r: null,
    c: null,
  },
  exploring: true,
};
const player = {
  r: null,
  c: null,
};
const mazeTiles = {};
const toFollow = [];
const tileToExplore = [];

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

const updateData = (matrice, KR, KC) => {
  // Energie
  gameStats.energie--;
  if (gameStats.energie <= gameStats.allowedEnergie) {
    return console.log("BREAK");
  }

  // startPos
  if (gameStats.startPos.r === null || gameStats.startPos.c === null) {
    gameStats.startPos = {
      r: KR,
      c: KC,
    };
  }

  // Player
  (player.r = KR), (player.c = KC);
};
const updateMatrice = (matrice) => {
  // Show Player
  matrice[player.r] = modifyStrAt(matrice[player.r], player.c, "P");

  for (const rawCoord of Object.keys(mazeTiles)) {
    const coord = {
      r: parseInt(rawCoord.split("|")[0]),
      c: parseInt(rawCoord.split("|")[1]),
    };
    matrice[coord.r] = modifyStrAt(matrice[coord.r], coord.c, "*");
  }
};

const addCoordTo = (object, row, column, value = true) => {
  object[`${row}|${column}`] = value;
};

const isTileEqualTile = (nodeA, nodeB) =>
  nodeA.r === nodeB.r && nodeA.c === nodeB.c;

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

const calculateDisanceBetweenTwoNode = (firstNode, secondNode) => {
  const rDistance = Math.abs(firstNode.r - secondNode.r);
  const cDistance = Math.abs(firstNode.c - secondNode.c);
  return rDistance + cDistance;
};
const astar = (matrice, startTile, endTile) => {
  const openList = [];
  const closedList = [];
  const paths = [];

  const startNode = {
    r: startTile.r,
    c: startTile.c,
  };
  const endNode = {
    r: endTile.r,
    c: endTile.c,
  };

  const calculateCosts = (node) => {
    const hCost = calculateDisanceBetweenTwoNode(startNode, node);
    const gCost = calculateDisanceBetweenTwoNode(endNode, node);
    return {
      h: hCost,
      g: gCost,
      f: hCost + gCost,
    };
  };

  startNode.costs = calculateCosts(startNode);
  endNode.costs = calculateCosts(endNode);

  openList.push(startNode);
  while (openList.length > 0) {
    openList.sort((a, b) => a.costs.f - b.costs.f);
    const currentNode = openList[0];

    openList.shift();
    closedList.push(currentNode);

    if (isTileEqualTile(currentNode, endNode)) {
      let current = currentNode;
      while (current !== undefined) {
        paths.push({ r: current.r, c: current.c });
        current = current.parent;
      }
      paths.reverse();
      break;
    }

    const childrenNode = [];
    for (const offset of offsets) {
      const newNode = {
        parent: currentNode,
        r: currentNode.r + offset.r,
        c: currentNode.c + offset.c,
      };
      // Is in range
      if (
        newNode.r < 0 ||
        newNode.r >= matrice.length ||
        newNode.c < 0 ||
        newNode.c >= matrice[newNode.r].length
      )
        continue;
      newNode.costs = calculateCosts(newNode);
      childrenNode.push(newNode);
    }

    for (const childNode of childrenNode) {
      // Is walkable
      if (
        matrice[childNode.r][childNode.c] === "#" ||
        matrice[childNode.r][childNode.c] === "?"
      )
        continue;
      // Is in closedList
      if (closedList.some((value) => isTileEqualTile(value, childNode)))
        continue;
      // Is in openList and longer path
      for (const openNode of openList) {
        if (isTileEqualTile(childNode, openNode) && childNode.g > openNode.g)
          continue;
      }
      openList.push(childNode);
    }
  }
  paths.shift();
  return paths;
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

  updateData(matrice, KR, KC);
  updateMatrice(matrice);
  console.error("PlayerPos:", player);

  addCoordTo(mazeTiles, player.r, player.c);

  if (toFollow.length > 0) {
    console.error("Following:", toFollow);
    const output = getOutput(toFollow[0]);
    toFollow.shift();
    console.log(output);
    continue;
  }

  if (!gameStats.exploring) {
    console.error("Going to Home");
  }

  const startR = Math.max(
    0,
    Math.min(player.r - 1, player.r - 2, player.r - 3)
  );
  const startC = Math.max(
    0,
    Math.min(player.c - 1, player.c - 2, player.c - 3)
  );
  let nearestCell = { r: null, c: null, d: Infinity }; // may be an array
  for (let j = 0; j < 7; j++) {
    for (let i = 0; i < 7; i++) {
      if (startR + j < R && startC + i < C) {
        const newNode = {
          r: startR + j,
          c: startC + i,
        };
        newNode.d = calculateDisanceBetweenTwoNode(player, newNode);

        if (
          matrice[startR + j][startC + i] === "?" &&
          !tileToExplore.some((value) => isTileEqualTile(value, newNode)) &&
          nearestCell.d > newNode.d
        ) {
          // tileToExplore.push({
          //   r: newNode.r,
          //   c: newNode.c,
          // });
          nearestCell = newNode;
        }

        if (
          gameStats.endPos.r === null &&
          gameStats.endPos.c === null &&
          matrice[startR + j][startC + i] === "C"
        ) {
          console.error("C IS IN RADAR");
          gameStats.endPos = {
            r: newNode.r,
            c: newNode.c,
          };
        }
      }
    }
  }

  console.error(nearestCell);
  // console.error("tileToExplore", tileToExplore);
  // Finished exploring
  // if (tileToExplore.length === 0) {
  //   console.error("Going to PowerField");
  // }

  // let pathToFollow = [];
  // let index = -1;
  // while (pathToFollow.length === 0) {
  //   index++;
  //   matrice[tileToExplore[index].r] = modifyStrAt(
  //     matrice[tileToExplore[index].r],
  //     tileToExplore[index].c,
  //     "."
  //   );
  //   pathToFollow = astar(matrice, player, tileToExplore[index]);
  //   matrice[tileToExplore[index].r] = modifyStrAt(
  //     matrice[tileToExplore[index].r],
  //     tileToExplore[index].c,
  //     "?"
  //   );
  // }
  // console.error("Exploring", tileToExplore[index]);
  // tileToExplore.splice(index, 1);
  // const output = getOutput(pathToFollow[0]);
  // pathToFollow.shift();
  // toFollow.push(...pathToFollow);

  console.log(output);
  console.error(matrice);
}
