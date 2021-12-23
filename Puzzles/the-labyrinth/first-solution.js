/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(" ");
const R = parseInt(inputs[0]); // number of rows.
const C = parseInt(inputs[1]); // number of columns.
const A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.
console.error("Row:", R, "Column:", C);
const supposedC = { r: 0, c: 0 };
let energie = 1200;
const T = { r: 0, c: 0 };
let powerFieldOn = true;
const tileSteppedWithPower = {};
const tileSteppedNoPower = {};

const findCInRadar = (matrice, KR, KC) => {
  const startR = Math.max(0, KR - 2);
  const startC = Math.max(0, KC - 2);
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 5; i++) {
      if (matrice[startR + j][startC + i] === "C") {
        console.error("C IS IN RADAR");
        return [startR + j, startC + i];
      }
    }
  }
  return [supposedC.r, supposedC.c];
};

// game loop
while (true) {
  if (energie <= 500) console.log("BREAK");
  energie -= 1;
  var inputs = readline().split(" ");
  const KR = parseInt(inputs[0]); // row where Rick is located.
  const KC = parseInt(inputs[1]); // column where Rick is located.
  const matrice = [];
  for (let i = 0; i < R; i++) {
    const ROW = readline(); // C of the characters in '#.TC?' (i.e. one line of the ASCII maze).
    matrice.push(ROW);
  }

  if (T.r === 0 && T.c === 0) {
    T.r = KR;
    T.c = KC;
  }

  if (powerFieldOn) {
    if (supposedC.r === 0 && supposedC.c === 0) {
      supposedC.r = R - KR;
      supposedC.c = C - KC;
    }
    const newSupposedC = findCInRadar(matrice, KR, KC);
    supposedC.r = newSupposedC[0];
    supposedC.c = newSupposedC[1];
    if (supposedC.r === KR && supposedC.c === KC) {
      // Step in room
      supposedC.r = T.r;
      supposedC.c = T.c;
      powerFieldOn = false;
    }
  } else {
    supposedC.r = T.r;
    supposedC.c = T.c;
  }
  console.error("supposedC:", supposedC);

  console.error("Rick :", KR, KC);
  const direction = {
    r: supposedC.r - KR,
    c: supposedC.c - KC,
  };
  console.error("DIRECTION:", direction);
  const orderOfNewDirection = new Array(3);

  if (Math.abs(direction.r) > Math.abs(direction.c)) {
    // Prioritize the vertical
    if (direction.r > 0) {
      orderOfNewDirection[0] = [-1, 0, "UP"]; // UP
      orderOfNewDirection[3] = [1, 0, "DOWN"]; // DOWN
    } else {
      orderOfNewDirection[0] = [1, 0, "DOWN"]; // DOWN
      orderOfNewDirection[3] = [-1, 0, "UP"]; // UP
    }
    if (direction.c > 0) {
      orderOfNewDirection[1] = [0, 1, "RIGHT"]; // RIGHT
      orderOfNewDirection[2] = [0, -1, "LEFT"]; // LEFT
    } else {
      orderOfNewDirection[1] = [0, -1, "LEFT"]; // LEFT;
      orderOfNewDirection[2] = [0, 1, "RIGHT"]; // RIGHT
    }
  } else {
    // Prioritize the horizontal
    if (direction.c > 0) {
      orderOfNewDirection[0] = [0, 1, "RIGHT"]; // RIGHT
      orderOfNewDirection[3] = [0, -1, "LEFT"]; // LEFT
    } else {
      orderOfNewDirection[0] = [0, -1, "LEFT"]; // LEFT;
      orderOfNewDirection[3] = [0, 1, "RIGHT"]; // RIGHT
    }
    if (direction.r > 0) {
      orderOfNewDirection[1] = [1, 0, "DOWN"]; // DOWN
      orderOfNewDirection[2] = [-1, 0, "UP"]; // UP
    } else {
      orderOfNewDirection[1] = [-1, 0, "UP"]; // UP
      orderOfNewDirection[2] = [1, 0, "DOWN"]; // DOWN
    }
  }
  console.error("orderOfNewDirection", orderOfNewDirection);
  matrice[KR] =
    matrice[KR].substring(0, KC) + "K" + matrice[KR].substring(KC + 1);
  console.error(matrice);
  for (const newDirection of orderOfNewDirection) {
    if (matrice[KR + newDirection[0]][KC + newDirection[1]] !== "#") {
      if (powerFieldOn) {
        if (
          Object.keys(tileSteppedWithPower).some(
            (value) =>
              value === `${KR + newDirection[0]}|${KC + newDirection[1]}`
          )
        ) {
          continue;
        }
        tileSteppedWithPower[
          `${KR + newDirection[0]}|${KC + newDirection[1]}`
        ] = true;
      }
      if (!powerFieldOn) {
        if (
          Object.keys(tileSteppedNoPower).some(
            (value) =>
              value === `${KR + newDirection[0]}|${KC + newDirection[1]}`
          )
        ) {
          continue;
        }
        tileSteppedNoPower[
          `${KR + newDirection[0]}|${KC + newDirection[1]}`
        ] = true;
      }
      console.log(newDirection[2]);
      break;
    }
  }
  console.error("POWERFIELDON", powerFieldOn);
  if (powerFieldOn) console.error(tileSteppedWithPower);
  else console.error(tileSteppedNoPower);

  // Write an action using console.log()
  // To debug: console.error('Debug messages...');

  // console.log('RIGHT');     // Rick's next move (UP DOWN LEFT or RIGHT).
}
