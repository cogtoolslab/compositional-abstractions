var config = require('./display_config.js');

class BlockMenu {

  constructor(h, blockKinds){
    this.h = h;
    this.blockKinds = blockKinds;
  }

  // Adds a type of block to the menu
  addBlockKinds(newBlockKinds) {
    newBlockKinds.forEach(bK => {
      this.blockKinds.push(bK);    
    });
    
  }
  
  hasClickedButton(mouseX, mouseY, selectedBlockKind){
    for (let i = 0; i < this.blockKinds.length; i++) {
      // has click hit the block item?
      const blockX = this.blockKinds[i].x;
      const blockY = this.blockKinds[i].y;
      if (mouseX >= blockX - this.blockKinds[i].w * config.sF / 2 &&
          mouseX <= blockX + this.blockKinds[i].w * config.sF / 2 &&
          mouseY >= blockY - this.blockKinds[i].h * config.sF / 2 &&
          mouseY <= blockY + this.blockKinds[i].h * config.sF / 2){
        return this.blockKinds[i];
      }
      
    }
    return selectedBlockKind;

  }

  // Display menu
  show(env, disabled) {
    env.push();
    // Menu background
    env.fill(config.menuColor);
    env.rectMode(env.CORNER);
    env.stroke([28,54,62,100]);
    env.rect(
      0,
      config.canvasHeight - this.h,
      config.canvasWidth,
      this.h
    );
    // Blocks in menu
    var i;
    for (i = 0; i < this.blockKinds.length; i++) {
      this.blockKinds[i].showMenuItem(
        env,
        ((i+1)*(config.menuWidth/(this.blockKinds.length+1))) +
          this.blockKinds[i].w * config.sF / 2.2 -
          config.worldWidth * config.sF / 5
          + config.menuOffset,
        config.canvasHeight - config.menuHeight / 2,
        disabled
      );
    } 
    env.pop();

  }
}

module.exports = BlockMenu;
