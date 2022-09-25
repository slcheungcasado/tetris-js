// export class Block {
// static BLOCK_STYLES = {
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
//   constructor(blockValue) {
//     this.blockValue = blockValue;
//     this.$block = $("<div class='square'></div>");
//     console.log(this.blockValue);
//     this.populateWith(this.blockValue);
//   }

//   isFree() {
//     return this.blockValue === 0;
//   }

//   styleBlock(val) {
//     this.$block.removeClass(Block.BLOCK_STYLES[this.blockValue]);
//     this.$block.addClass(Block.BLOCK_STYLES[val]);
//     this.blockValue = val;
//     // console.log(this.$block);
//   }

//   populateWith(val) {
//     // if (val === this.blockValue && val !== 0) return;
//     // this.$block.removeClass(Block.BLOCK_STYLES[this.blockValue]);
//     // this.$block.addClass(Block.BLOCK_STYLES[val]);
//     console.log("updating ", this, `with ${val}`);
//     this.blockValue = val;
//   }

//   makeEmpty() {
//     this.populateWith(0);
//   }
// }

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
