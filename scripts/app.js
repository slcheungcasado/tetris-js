import { Board } from "./Board.js";
import * as Shapes from "./Piece.js";

///////////////////////////////////////////////////////////////////////
// DOM Elements
const $doc = $(document);
const $gameContainer = $("#game-container");
const $gameBoard = $("#game-board");
const $gameHeader = $("#heading-wrapper");
const $gameFooter = $("#game-footer");
// const $sidePanel = $("#side-panel");
// const $scorePanel = $("#score-panel");
const $savedPieceBoard = $("#saved-piece-board");
const $nextPieceBoard = $("#next-piece-board");

const $gameLevelSpan = $("#game-level");
const $linesClearedSpan = $("#lines-cleared");
const $playedScoreSpan = $("#player-score");

const $infoBtn = $("#info-btn");
const $infoModal = $("#info-modal-div");
const $infoModalCloseBtn = $("#info-modal-close-button");

const $gameOverHeader = $("#game-over-header");

const $restartBtn = $("#restart-btn");

///////////////////////////////////////////////////////////////////////
// Constants

const FADE_SPEED = 650;
const SHAPES = ["i", "o", "t", "s", "z", "j", "l"];

const LEVEL_CONFIGS = {
  0: { val: 0, speed: 800, linesClearedThreshold: 0, scoreMultiplier: 1 },
  1: { val: 1, speed: 700, linesClearedThreshold: 5, scoreMultiplier: 1.5 },
  2: { val: 2, speed: 600, linesClearedThreshold: 10, scoreMultiplier: 2 },
  3: { val: 3, speed: 500, linesClearedThreshold: 15, scoreMultiplier: 2.5 },
  4: { val: 4, speed: 400, linesClearedThreshold: 20, scoreMultiplier: 3 },
  5: { val: 5, speed: 300, linesClearedThreshold: 25, scoreMultiplier: 4 },
  6: { val: "MAX", speed: 200, linesClearedThreshold: 30, scoreMultiplier: 5 },
};

let loopID;
let prevTime, elapsedTime;
let isGameOver, isPaused;
let score, linesCleared, currentLevel;
let gameBoard, nextPieceBoard, savedPieceBoard;
let currPiece, nextPiece, savedPiece;
let hadCollision, hasSwapped, isLocking;

///////////////////////////////////////////////////////////////////////
// Game State

const setLevel = (linesCleared) => {
  for (let level of Object.values(LEVEL_CONFIGS)) {
    if (linesCleared >= level.linesClearedThreshold) {
      currentLevel = level;
    }
  }
};

const updateGameInfo = () => {
  $gameLevelSpan.html(`Level </br> ${currentLevel.val}`);
  $linesClearedSpan.html(`Lines Cleared </br> ${linesCleared}`);
  $playedScoreSpan.html(`Score </br> ${score}`);
};

const hasCollision = (piece) => {
  hadCollision = piece.shape.some((row, y) => {
    return row.some((val, x) => {
      if (val === 0) return false;
      let realY = y + piece.y;
      let realX = x + piece.x;
      if (realY >= Board.BOARD_HEIGHT) return true;
      if (realX < 0 || realX >= Board.BOARD_WIDTH) return true;

      return gameBoard.board[realY][realX] !== 0;
    });
  });
  return hadCollision;
};

const rotateClockwise = () => {
  let shapeCopy = currPiece.shape.map((row) => [...row]);
  const n = currPiece.shape.length;
  const numLayers = Math.trunc(n / 2);
  for (let layer = 0; layer < numLayers; layer++) {
    let first = layer,
      last = n - first - 1;
    for (let val = first; val < last; val++) {
      let offset = val - first;

      let top = currPiece.shape[first][val];
      let right = currPiece.shape[val][last];
      let bottom = currPiece.shape[last][last - offset];
      let left = currPiece.shape[last - offset][first];

      currPiece.shape[first][val] = left;
      currPiece.shape[val][last] = top;
      currPiece.shape[last][last - offset] = right;
      currPiece.shape[last - offset][first] = bottom;
    }
  }
  if (hasCollision(currPiece)) {
    currPiece.shape = shapeCopy;
  }
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
    isLocking = true;
    currPiece.y = currPiece.y - 1;
    gameBoard.lockPiece(currPiece);
    getNewCurrentPiece();
    linesCleared += gameBoard.clearLines();
    setLevel(linesCleared);
    score += Math.trunc(linesCleared * currentLevel.scoreMultiplier);
    hasSwapped = false;
  }
  isLocking = false;
};

const draw = () => {
  if (!isPaused) {
    gameBoard.refresh();
    nextPieceBoard.refresh();
    savedPieceBoard.refresh();
    gameBoard.drawPiece(currPiece);
    nextPieceBoard.drawPiece(nextPiece);
    savedPieceBoard.drawPiece(savedPiece);
    updateGameInfo();
  }
};

const gameLoop = () => {
  if (!isPaused) {
    const currTime = new Date();
    const diff = currTime.getTime() - prevTime.getTime();
    elapsedTime += diff;

    if (elapsedTime > currentLevel.speed) {
      moveDown();
      elapsedTime = 0;
    }
    prevTime = currTime;
  }
  if (!hadCollision) {
    draw();
  } else {
    //can draw
  }
  if (!isGameOver) {
    loopID = requestAnimationFrame(gameLoop);
  }
};

const gameOver = () => {
  isGameOver = true;
  cancelAnimationFrame(loopID);
  $gameOverHeader.removeClass("visually-hidden");
};

const getRandomPiece = () => {
  const pieceName = SHAPES[Math.trunc(Math.random() * SHAPES.length)];
  return Shapes.makePiece(pieceName);
};

const getNewCurrentPiece = () => {
  currPiece = nextPiece;
  currPiece.x = currPiece.shape.length === 2 ? 4 : 3;
  currPiece.y = 0;
  nextPiece = getRandomPiece();

  if (hasCollision(currPiece)) {
    gameOver();
  } else {
    // console.log("No collision on getNewPiece()");
  }
};

const saveOrSwapPiece = () => {
  if (savedPiece === null) {
    currPiece.x = 0;
    currPiece.y = 0;
    savedPiece = structuredClone(currPiece);
    currPiece = nextPiece;
    currPiece.x = currPiece.shape.length === 2 ? 4 : 3;
    currPiece.y = 0;

    nextPiece = getRandomPiece();
    hasSwapped = true;
  } else {
    const currPieceCoords = structuredClone({ x: currPiece.x, y: currPiece.y });
    const currPieceClone = structuredClone(currPiece);
    const savedPieceClone = structuredClone(savedPiece);

    currPiece = savedPiece;
    currPiece.x = currPieceCoords.x;
    currPiece.y = currPieceCoords.y;

    if (hasCollision(currPiece)) {
      // console.log("Can't swap due to collision");
      currPiece = currPieceClone;
      savedPiece = savedPieceClone;
    } else {
      currPieceClone.x = 0;
      currPieceClone.y = 0;
      savedPiece = currPieceClone;
      hasSwapped = true;
    }
  }
};

const processKeyControls = (e) => {
  const key = e.key;
  switch (key) {
    case 37:
    case "ArrowLeft":
    case "a":
      moveLeft();
      break;
    case 38:
    case "ArrowUp":
    case "w":
      rotateClockwise();
      break;
    case 39:
    case "ArrowRight":
    case "d":
      moveRight();
      break;
    case 40:
    case "ArrowDown":
    case "s":
      moveDown();
      score += Math.trunc(currentLevel.scoreMultiplier);
      break;
    case "Shift":
      if (!hasSwapped && !isLocking) {
        saveOrSwapPiece();
      }
  }
};

const pauseGame = () => {
  if (!isPaused && !isGameOver) {
    isPaused = true;
    hideElement($gameFooter);
    hideElement($gameHeader);
    hideElement($gameContainer);
    showElement($infoModal);
  }
};

const hideElement = ($el) => {
  $el.toggleClass("visually-hidden");
  $el.removeClass("fade-in");
  $el.removeClass("slide-in");
  $el.addClass("fade-out");
  $el.addClass("slide-out");
};

const showElement = ($el) => {
  $el.toggleClass("visually-hidden");
  $el.removeClass("fade-out");
  $el.removeClass("slide-out");
  $el.show();
  $el.addClass("fade-in");
  $el.addClass("slide-in");
};

const resumeGame = () => {
  if (!isGameOver) {
    isPaused = false;
    if (loopID) {
      cancelAnimationFrame(loopID);
    }
    gameLoop();
  }
};

const showGame = () => {
  if (!isGameOver) {
    showElement($gameContainer);
    showElement($gameHeader);
    showElement($gameFooter);
    setTimeout(resumeGame, FADE_SPEED);
  }
};

const closeModal = () => {
  if (!isGameOver) {
    hideElement($infoModal);
    setTimeout(showGame, FADE_SPEED);
  }
};

const openModal = () => {
  if (!isGameOver) {
    $infoModal.toggleClass("visually-hidden");
    $infoModal.show();
    $infoModal.addClass("fade-in");
    $infoModal.addClass("slide-in");
  }
};

const resetGame = () => {
  if (loopID) {
    cancelAnimationFrame(loopID);
  }
  resetVars();
  gameLoop();
};

const bindEvents = () => {
  $doc.on("keydown", processKeyControls);
  $infoBtn.on("click", pauseGame);
  $infoModalCloseBtn.on("click", closeModal);
  $restartBtn.on("click", resetGame);
};

const resetVars = () => {
  loopID = null;
  gameBoard = new Board($gameBoard);
  nextPieceBoard = new Board($nextPieceBoard, 4, 4);
  savedPieceBoard = new Board($savedPieceBoard, 4, 4);

  isGameOver = false;
  hadCollision = false;
  hasSwapped = false;
  isLocking = false;

  $gameOverHeader.addClass("visually-hidden");

  score = 0;
  linesCleared = 0;
  setLevel(linesCleared);
  updateGameInfo();

  nextPiece = getRandomPiece();
  getNewCurrentPiece();
  savedPiece = null;

  prevTime = new Date();
  elapsedTime = 0;
};

const init = () => {
  resetVars();
  bindEvents();
};

init();
openModal();
