import { Board } from "./Board.js";

///////////////////////////////////////////////////////////////////////
// DOM Elements
const $gameContainer = $("#game-container");
const $gameBoard = $("#game-board");
const $sidePanel = $("#side-panel");
const $scorePanel = $("#score-panel");
const $savedPieceBoard = $("#saved-piece-board");
const $nextPieceBoard = $("#next-piece-board");

///////////////////////////////////////////////////////////////////////
// Constants
console.log($gameBoard);
const gameBoard = new Board($gameBoard);

const nextPieceBoard = new Board($nextPieceBoard, 4, 4);

const savedPieceBoard = new Board($savedPieceBoard, 4, 4);
