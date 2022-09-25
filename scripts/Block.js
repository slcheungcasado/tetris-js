export class Block {
  static BLOCK_STYLES = {
    // "-1": "square-transparent",
    0: "square-empty",
    1: "square-i",
    2: "square-o",
    3: "square-t",
    4: "square-s",
    5: "square-z",
    6: "square-j",
    7: "square-l",
  };
  constructor(blockValue = 0) {
    this.blockValue = blockValue;
    this.$block = $("<div class='square square-empty'></div>");
  }

  setBlock(val) {
    this.$block.removeClass(Block.BLOCK_STYLES[this.blockValue]);
    this.$block.addClass(Block.BLOCK_STYLES[val]);
    this.blockValue = val;
  }
}
