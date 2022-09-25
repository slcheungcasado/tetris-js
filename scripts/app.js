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

///////////////////////////////////////////////////////////////////////
// Constants
const GAME_SPEED = 1;
const CLOCK_INTERVAL = 200;
// const SHAPES = [
//   new Shapes.PieceI(),
//   new Shapes.PieceO(),
//   new Shapes.PieceT(),
//   new Shapes.PieceS(),
//   new Shapes.PieceZ(),
//   new Shapes.PieceJ(),
//   new Shapes.PieceL(),
// ];

const SHAPES = [
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 0, 0],
    [3, 3, 3],
    [0, 3, 0],
  ],
  [
    [0, 0, 0],
    [0, 4, 4],
    [4, 4, 0],
  ],
  [
    [0, 0, 0],
    [5, 5, 0],
    [0, 5, 5],
  ],
  [
    [0, 6, 0],
    [0, 6, 0],
    [6, 6, 0],
  ],
  [
    [0, 7, 0],
    [0, 7, 0],
    [0, 7, 7],
  ],
];

const colors = [
  "#9370d8",
  "#67b9cc",
  "#fdd834",
  "#9534fd",
  "#4caf50",
  "#ff1100",
  "#3030fa",
  "#fb7b31",
];

const player = {
  piece: null,
  offset: { x: 0, y: 0 },
};

let loopID;
let prevTime, elapsedTime;
let isGameOver, isPaused, score, linesCleared;
let gameBoard, nextPieceBoard, savedPieceBoard;
let currPiece, nextShape, savedShape;

///////////////////////////////////////////////////////////////////////
// Game State

// const checkLeft = () => {
//   for (let y = 0; y < currPiece.shape.length; y++) {
//     for (let x = 0; x < currPiece.shape.length; x++) {
//       if (currPiece.shape[y][x] == 0) continue;
//       if (x + currPiece.x <= 0) return false;
//     }
//   }
//   return true;
// };

// const checkRight = () => {
//   for (let y = 0; y < currPiece.shape.length; y++) {
//     for (let x = 0; x < currPiece.shape.length; x++) {
//       if (currPiece.shape[y][x] == 0) continue;
//       if (x + currPiece.x >= Board.BOARD_WIDTH - 1) return false;
//     }
//   }
//   return true;
// };

// const deepCopy = (arr) => {
//   let copy = [];
//   arr.forEach((elem) => {
//     if (Array.isArray(elem)) {
//       copy.push(deepCopy(elem));
//     } else {
//       if (typeof elem === "object") {
//         copy.push(deepCopyObject(elem));
//       } else {
//         copy.push(elem);
//       }
//     }
//   });
//   return copy;
// };

// const checkBottom = () => {
//   const boardClone = deepCopy(gameBoard.board);
//   for (let y = currPiece.shape.length - 1; y > 0; y--) {
//     for (let x = 0; x < currPiece.shape.length; x++) {
//       if (currPiece.shape[y][x] == 0) continue;
//       const currY = y + currPiece.y;
//       const currX = x + currPiece.x;
//       if (currY >= Board.BOARD_HEIGHT - 1) return false;
//       if (boardClone[currY + 1][currX] == 0) {
//         boardClone[currY + 1][currX] = boardClone[currY][currX];
//         boardClone[currY][currX] = 0;
//       } else {
//         return false;
//       }
//     }
//   }
//   gameBoard.board = deepCopy(boardClone);
//   gameBoard.update();
//   return true;
// };

const processKeyControls = (e) => {
  const key = e.key;
  switch (key) {
    case 37:
    case "ArrowLeft":
      // if (checkLeft()) {
      //   gameBoard.clearPiece(currPiece);
      //   moveHorizontally(-1);
      //   // gameBoard.drawPiece(currPiece);
      // } else {
      // }
      break;
    case 38:
    case "ArrowUp":
      console.log("Do rotation");
      break;
    case 39:
    case "ArrowRight":
      // if (checkRight()) {
      //   gameBoard.clearPiece(currPiece);
      //   moveHorizontally(1);
      //   // gameBoard.drawPiece(currPiece);
      // } else {
      // }
      break;
    case 40:
    case "ArrowDown":
      // console.log("moveVertically() called by event");
      // if (checkBottom()) {
      //   gameBoard.clearPiece(currPiece);
      //   moveVertically(1);
      //   gameBoard.drawPiece(currPiece);
      //   gameBoard.update();
      //   console.log(gameBoard.board);
      // } else {
      //   currPiece = getRandomPiece();
      //   // gameBoard.update();
      //   console.log("next piece:", currPiece);
      // }
      break;
  }
};

const moveDown = () => {
  player.offset.y = player.offset.y + 1;
  if (hasCollision()) {
    console.log("Does this ever happen?");
    // currPiece.y -= 1;
    player.offset.y = player.offset.y - 1;
    gameBoard.addPiece(player.piece);
    getNewPiece();
    // numCleared = gameBoard.clearLines();
    // console.log(numCleared);
  }
};

const draw = () => {
  if (!isPaused) {
    // gameBoard.updateStyles();
    gameBoard.board.forEach((row, y) => {
      row.forEach((val, x) => {
        gameBoard.boardElements[y][x].css("background-color", colors[val]);
      });
    });

    player.piece.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          gameBoard.boardElements[y + player.offset.y][x + player.offset.x].css(
            "background-color",
            colors[val]
          );
        }
      });
    });
    // gameBoard.drawPiece(currPiece);
  }
};

const gameLoop = () => {
  if (!isPaused) {
    const currTime = new Date();
    const diff = currTime.getTime() - prevTime.getTime();
    elapsedTime += diff;

    if (elapsedTime > CLOCK_INTERVAL) {
      moveDown();
      // console.log("tick move down");
      // console.log(gameBoard.board);
      // console.log(gameBoard.boardElements);
      elapsedTime = 0;
    }
    prevTime = currTime;
  }
  draw();
  loopID = requestAnimationFrame(gameLoop);
};

const gameOver = () => {
  console.log("Game Over");
  cancelAnimationFrame(loopID);
};

const hasCollision = () => {
  // console.log(`(${player.offset.x}, ${player.offset.y})`, currPiece.shape);
  console.log(`(${player.offset.x}, ${player.offset.y})`, player.piece);
  // const didCollide = currPiece.shape.some((row, y) => {
  //   return row.some((val, x) => {
  //     //prettier-ignore
  //     return (
  //       val !== 0 &&
  //       (gameBoard.board[y + currPiece.y] &&
  //       gameBoard.board[y + currPiece.y][x + currPiece.x] !== 0)
  //     );
  //   });
  // });
  const didCollide = player.piece.some((row, y) => {
    return row.some((val, x) => {
      //prettier-ignore
      if (val === 0) return false;
      const realY = y + player.offset.y;
      const realX = x + player.offset.x;
      if (realY >= Board.BOARD_HEIGHT - 1) return true;
      if (realX < 0 || realX >= Board.BOARD_WIDTH - 1) return true;
      return gameBoard.board[realY][realX] !== 0;
      // return (
      //   val !== 0 &&
      //   gameBoard.board[y + currPiece.y] &&
      //   gameBoard.board[y + currPiece.y][x + currPiece.x] !== 0
      // );
    });
  });
  console.log("hasCollision() called and returning: ", didCollide);
};

const getRandomPiece = () => {
  return Object.create(SHAPES[Math.trunc(Math.random() * SHAPES.length)]);
};

const getNewPiece = () => {
  player.piece = SHAPES[Math.floor(Math.random() * SHAPES.length)].map((row) =>
    row.slice()
  );
  // currPiece = getRandomPiece();
  player.offset.x = player.piece.length === 2 ? 4 : 3;
  player.offset.y = 0;
  if (hasCollision()) {
    gameOver();
  } else {
    console.log("No collision initially");
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
getNewPiece();
gameLoop();
// gameBoard.drawPiece(currPiece);
// console.log(currPiece);

console.log(currPiece, "start", player.offset.x, player.offset.y);
console.log(gameBoard);
window.isPaused = isPaused;
window.currPiece = currPiece;
window.$gameBoard = $gameBoard;
window.gameBoard = gameBoard;
