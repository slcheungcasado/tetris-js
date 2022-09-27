import { Board } from "./Board.js";
import * as Shapes from "./Piece.js";
// import * as lodash from "../js/lodash.min.js";
// import _ from "../js/lodash.min.js";
// const lodash = require("../lodash.min.js");

///////////////////////////////////////////////////////////////////////
// DOM Elements
const $doc = $(document);
const $gameContainer = $("#game-container");
const $gameBoard = $("#game-board");
const $gameHeader = $("#heading-wrapper");
const $gameFooter = $("#game-footer");
const $sidePanel = $("#side-panel");
const $scorePanel = $("#score-panel");
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

const GAME_SPEED = 1;
const FADE_SPEED = 650;
const CLOCK_INTERVAL = 800;
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
let isGameOver, isPaused, score, linesCleared, currentLevel;
let gameBoard, nextPieceBoard, savedPieceBoard;
let currPiece, nextPiece, savedPiece;
let hadCollision, hasSwapped;
let currPieceCoords, isLocking;
///////////////////////////////////////////////////////////////////////
// Game State

const deepCloneObj = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

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
  const res = piece.shape.some((row, y) => {
    return row.some((val, x) => {
      if (val === 0) return false;
      let realY = y + piece.y;
      let realX = x + piece.x;
      if (realY >= Board.BOARD_HEIGHT) return true;
      if (realX < 0 || realX >= Board.BOARD_WIDTH) return true;

      return gameBoard.board[realY][realX] !== 0;
    });
  });

  hadCollision = res;
  return res;
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
  console.log(`(${currPiece.x},${currPiece.y})`);
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
    console.log("This happens");
  }
  if (!isGameOver) {
    loopID = requestAnimationFrame(gameLoop);
  }
};

const gameOver = () => {
  console.log("Game Over");
  isGameOver = true;
  cancelAnimationFrame(loopID);
  // $gameOverHeader.toggleClass("visually-hidden");
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
    console.log("No collision on getNewPiece()");
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
    currPieceCoords = structuredClone({ x: currPiece.x, y: currPiece.y });
    const currPieceClone = structuredClone(currPiece);

    currPiece = savedPiece;
    currPiece.x = currPieceCoords.x + currPiece.shape.length === 2 ? 4 : 3;
    currPiece.y = currPieceCoords.y;

    if (hasCollision(currPiece)) {
      console.log("Can't swap due to collision");
      currPiece = currPieceClone;
      // currPiece.x = currPieceCoords.x;
      currPiece.x = currPieceCoords.x;
      currPiece.y = currPieceCoords.y;
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
      score += Math.trunc(currentLevel.scoreMultiplier);
      break;
    // FIXME: using p and r is weird if it's available while playing
    // case "p":
    //   // isPaused = true; //pause game
    //   pauseGame();
    //   break;
    // case "r":
    //   // isPaused = false; //resume game
    //   closeModal();
    //   break;
    case "Shift":
      console.log("Saving Current Piece");
      if (!hasSwapped && !isLocking) {
        saveOrSwapPiece();
      }
  }
};

const pauseGame = () => {
  if (!isPaused && !isGameOver) {
    isPaused = true;
    console.log("Game is paused");
    console.log("Displaying Modal");
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
    console.log("Game resumes");
    if (loopID) {
      cancelAnimationFrame(loopID);
    }
    gameLoop();
  }
};

const showGame = () => {
  if (!isGameOver) {
    console.log("Showing Game Board...");
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

  // $gameOverHeader = $("<header id='game-over-header'>Game Over!</header>");
  // $gameBoard.prepend($gameOverHeader);
  // $gameOverHeader.hide();
  $gameOverHeader.addClass("visually-hidden");

  score = 0;
  linesCleared = 0;
  setLevel(linesCleared);
  updateGameInfo();

  nextPiece = getRandomPiece();
  getNewCurrentPiece();
  currPieceCoords = structuredClone({ x: currPiece.x, y: currPiece.y });
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
// gameLoop();

// console.log(currPiece, "start", currPiece.x, currPiece.y, currPiece.name);
// console.log(gameBoard);
window.gameBoard = gameBoard;
window.$gameBoard = $gameBoard;
window.currPiece = currPiece;
