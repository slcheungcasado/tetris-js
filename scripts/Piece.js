// import { Board } from "./Board.js";
// import { Block } from "./Block.js";

export class Piece {
  constructor() {
    this.val = 0;
    this.name = "empty";
    this.color = "#9370d8";
    this.shape = [[0]];
    this.x = 0;
    this.y = 0;
  }
}

export class PieceI extends Piece {
  constructor() {
    super();
    this.val = 1;
    this.name = "i";
    this.color = "#67b9cc";
    this.shape = [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ];
    // this.shape = [
    //   [0, 0, this.val, 0],
    //   [0, 0, this.val, 0],
    //   [0, 0, this.val, 0],
    //   [0, 0, this.val, 0],
    // ];
  }
}

export class PieceO extends Piece {
  constructor() {
    super();
    this.val = 2;
    this.name = "o";
    this.color = "#fdd834";
    // this.shape = [
    //   [this.val, this.val],
    //   [this.val, this.val],
    // ];
    this.shape = [
      [2, 2],
      [2, 2],
    ];
  }
}

export class PieceT extends Piece {
  constructor() {
    super();
    this.val = 3;
    this.name = "t";
    this.color = "#9534fd";
    // this.shape = [
    //   [0, 0, 0],
    //   [this.val, this.val, this.val],
    //   [0, this.val, 0],
    // ];
    this.shape = [
      [0, 0, 0],
      [3, 3, 3],
      [0, 3, 0],
    ];
  }
}

export class PieceS extends Piece {
  constructor() {
    super();
    this.val = 4;
    this.name = "s";
    this.color = "#4caf50";
    // this.shape = [
    //   [0, 0, 0],
    //   [0, this.val, this.val],
    //   [this.val, this.val, 0],
    // ];
    this.shape = [
      [0, 0, 0],
      [0, 4, 4],
      [4, 4, 0],
    ];
  }
}

export class PieceZ extends Piece {
  constructor() {
    super();
    this.val = 5;
    this.name = "z";
    this.color = "#ff1100";
    // this.shape = [
    //   [0, 0, 0],
    //   [this.val, this.val, 0],
    //   [0, this.val, this.val],
    // ];
    this.shape = [
      [0, 0, 0],
      [5, 5, 0],
      [0, 5, 5],
    ];
  }
}

export class PieceJ extends Piece {
  constructor() {
    super();
    this.val = 6;
    this.name = "j";
    this.color = "#3030fa";
    // this.shape = [
    //   [0, this.val, 0],
    //   [0, this.val, 0],
    //   [this.val, this.val, 0],
    // ];
    this.shape = [
      [0, 6, 0],
      [0, 6, 0],
      [6, 6, 0],
    ];
  }
}

export class PieceL extends Piece {
  constructor() {
    super();
    this.val = 7;
    this.name = "l";
    this.color = "#fb7b31";
    // this.shape = [
    //   [0, this.val, 0],
    //   [0, this.val, 0],
    //   [0, this.val, this.val],
    // ];
    this.shape = [
      [0, 7, 0],
      [0, 7, 0],
      [0, 7, 7],
    ];
  }
}
