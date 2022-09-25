// import { Block } from "./Block.js";
// const BLOCK_STYLES = {
//   // "-1": "square-transparent",
//   0: "square-empty",
//   1: "square-i",
//   2: "square-o",
//   3: "square-t",
//   4: "square-s",
//   5: "square-z",
//   6: "square-j",
//   7: "square-l",
// };

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

export class Board {
  // static BOARD_HEIGHT = 22; make first two rows invisible
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
    this.board = new Array(numCols);
    this.boardElements = new Array(numCols);
    this.init();
  }

  init() {
    for (let y = 0; y < this.numRows; y++) {
      this.board[y] = new Array(this.numCols);
      this.boardElements[y] = new Array(this.numCols);
      const $row = $("<div class='row'></div>");
      for (let x = 0; x < this.numCols; x++) {
        const $block = $("<div></div>");
        $block.addClass("square square-empty");
        this.boardElements[y][x] = $block;
        this.board[y][x] = 0;
        $row.append($block);
      }
      this.$parentContainer.append($row);
    }
  }

  updateStyles() {
    this.board.forEach((row, y) => {
      row.forEach((val, x) => {
        // console.log(BLOCK_STYLES[this.board[y][x]], BLOCK_STYLES[val]);
        this.boardElements[y][x].css("background-color", colors[val]);
        // if (val !== 0) {
        //   this.boardElements[y][x].css("border", "2px solid #101010");
        // }
      });
    });
  }

  update() {
    this.board.forEach((row, y) => {
      row.forEach((val, x) => {
        this.boardElements[y][x].populateWith(val);
        // this.board[y][x] = val;
      });
    });
  }

  drawPiece(piece) {
    if (!piece) return;
    piece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          const realY = y + piece.y;
          const realX = x + piece.x;
          //prettier-ignore
          if (
            realY < Board.BOARD_HEIGHT &&
            (realX >= 0 &&
            realX < Board.BOARD_WIDTH)
          ) {
            console.log("This happens", realY, realX);
          } else {
            console.log("This doesn't happen", realY, realX);
          }

          // this.boardElements[y + piece.y][x + piece.x].styleBlock(val);
          // this.boardElements[realY][realX]
          //   .removeClass(BLOCK_STYLES[0])
          //   .addClass(BLOCK_STYLES[val]);
          this.boardElements[realY][realX].css("background-color", colors[val]);
          // this.boardElements[realY][realX].css("border", "2px solid #101010");

          // // this.boardElements[y + piece.y][x + piece.x].populateWith(val);
          // // this.board[y + piece.y][x + piece.x] = val;
        }
      });
    });
  }

  addPiece(piece) {
    if (!piece) return;
    piece.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          this.board[y + piece.y][x + piece.x] = val;
          // this.boardElements[y + piece.y][x + piece.x].populateWith(val);
        }
      });
    });
  }

  clearPiece(piece) {
    piece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          // console.log(`Printing Piece`, piece.name, piece);
          // console.table(piece);
          this.boardElements[y + piece.y][x + piece.x].makeEmpty();
          // this.board[y + piece.y][x + piece.x] = 0;
        }
      });
    });
  }

  clearLines() {
    linesCleared = 0;
    this.board.forEach((row, y) => {
      let isFull = row.every((val) => val !== 0);
      if (isFull) {
        for (let idx = y - 1; idx >= 0; idx -= 1) {
          this.board[idx + 1] = board[idx];
        }
        this.board[0].fill(0); //empty row
        linesCleared += 1;
      }
    });
    return linesCleared;
  }

  clear() {
    this.board.forEach((row, y) => {
      row.forEach((val, x) => {
        this.boardElements[y][x].populateWith(0);
        this.board[y][x] = 0;
      });
    });
  }
}
