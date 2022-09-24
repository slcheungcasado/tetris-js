// import { Block } from "./Block.js";

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
        // if (x == 0) $block.addClass("left");
        // if (y == 0) $block.addClass("top");
        this.boardElements[y][x] = $block;
        $row.append($block);
        this.board[y][x] = 0;
      }
      this.$parentContainer.append($row);
    }
  }
}
