var config = {
  canvasHeight : 450,
  canvasWidth : 450,
  worldHeight : 8,
  worldWidth : 8,
  sF : 25, //scaling factor to change appearance of blocks
  worldScale : 2.2, //scaling factor within matterjs
  stim_scale : 25, //scale of stimulus silhouette (same as sF here)
  buildColor : [179, 47, 10, 255],
  disabledColor : [100, 100, 100, 30],
  mistakeColor : [215, 30, 30, 200],
  discreteEnvHeight : 13,   // discrete world representation for y-snapping
  discreteEnvWidth : 18
};

// Environment parameters
config.menuHeight = config.canvasHeight / 4.2;
config.menuWidth = config.canvasWidth;
config.floorY = (config.canvasHeight - config.menuHeight);
config.floorHeight = config.canvasHeight / 3;
config.aboveGroundProp = config.floorY / config.canvasHeight;

// Stimulus parameters
config.stimCanvasWidth = config.canvasWidth;
config.stimCanvasHeight = config.canvasHeight;
config.envCanvasWidth = config.canvasWidth;
config.envCanvasHeight = config.canvasHeight;
config.stimX = config.stimCanvasWidth / 2;
config.stimY = config.stimCanvasHeight / 2;
config.chocolateBlocks = true;

module.exports = config;
