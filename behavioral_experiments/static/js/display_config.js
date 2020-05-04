var config = {
  canvasHeight: 450,
  canvasWidth: 450,
  worldHeight: 10,
  worldWidth: 12,
  buildColor: [30, 30, 200],
  buildColors: [[179, 47, 10, 255],
                [10, 47, 179, 255]],
  menuColor: [236, 232, 226],
  disabledColor: [100, 100, 100],
  mistakeColor: [215, 30, 30, 200],
  structureGhostColor: [30, 30, 200, 100],
  floorColor: [28, 54, 62],
  stimColor: [28, 54, 62],
  revealedTargetColor: [28, 54, 62, 200],
  discreteEnvHeight: 10,   // discrete world representation for y-snapping
  discreteEnvWidth: 12,
  worldScale: 2.2, //scaling factor within matterjs
  menuOffset: 70
};

config.sF = config.canvasWidth / config.discreteEnvWidth; //scaling factor to change appearance of blocks
config.stim_scale = config.sF; //scale of stimulus silhouette (same as sF here)

// Environment parameters
config.menuHeight = config.canvasHeight / 4.2;
config.menuWidth = config.canvasWidth;
config.floorHeight = config.canvasHeight / 3.5;
config.floorY = config.canvasHeight - (config.floorHeight / 2);
config.top = Math.round((config.canvasHeight - config.floorHeight) / config.stim_scale);
//config.aboveGroundProp = config.floorY / config.canvasHeight;

// Stimulus parameters
config.stimCanvasWidth = config.canvasWidth;
config.stimCanvasHeight = config.canvasHeight;
config.envCanvasWidth = config.canvasWidth;
config.envCanvasHeight = config.canvasHeight;
config.stimX = config.stimCanvasWidth / 2;
config.stimY = config.stimCanvasHeight / 2;
config.chocolateBlocks = true;

module.exports = config;
