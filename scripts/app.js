import { Board } from "./Board.js";
import * as Shapes from "./Piece.js";

///////////////////////////////////////////////////////////////////////
// DOM Elements
const $doc = $(document);
const $gameContainer = $("#game-container");
const $gameBoard = $("#game-board");
const $sidePanel = $("#side-panel");
const $scorePanel = $("#score-panel");
const $savedPieceBoard = $("#saved-piece-board");
const $nextPieceBoard = $("#next-piece-board");
const $linesClearedSpan = $("#lines-cleared");
///////////////////////////////////////////////////////////////////////
// Constants

const GAME_SPEED = 1;
const CLOCK_INTERVAL = 400;
const SHAPES = [
  new Shapes.PieceI(),
  new Shapes.PieceO(),
  new Shapes.PieceT(),
  new Shapes.PieceS(),
  new Shapes.PieceZ(),
  new Shapes.PieceJ(),
  new Shapes.PieceL(),
];

let loopID;
let prevTime, elapsedTime;
let isGameOver, isPaused, score, linesCleared;
let gameBoard, nextPieceBoard, savedPieceBoard;
let currPiece, nextPiece, heldPiece;
let hadCollision = false;

///////////////////////////////////////////////////////////////////////
// Game State

const rotateClockwise = () => {
  let shapeCopy = currPiece.shape.map((row) => [...row]);
  for (let y = 0; y < currPiece.shape.length; y++) {
    for (let x = 0; x < y; x++) {
      [currPiece.shape[y][x], currPiece.shape[x][y]] = [
        currPiece.shape[x][y],
        currPiece.shape[y][x],
      ];
    }
  }

  // let shapeCopy = currPiece.shape.map((row) => [...row]);
  // const n = currPiece.shape.length;
  // const numLayers = Math.trunc(n / 2);
  // for (let layer = 0; layer < numLayers; layer++) {
  //   let first = layer,
  //     last = n - first - 1;
  //   for (let val = first; val < last; val++) {
  //     let offset = val - first;

  //     let top = currPiece.shape[first][val];
  //     let right = currPiece.shape[val][last];
  //     let bottom = currPiece.shape[last][last - offset];
  //     let left = currPiece.shape[last - offset][first];

  //     currPiece.shape[first][val] = left;
  //     currPiece.shape[val][last] = top;
  //     currPiece.shape[last][last - offset] = right;
  //     currPiece.shape[last - offset][first] = bottom;
  //   }
  // }
  if (hasCollision(currPiece)) {
    currPiece.shape = shapeCopy;
  }
};

const updateLinesCleared = () => {
  $linesClearedSpan.html(`Lines Cleared </br> ${linesCleared}`);
};

const moveLeft = () => {
  currPiece.x = currPiece.x - 1;
  if (hasCollision(currPiece)) {
    currPiece.x = currPiece.x + 1;
  }
};

const moveRight = () => {
  currPiece.x = currPiece.x + 1;
  if (hasCollision(currPiece)) {
    currPiece.x = currPiece.x - 1;
  }
};

const moveDown = () => {
  currPiece.y = currPiece.y + 1;
  if (hasCollision(currPiece)) {
    currPiece.y = currPiece.y - 1;
    // gameOver();
    gameBoard.lockPiece(currPiece, hadCollision);
    getNewPiece();
    linesCleared += gameBoard.clearLines();
    updateLinesCleared();
  }
};

const draw = () => {
  if (!isPaused) {
    gameBoard.refresh(hadCollision);
    nextPieceBoard.refresh();
    gameBoard.drawPiece(currPiece, hadCollision);
  }
};

const gameLoop = () => {
  if (!isPaused) {
    const currTime = new Date();
    const diff = currTime.getTime() - prevTime.getTime();
    elapsedTime += diff;

    if (elapsedTime > CLOCK_INTERVAL) {
      moveDown();
      elapsedTime = 0;
    }
    prevTime = currTime;
  }
  draw();
  if (!isGameOver) {
    loopID = requestAnimationFrame(gameLoop);
  }
};

const gameOver = () => {
  console.log("Game Over");
  isGameOver = true;
  cancelAnimationFrame(loopID);
};

const hasCollision = (piece) => {
  console.log(
    `Checking collision on coords (${currPiece.x},${currPiece.y}), for current piece: ${currPiece.name}`
  );
  // if (currPiece.x < 0) return true;

  const res = piece.shape.some((row, y) => {
    return row.some((val, x) => {
      if (val === 0) return false;
      let realY = y + piece.y;
      let realX = x + piece.x;
      if (realY >= Board.BOARD_HEIGHT) return true;
      if (realX < 0 || realX >= Board.BOARD_WIDTH) return true;
      console.log(
        "Last collision condition reached",
        gameBoard.board[realY][realX],
        gameBoard.board[realY][realX] !== 0
      );
      return gameBoard.board[realY][realX] !== 0;
    });
  });
  console.log(
    `(${currPiece.x},${currPiece.y}) = ${
      res ? "Has collision" : "No collision"
    }`
  );
  hadCollision = res;
  return res;
};

const getRandomPiece = () => {
  return Object.create(SHAPES[Math.trunc(Math.random() * SHAPES.length)]);
};

const getNewPiece = () => {
  currPiece = getRandomPiece();
  // currPiece.x = currPiece.shape.length === 2 ? 4 : 3;
  // currPiece.y = 0;

  if (hasCollision(currPiece)) {
    gameOver();
  } else {
    console.log("No collision on getNewPiece()");
  }
};

const processKeyControls = (e) => {
  const key = e.key;
  switch (key) {
    case 37:
    case "ArrowLeft":
    case "a":
      console.log("Move Piece Left");
      moveLeft();
      break;
    case 38:
    case "ArrowUp":
    case "w":
      console.log("Rotate Piece Clockwise");
      rotateClockwise();
      break;
    case 39:
    case "ArrowRight":
    case "d":
      console.log("Move Piece Right");
      moveRight();
      break;
    case 40:
    case "ArrowDown":
    case "s":
      console.log("Move Piece Down Manually");
      moveDown();
      // FIXME: Add more score maybe?
      break;
    case "p":
      isPaused = true;
      break;
    case "r":
      isPaused = false;
      break;
  }
};

const bindEvents = () => {
  $doc.on("keydown", processKeyControls);
};

const resetVars = () => {
  loopID = null;
  gameBoard = new Board($gameBoard);
  nextPieceBoard = new Board($nextPieceBoard, 4, 4);
  savedPieceBoard = new Board($savedPieceBoard, 4, 4);

  isGameOver = false;
  score = 0;
  linesCleared = 0;
  updateLinesCleared();
  getNewPiece();
  // currPiece = getRandomPiece();
  // nextPiece = getRandomPiece();
  // savedShape = null;

  prevTime = new Date();
  elapsedTime = 0;
};

const init = () => {
  resetVars();
  bindEvents();
};

init();
gameLoop();

console.log(currPiece, "start", currPiece.x, currPiece.y, currPiece.name);
console.log(gameBoard);
window.gameBoard = gameBoard;
window.$gameBoard = $gameBoard;
window.currPiece = currPiece;
