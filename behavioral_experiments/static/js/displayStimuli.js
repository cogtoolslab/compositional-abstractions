var config = require('./display_config.js');

function showStimulus(env, stimulus, individual_blocks = false, blockColor = [28,54,220,50]){
  Array.prototype.forEach.call(stimulus, block => {
    showBlock(env, block, individual_blocks, blockColor);
  });
}

function showBlock(env, block, individual_blocks = false, blockColor = [28,54,62]){
  const width = block.width;
  const height = block.height;
  const x_left = block.x - config.worldWidth/2;
  const x_center = x_left + block.width/2;
  const y_bottom = config.worldHeight - block.y - config.worldHeight/2;
  const y_center =  y_bottom - block.height/2;
  const y_top = y_bottom - height;
  const canvasHeight = config.canvasHeight;
  const canvasWidth = config.canvasWidth;
        
  env.push(); //saves the current drawing style settings and transformations
  env.translate(config.stimX + config.stim_scale*x_center,
                ((canvasHeight - config.floorHeight) -
                 (canvasHeight - config.floorY) +
                 (config.stim_scale * y_center - 26)));
  env.rectMode(env.CENTER);
  //env.noStroke();
  env.stroke(blockColor);
  env.fill(blockColor);
  if (individual_blocks) {
    env.strokeWeight(2);
    env.stroke([201,201,201]);
    env.fill(blockColor);
  }
  env.rect(0,0,config.stim_scale*width,config.stim_scale*height);
  env.pop();
  
}

class Grid {
  constructor() {
    this.grid_left = -9;
    this.grid_right = 11;
    this.grid_bottom = 0;
    this.grid_top = 20;
  }
  
  setup(){
    this.grid_x = new Array(this.grid_right - this.grid_left);
    this.grid_y = new Array(this.grid_top - this.grid_bottom);

    let i = this.grid_left;
    
    while(i < this.grid_right) {
      this.grid_x[i] = config.stim_scale*i + config.canvasWidth/2 - config.stim_scale/2;
      i = i+1;
    }  

    let j = this.grid_bottom;
    while(j < this.grid_top) {
      this.grid_y[j] =  (config.canvasHeight - config.floorHeight) - (config.stim_scale*j) + config.stim_scale/2 - 6;
      j = j+1;
    } 
  }

  show(env){
    var squareWidth = config.stim_scale;
    var squareHeight = config.stim_scale;

    const grid_left = -9;
    const grid_right = 11;
    const grid_bottom = 0;
    const grid_top = 20;

    let i = grid_left;
    while(i < grid_right) {
      let j = grid_bottom;
      while(j < grid_top) {
        env.push();
        env.rectMode(env.CENTER);
        env.stroke([190,190,255]);
        env.noFill();
        env.translate(this.grid_x[i], this.grid_y[j]);
        env.rect(0,0,squareWidth,squareHeight);
        env.pop();
        j = j+1;
      }
      i = i+1;
    }
  }
}

//still to do!
function showStimFloor(p5stim){
  const floorX = config.stimCanvasWidth/2, 
        floorY = (config.stimCanvasWidth - config.menuHeight)*1.15, 
        floorWidth = config.stimCanvasWidth*1.5,
        floorHeight = config.stimCanvasHeight/3;
  p5stim.push();
  p5stim.translate(floorX, floorY);
  p5stim.rectMode(p5stim.CENTER);
  p5stim.stroke(220);
  p5stim.strokeWeight(2);
  p5stim.fill([28,54,62]);
  p5stim.rect(0,0,floorWidth,floorHeight);
  p5stim.pop();
  showMarker(p5stim);
}

function showMarker(p5stim){
  p5stim.push();
  p5stim.stroke([255,0,0]);
  p5stim.strokeWeight(1);
  p5stim.line(
    config.canvasWidth / 2,
    config.canvasHeight - config.floorHeight + 10,
    config.canvasWidth / 2,
    config.canvasHeight - config.floorHeight + 35
  );
  p5stim.pop();
}

module.exports = {
  showStimulus,
  showMarker,
  showStimFloor,
  grid: new Grid()
};
