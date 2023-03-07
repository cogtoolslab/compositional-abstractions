var config = {
  // dimensions
  canvasHeight: 450,
  canvasWidth: 450,
  worldHeight: 10,
  worldWidth: 12,
  discreteEnvHeight: 10,   // discrete world representation for y-snapping
  discreteEnvWidth: 12,
  worldScale: 2.2, //scaling factor within matterjs
  menuOffset: 70,
  xSquareOffset: 0,
  ySquareOffset: 0,

  // block details
  blockDims: [[1, 2],[2, 1]],
  blockNames: ['v','h'],

  //colors
  buildColor: [30, 30, 200],
  buildColors: [[179, 47, 10, 255], 
                [10, 47, 179, 255]],
  internalStrokeColors: [[190, 190, 255],
                         [190, 190, 255]],
  strokeColor: [190, 190, 255],
  structureGhostColor: [30, 30, 200, 100],
  // ghostStroke: [100,100,200,90],
  ghostStroke: [100,100,200,90],
  disabledColor: [100, 100, 100],
  mistakeColor: [215, 30, 30, 200],
  stimColor: [0, 0, 0],
  revealedTargetColor: [28, 54, 62, 200],
  menuColor: [236, 232, 226],
  floorColor: [236, 232, 226]
};

config.sF = config.canvasWidth / config.discreteEnvWidth; //scaling factor to change appearance of blocks
config.stim_scale = config.sF; //scale of stimulus silhouette (same as sF here)

// Building Environment parameters
config.chocolateBlocks = true;
config.menuHeight = config.canvasHeight / 4.2;
config.menuWidth = config.canvasWidth;
config.floorHeight = config.canvasHeight / 3.5;
config.floorY = config.canvasHeight - (config.floorHeight / 2);
config.top = Math.round((config.canvasHeight - config.floorHeight) / config.stim_scale);
//config.aboveGroundProp = config.floorY / config.canvasHeight;

// Stimulus parameters
config.stimIndividualBlocks = true;
config.stimSilhouette = true;
config.silhouetteColor = [28, 54, 62];
config.internalStrokeColor = [190, 190, 255];
config.showStimFloor = true;
// config.stimFloorType = 'line';
config.stimTickMark = false;
config.stimFloorColor = [28, 54, 62];
config.floorWidth = config.canvasWidth*0.8;
config.showStimGrid = true;
config.showStimMenu = true;
config.displayBuiltInStim = false;
config.stimCanvasWidth = config.canvasWidth; // in case we want canvases to be different sizes
config.stimCanvasHeight = config.canvasHeight;
config.envCanvasWidth = config.canvasWidth;
config.envCanvasHeight = config.canvasHeight;
config.stimX = config.stimCanvasWidth / 2;
config.stimY = config.stimCanvasHeight / 2;