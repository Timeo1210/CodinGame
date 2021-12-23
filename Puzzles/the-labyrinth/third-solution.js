// Explore all the maze
// A* to find shortest path
const inputs = readline().split(" ");
const R = parseInt(inputs[0]); // number of rows.
const C = parseInt(inputs[1]); // number of columns.
const A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.
const gameStats = {
  allowedEnergie: 1,
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
  finish: false,
};
const mazeTiles = {};
const tileToExplore = [];
const player = {
  r: 0,
  c: 0,
};
const toFollow = [];
const nodesToExplore = [];
var currentNode = null;

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
  const modifyStrAt = (str, index, value) => {
    return str.substring(0, index) + value + str.substring(index + 1);
  };
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

const getCoordFrom = (object, row, column) => {
  return object[`${row}|${column}`];
};
const addCoordTo = (object, row, column, value = true) => {
  object[`${row}|${column}`] = value;
};
const deleteCoordTo = (object, row, column) => {
  delete object[`${row}|${column}`];
};

const removeTileFromArray = (object, node) => {
  const nodeToRemoveIndexOfObject = tileToExplore.findIndex((value) =>
    isTileEqualTile(value, node)
  );
  object.splice(nodeToRemoveIndexOfObject, 1);
};

const isTileEqualTile = (nodeA, nodeB) =>
  nodeA.r === nodeB.r && nodeA.c === nodeB.c;

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
    const calculateDisanceBetweenTwoNode = (firstNode, secondNode) => {
      const rDistance = Math.abs(firstNode.r - secondNode.r);
      const cDistance = Math.abs(firstNode.c - secondNode.c);
      return rDistance + cDistance;
    };
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
      if (matrice[childNode.r][childNode.c] === "#") continue;
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
  return paths;
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

const processNextTile = (matrice, nextTile) => {
  console.error("nextTile", nextTile);
  const pathsToNextTile = astar(matrice, player, nextTile);
  pathsToNextTile.shift();
  // console.error("pathsToNextTile", pathsToNextTile);
  const output = getOutput(pathsToNextTile[0]);
  pathsToNextTile.shift();
  toFollow.push(...pathsToNextTile);
  return output;
};

const findCInRadar = (matrice, KR, KC) => {
  const startR = Math.max(0, KR - 2);
  const startC = Math.max(0, KC - 2);
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 5; i++) {
      if (startR + j < R && startC + i < C) {
        if (matrice[startR + j][startC + i] === "C") {
          console.error("C IS IN RADAR");
          return [startR + j, startC + i];
        }
      }
    }
  }
  return [null, null];
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
  if (gameStats.endPos.r === null || gameStats.endPos.c === null) {
    const cPos = findCInRadar(matrice, player.r, player.c);
    if (cPos[0] !== null && cPos[1] !== null) {
      console.error("C WAS FIND");
      gameStats.endPos.r = cPos[0];
      gameStats.endPos.c = cPos[1];
    }
  }
  console.error("PlayerPos:", player);

  // Remove Explored Tile
  removeTileFromArray(tileToExplore, player);
  addCoordTo(mazeTiles, player.r, player.c);

  if (toFollow.length > 0) {
    console.error("toFollow", toFollow);
    const output = getOutput(toFollow[0]);
    toFollow.shift();
    console.log(output);
    continue;
  }

  if (gameStats.finish) {
    let Ooutput = processNextTile(matrice, gameStats.startPos);
    console.log(Ooutput);
    continue;
  }

  // Check surrounding
  const tempTile = [];
  for (const offset of offsets) {
    const newCoord = {
      r: player.r + offset.r,
      c: player.c + offset.c,
      // parent: lastTile,
      // children: [],
    };
    if (
      matrice[newCoord.r][newCoord.c] === "." &&
      !getCoordFrom(mazeTiles, newCoord.r, newCoord.c)
    ) {
      // if (tileToExplore.length > 0) {
      //   tileToExplore.unshift(newCoord);
      // } else {
      //   tileToExplore.push(newCoord);
      // }
      tempTile.push(newCoord);
    }
  }
  console.error("tempTile", tempTile);
  // console.error("ToExplore:", tileToExplore);
  // console.error("MazeTiles", mazeTiles);

  let output;
  if (currentNode !== null || tempTile.length > 1) {
    if (tempTile.length > 1) {
      console.error("ADD NEW NODE");
      nodesToExplore.unshift(...tempTile.map((value) => [value]));
      currentNode = nodesToExplore[0];
    } else {
      if (
        tempTile.length < 0 &&
        nodesToExplore.some((node) =>
          node.some((value) => isTileEqualTile(value, tempTile[0]))
        )
      ) {
        console.error("ALLREADY");
      } else {
        console.error("ADD currentNode");
        currentNode.push(...tempTile);
      }
    }

    while (currentNode !== null && currentNode.length == 0) {
      if (currentNode !== null && currentNode.length == 0) {
        console.error("UPDATE currentNode");
        nodesToExplore.shift();
        if (nodesToExplore.length > 0) {
          currentNode = nodesToExplore[0];
        } else {
          currentNode = null;
        }
      }
    }

    console.error("nodesToExplore:", nodesToExplore);
    console.error("currentNode", currentNode);
    if (currentNode === null) {
      console.error("EEEND");
      // go to c;
      output = processNextTile(matrice, gameStats.endPos);
      gameStats.finish = true;
    } else {
      const nextTile = currentNode[0];
      output = processNextTile(matrice, nextTile);
      currentNode.shift();
    }
  } else {
    if (tempTile.length === 0) {
      console.error("EEEND");
      // go to c;
      output = processNextTile(matrice, gameStats.endPos);
      gameStats.finish = true;
      console.log(output);
      continue;
    }
    tileToExplore.push(...tempTile);
    const nextTile = tileToExplore[0];
    output = processNextTile(matrice, nextTile);
  }

  console.log(output);
  console.error(matrice);
}
