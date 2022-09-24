// export class Block {
//   static DEFAULT_HEIGHT = 24;
//   static DEFAULT_WIDTH = 24;
//   static BLOCK_VAL = {
//     empty: 0,
//     "square-i": 1,
//     "square-o": 2,
//     "square-t": 3,
//     "square-s": 4,
//     "square-z": 5,
//     "square-j": 6,
//     "square-l": 7,
//   };
//   static BLOCK_STYLES = [
//     "empty",
//     "square-i",
//     "square-o",
//     "square-t",
//     "square-s",
//     "square-z",
//     "square-j",
//     "square-l",
//   ];
//   constructor(
//     $parentBoard,
//     $selfDOMElem,
//     y = 0,
//     x = 0,
//     height = Math.trunc($parentBoard.height / $parentBoard.numCols) ||
//       Block.DEFAULT_HEIGHT,
//     width = Math.trunc($parentBoard.width / $parentBoard.numRows) ||
//       Block.DEFAULT_WIDTH
//   ) {
//     this.$parentContainer = $parentBoard;
//     this.$selfDOMElem = $selfDOMElem;
//     this.height = height;
//     this.width = width;
//     this.coords = { y: y, x: x };
//   }

//   applyClasses(...classes) {
//     this.$selfDOMElem.addClass(classes.join(" "));
//   }

//   removeClasses(...classes) {
//     classes.forEach((c) => this.$selfDOMElem.removeClass(c));
//   }
// }
