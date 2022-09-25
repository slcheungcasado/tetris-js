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
const CLOCK_INTERVAL = 200;
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
let currPiece, nextShape, savedShape;

///////////////////////////////////////////////////////////////////////
// Game State

const rotateClockwise = () => {
  for (let y = 0; currPiece.shape.length; y++) {
    for (let x = 0; x < y; x++) {
      [currPiece.shape[y][x], currPiece.shape[x][y]] = [
        currPiece.shape[x][y],
        currPiece.shape[y][x],
      ];
    }
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
    gameBoard.addPiece(currPiece);
    getNewPiece();
    linesCleared += gameBoard.clearLines();
    updateLinesCleared();
  }
};

const draw = () => {
  if (!isPaused) {
    gameBoard.refresh();
    gameBoard.drawPiece(currPiece);
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
  return piece.shape.some((row, y) => {
    return row.some((val, x) => {
      if (val === 0) return false;
      const realY = y + piece.y;
      const realX = x + piece.x;
      if (realY >= Board.BOARD_HEIGHT) return true;
      if (realX < 0 || realX >= Board.BOARD_WIDTH) return true;
      return gameBoard.board[realY][realX] !== 0;
    });
  });
};

const getRandomPiece = () => {
  return Object.create(SHAPES[Math.trunc(Math.random() * SHAPES.length)]);
};

const getNewPiece = () => {
  currPiece = getRandomPiece();
  currPiece.x = currPiece.length === 2 ? 4 : 3;
  currPiece.y = 0;

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
      console.log("Move Piece Left");
      moveLeft();
      break;
    case 38:
    case "ArrowUp":
      console.log("Rotate Piece Clockwise");
      rotateClockwise();
      break;
    case 39:
    case "ArrowRight":
      console.log("Move Piece Right");
      moveRight();
      break;
    case 40:
    case "ArrowDown":
      console.log("Move Piece Down Manually");
      moveDown();
      // FIXME: Add more score maybe?
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
  // nextShape = getRandomPiece();
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
