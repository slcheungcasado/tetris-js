import { Board } from "./Board.js";
import * as Shapes from "./Piece.js";
import { Audio } from "./Audio.js";

///////////////////////////////////////////////////////////////////////
// Visual Elements
const $doc = $(document);

const $gameHeader = $("#heading-wrapper");

const $gameContainer = $("#game-container");
const $gameOverHeader = $("#game-over-header");
const $gameBoard = $("#game-board");

const $gameLevelSpan = $("#game-level");
const $linesClearedSpan = $("#lines-cleared");
const $playedScoreSpan = $("#player-score");

const $nextPieceBoard = $("#next-piece-board");
const $savedPieceBoard = $("#saved-piece-board");

const $infoBtn = $("#info-btn");
const $infoModal = $("#info-modal-div");
const $infoModalCloseBtn = $("#info-modal-close-button");

const $restartBtn = $("#restart-btn");

const $gameFooter = $("#game-footer");

// Audio
const bgmAudio = new Audio("#tetris-bgm", { volume: 0.3 });
const pieceRotateSfx = new Audio("#piece-rotate-sfx", { volume: 0.3 });
const pieceSwapSfx = new Audio("#piece-swap-sfx", { volume: 0.3 });
const failSfx = new Audio("#fail-sfx", { volume: 0.3 });
const pieceLockSfx = new Audio("#piece-lock-sfx", { volume: 1 });
const gameOverSfx = new Audio("#game-over-sfx", { volume: 0.3 });
const lineClearSfx = new Audio("#line-clear-sfx", { volume: 0.3 });
const levelUpSfx = new Audio("#level-up-sfx", { volume: 0.5 });

///////////////////////////////////////////////////////////////////////
// Constants

const FADE_SPEED = 650;
const SHAPES = ["i", "o", "t", "s", "z", "j", "l"];

const LEVEL_CONFIGS = {
  0: {
    val: 0,
    speed: 800,
    linesClearedThreshold: 0,
    scoreMultiplier: 1,
    bgmSpeed: 1,
  },
  1: {
    val: 1,
    speed: 700,
    linesClearedThreshold: 5,
    scoreMultiplier: 1.5,
    bgmSpeed: 1.2,
  },
  2: {
    val: 2,
    speed: 600,
    linesClearedThreshold: 10,
    scoreMultiplier: 2,
    bgmSpeed: 1.4,
  },
  3: {
    val: 3,
    speed: 500,
    linesClearedThreshold: 15,
    scoreMultiplier: 2.5,
    bgmSpeed: 1.6,
  },
  4: {
    val: 4,
    speed: 400,
    linesClearedThreshold: 20,
    scoreMultiplier: 3,
    bgmSpeed: 1.8,
  },
  5: {
    val: 5,
    speed: 300,
    linesClearedThreshold: 25,
    scoreMultiplier: 4,
    bgmSpeed: 2,
  },
  6: {
    val: 6,
    speed: 200,
    linesClearedThreshold: 30,
    scoreMultiplier: 5,
    bgmSpeed: 2.2,
  },
  7: {
    val: "MAX",
    speed: 100,
    linesClearedThreshold: 35,
    scoreMultiplier: 5,
    bgmSpeed: 2.5,
  },
};

const SIDE_BOARD_SIZE = 4;

const ALL_AUDIO = [
  bgmAudio,
  pieceRotateSfx,
  pieceSwapSfx,
  failSfx,
  pieceLockSfx,
  levelUpSfx,
  lineClearSfx,
  gameOverSfx,
];

let loopID;
let prevTime, elapsedTime;
let isGameOver;
let score, linesCleared, prevLevelVal, currentLevel;
let gameBoard, nextPieceBoard, savedPieceBoard;
let currPiece, nextPiece, savedPiece;
let hadCollision, hasSwapped, isLocking;
let isPaused = true;

///////////////////////////////////////////////////////////////////////
// Game State

const setLevel = (linesCleared) => {
  for (let level of Object.values(LEVEL_CONFIGS)) {
    if (linesCleared >= level.linesClearedThreshold) {
      currentLevel = level;
    }
  }

  bgmAudio.setPlaySpeed(currentLevel.bgmSpeed);
  if (
    toString.call(currentLevel.val) != "String" &&
    prevLevelVal < currentLevel.val &&
    currentLevel.val > 0
  ) {
    prevLevelVal = currentLevel.val;
    levelUpSfx.play();
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
    let start = layer;
    let end = n - start - 1;
    for (let i = start; i < end; i++) {
      let offset = i - start;

      let top = currPiece.shape[start][i];
      let right = currPiece.shape[i][end];
      let bottom = currPiece.shape[end][end - offset];
      let left = currPiece.shape[end - offset][start];

      currPiece.shape[start][i] = left;
      currPiece.shape[i][end] = top;
      currPiece.shape[end][end - offset] = right;
      currPiece.shape[end - offset][start] = bottom;
    }
  }
  if (hasCollision(currPiece)) {
    currPiece.shape = shapeCopy;
    failSfx.play();
  } else {
    pieceRotateSfx.playIfIntervalAtLeast(0.05);
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
    currPiece.y = currPiece.y - 1;

    isLocking = true;
    gameBoard.lockPiece(currPiece);

    getNewCurrentPiece();
    let prevLines = linesCleared;
    linesCleared += gameBoard.clearLines();
    if (linesCleared > prevLines) {
      lineClearSfx.play();
    }
    setLevel(linesCleared);
    score += Math.trunc(linesCleared * currentLevel.scoreMultiplier);
    hasSwapped = false;
    pieceLockSfx.play();
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
  }

  if (!isGameOver) {
    loopID = requestAnimationFrame(gameLoop);
  }
};

const stopAllAudio = () => {
  ALL_AUDIO.forEach((audio) => audio.pause());
};

const gameOver = () => {
  isGameOver = true;
  cancelAnimationFrame(loopID);
  stopAllAudio();
  gameOverSfx.play();
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
    pieceSwapSfx.play();
  } else {
    const currPieceCoords = structuredClone({ x: currPiece.x, y: currPiece.y });
    const currPieceClone = structuredClone(currPiece);
    const savedPieceClone = structuredClone(savedPiece);

    currPiece = savedPiece;
    currPiece.x = currPieceCoords.x;
    currPiece.y = currPieceCoords.y;

    if (hasCollision(currPiece)) {
      currPiece = currPieceClone;
      savedPiece = savedPieceClone;
      failSfx.play();
    } else {
      currPieceClone.x = 0;
      currPieceClone.y = 0;
      savedPiece = currPieceClone;
      hasSwapped = true;
      pieceSwapSfx.play();
    }
  }
};

const processKeyControls = (e) => {
  if (isGameOver || isPaused || isLocking) return;

  const key = e.key;
  switch (key) {
    case "ArrowLeft":
    case "a":
      moveLeft();
      break;
    case "ArrowUp":
    case "w":
      rotateClockwise();
      break;
    case "ArrowRight":
    case "d":
      moveRight();
      break;
    case "ArrowDown":
    case "s":
      moveDown();
      score += Math.trunc(currentLevel.scoreMultiplier);
      break;
    case "Shift":
      if (!hasSwapped) {
        saveOrSwapPiece();
      }
  }
};

const pauseGame = () => {
  if (!isPaused && !isGameOver) {
    bgmAudio.pause();
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
    bgmAudio.play(false);
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
  bgmAudio.restart();
  bgmAudio.play();
  gameLoop();
};

const loopBgm = () => {
  if (!isGameOver) {
    bgmAudio.setPlaySpeed(currentLevel.bgmSpeed);
    bgmAudio.play();
  }
};

const bindEvents = () => {
  $doc.on("keydown", processKeyControls);
  $infoBtn.on("click", pauseGame);
  $infoModalCloseBtn.on("click", closeModal);
  $restartBtn.on("click", resetGame);
  bgmAudio.$audioEl.on("ended", loopBgm);
};

const resetVars = () => {
  loopID = null;

  gameBoard = new Board($gameBoard);
  nextPieceBoard = new Board($nextPieceBoard, SIDE_BOARD_SIZE, SIDE_BOARD_SIZE);
  savedPieceBoard = new Board(
    $savedPieceBoard,
    SIDE_BOARD_SIZE,
    SIDE_BOARD_SIZE
  );

  isGameOver = false;
  hadCollision = false;
  hasSwapped = false;
  isLocking = false;

  $gameOverHeader.addClass("visually-hidden");

  score = 0;
  linesCleared = 0;
  prevLevelVal = -1;
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
