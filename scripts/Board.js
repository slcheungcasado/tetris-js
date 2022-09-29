import { Block } from "./Block.js";

export class Board {
  static BOARD_HEIGHT = 20;
  static BOARD_WIDTH = 10;
  constructor(
    $parentContainer,
    numRows = Board.BOARD_HEIGHT,
    numCols = Board.BOARD_WIDTH
  ) {
    this.$parentContainer = $parentContainer;
    this.height = $parentContainer.height();
    this.width = $parentContainer.width();
    this.numRows = numRows;
    this.numCols = numCols;
    this.board = new Array(numCols); // stores numbers
    this.boardElements = new Array(numCols); // stores HTML div element
    this.init();
  }

  init() {
    this.$parentContainer.find("> div").remove();
    for (let y = 0; y < this.numRows; y++) {
      this.board[y] = new Array(this.numCols);
      this.boardElements[y] = new Array(this.numCols);
      const $row = $("<div class='row'></div>");
      for (let x = 0; x < this.numCols; x++) {
        this.board[y][x] = 0;
        const block = new Block(this.board[y][x]);
        this.boardElements[y][x] = block;
        $row.append(block.$block);
      }
      this.$parentContainer.append($row);
    }
  }

  refresh() {
    this.board.forEach((row, y) => {
      row.forEach((val, x) => {
        this.boardElements[y][x].setBlock(val);
      });
    });
  }

  drawPiece(piece) {
    if (!piece) return;

    piece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          this.boardElements[y + piece.y][x + piece.x].setBlock(val);
        }
      });
    });
  }

  lockPiece(piece) {
    if (!piece) return;

    piece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          this.board[y + piece.y][x + piece.x] = val;
        }
      });
    });
  }

  clearLines() {
    let linesCleared = 0;
    this.board.forEach((row, y) => {
      let isFull = true;
      isFull = row.every((val) => val !== 0);
      if (isFull) {
        for (let i = y - 1; i >= 0; i--) {
          this.board[i + 1] = [...this.board[i]];
        }
        this.board[0].fill(0);
        linesCleared += 1;
      }
    });
    return linesCleared;
  }
}
