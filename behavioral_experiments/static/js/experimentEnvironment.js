// Experiment frame, with Matter canvas and surrounding buttons
var config = require('./display_config.js');
var Matter = require('./matter.js');
var p5 = require('./p5.js');
var Boundary = require('./boundary.js');
var BlockMenu = require('./blockMenu.js');
var BlockKind = require('./blockKind.js');
var Block = require('./block.js');
var imagePath = '../img/';


// TEMPORARY VARIABLES TO BE READ IN

// Aliases for Matter functions
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Sleeping = Matter.Sleeping,
    Runner = Matter.Runner;

// p5 instances
var p5stim;
var p5env;

var scoring = false;

// Global Variables for Matter js and custom Matter js wrappers
var engine;
var ground;
var blockMenu;
var blocks = [];
var blockKinds = [];
var propertyList = [];
var blockProperties = [];

// Block placement variables
var isPlacingObject = false;
var rotated = false;
var selectedBlockKind = null;
var disabledBlockPlacement = false;

var snapBodiesPostPlacement = false;
var postSnap = false;

var discreteWorld = new Array(config.discreteEnvWidth);
var discreteWorldPrevious = new Array();

// Task variables
var block_data; // data to send to mongodb about every block placement
var trial_data; // data to send to mongodb about every finished block structure
var newSelectedBlockKind; // init this variable so we can inspect it in the console
var newBlock; // init this variable so we can inspect it in the console
var timeLastPlaced = Date.now();
var timeBlockSelected = Date.now();

var blockDims = [
  [1, 2],
  [2, 1],
  [2, 2],
  [2, 4],
  [4, 2]
];

var blockNames = ['A', 'B', 'C', 'D', 'E'];

// Metavariables
const dbname = 'block_construction';
const colname = 'silhouette';

// Scaling values
var grid = setupGrid(); // initialize grid

var setupEnvs = function (trialObj) {
  this.p5stim = new p5((env) => {
    setupStimulus(env, trialObj);
  }, 'stimulus-canvas');

  this.p5env = new p5((env) => {
    setupEnvironment(env, trialObj);
  }, 'environment-canvas');
};

var setupStimulus = function (p5stim, trialObj) {

  var testStim = trialObj.targetBlocks;
  
  p5stim.setup = function () {
    (p5stim
     .createCanvas(config.stimCanvasWidth, config.stimCanvasHeight)
     .parent('stimulus-canvas')); // add parent div 
  };

  p5stim.draw = function () {
    p5stim.background(220);
    showStimulus(p5stim, 'stim', testStim, individual_blocks = false, blockColor = trialObj.blockColor);
    showGrid(p5stim);
    showStimFloor(p5stim);
  };

};

var setupEnvironment = function (env, trialObj = null) {
  const buildColor = trialObj.blockColor;
  const disabledColor = trialObj.blockColor;

  // reset discrete world representation
  for (let i = 0; i < discreteWorld.length; i++) {
    discreteWorld[i] = new Array(config.discreteEnvHeight).fill(true); // true represents free
  }

  // Processing JS Function, defines initial environment.
  env.setup = function () {
    // Create Experiment Canvas
    // creates a P5 canvas (which is a wrapper for an HTML canvas)
    var envCanvas = env.createCanvas(config.envCanvasWidth, config.envCanvasHeight); 
    envCanvas.parent('environment-canvas'); // add parent div 

    // Set up Matter Physics Engine
    var engineOptions = {
      enableSleeping: true,
      velocityIterations: 24,
      positionIterations: 12
    }

    world = Matter.World.create({
      gravity: {
        y: 2
      }
    })
    engine = Engine.create(engineOptions);
    engine.world = world;

    // Create block kinds that will appear in environment/menu. Later on this will need to be represented in each task.

    blockDims.forEach((dims, i) => {
      blockKinds.push(new BlockKind(dims[0], dims[1], buildColor, 
                                    blockName = blockNames[i]));

    });

    // Create Block Menu
    blockMenu = new BlockMenu(config.menuHeight, blockKinds);

    // Add things to the physics engine world
    ground = new Boundary(
      config.envCanvasWidth / 2,
      config.floorY,
      config.envCanvasWidth * 1.5,
      config.floorHeight
    );
    var leftSide = new Boundary(-30, config.envCanvasHeight / 2, 60, config.envCanvasHeight);
    var rightSide = new Boundary(config.envCanvasWidth + 30, config.envCanvasHeight / 2,
                                 60, config.envCanvasHeight);
    Matter.World.add(engine.world, ground.body); 
    Matter.World.add(engine.world, leftSide.body);
    Matter.World.add(engine.world, rightSide.body);    
                     
    // Runner- use instead of line above if changes to game loop needed
    var runner = Matter.Runner.create({
      isFixed: true
    });
    Matter.Runner.run(runner, engine);

    // Set up interactions with physics objects
    // TO DO: stop interactions with menu bar rect
    //canvas.elt is the html element associated with the P5 canvas
    var canvasMouse = Mouse.create(envCanvas.elt);

    // Required for mouse's selected pixel to work on high-resolution displays
    canvasMouse.pixelRatio = env.pixelDensity(); 

    var options = {
      mouse: canvasMouse // set object to mouse object in canvas
    };
  };


  env.draw = function () { // Called continuously by Processing JS 
    env.background(220);
    ground.show(env);
    showMarker(env);

    // Menu
    blockMenu.show(env, config.envCanvasHeight, config.envCanvasWidth);
    /*
    // Rotate button
    env.noFill();
    env.stroke(200);
    env.arc(config.canvasWidth - 50, 50, 50, 50, env.TWO_PI, env.PI + 3 * env.QUARTER_PI);
    env.line(config.canvasWidth - 50 + 25, 50 - 23, config.canvasWidth - 50 + 25, 40);
    env.line(config.canvasWidth - 50 + 12, 40, config.canvasWidth - 50 + 25, 40);
    */

    showGrid(env);

    if (trialObj.condition == 'practice' && !scoring) {
      showStimulus(env, 'env', trialObj.targetBlocks, individual_blocks = true);
    }

    blocks.forEach(b => {
      b.show(env);
    });

    if (isPlacingObject) {

      // sleeping = blocks.filter((block) => block.body.isSleeping); // Would rather not be calculating this constantly.. update to eventlistener?
      // allSleeping = sleeping.length == blocks.length;

      selectedBlockKind.showGhost(env, env.mouseX, env.mouseY, rotated, discreteWorld,
                                  disabledBlockPlacement = disabledBlockPlacement);
    }

    if (!postSnap && snapBodiesPostPlacement) {
      sleeping = blocks.filter((block) => block.body.isSleeping);
      allSleeping = sleeping.length == blocks.length;
      if (allSleeping) {
        blocks.forEach(block => {
          snapBodyToGrid(block);
        });
        postSnap = true;
        blocks.forEach(b => {
          Matter.Sleeping.set(b, false)
        });
      }
    }


  }

  snapBodyToGrid = function (block) {
    //console.log(block.body);
    // snaps matter locations of block bodies to grid
    // to be called after all blocks are sleeping?  
    var currentX = block.body.position.x / worldScale;
    var currentY = block.body.position.y / worldScale;
    //var snappedX = (currentX+config.stim_scale/2)%(config.stim_scale) < (config.stim_scale/2) ? currentX - (currentX%(config.stim_scale/2)) : currentX - (currentX%(config.stim_scale)) + (config.stim_scale/2);
    if (((block.blockKind.w % 2 == 1) && (Math.abs(block.body.angle) % (Math.PI / 2) < Math.PI / 4)) || ((block.blockKind.h % 2 == 1) && (Math.abs(block.body.angle) % (Math.PI / 2) > Math.PI / 4))) {
      var snappedX = (currentX + config.stim_scale / 2) % (config.stim_scale) < (config.stim_scale / 2) ? currentX - (currentX % (config.stim_scale / 2)) : currentX - (currentX % (config.stim_scale)) + (config.stim_scale / 2);
    } else {
      var snappedX = currentX % (config.stim_scale) < (config.stim_scale / 2) ? currentX - currentX % (config.stim_scale) : currentX - currentX % (config.stim_scale) + config.stim_scale;
    }
    var snappedY = currentY;
    var snapped_location = Matter.Vector.create(snappedX * worldScale, snappedY * worldScale);
    Matter.Body.setPosition(block.body, snapped_location);
  }

  snapToGrid = function (selectedBlockKind, preciseMouseX, preciseMouseY, rotated = false, testing_placement = false, snapY = true) {

    // snaps X location of dropped block to grid

    var x_index = 0;
    if (selectedBlockKind.w % 2 == 1) {
      snappedX = (preciseMouseX + config.stim_scale / 2) % (config.stim_scale) < (config.stim_scale / 2) ? preciseMouseX - (preciseMouseX % (config.stim_scale / 2)) : preciseMouseX - (preciseMouseX % (config.stim_scale)) + (config.stim_scale / 2);
      //snappedY = snappedY = preciseMouseY%(config.stim_scale) < (config.stim_scale/2) ? preciseMouseY - preciseMouseY%(config.stim_scale) : preciseMouseY - preciseMouseY%(config.stim_scale) + config.stim_scale;
      //snappedX =  (preciseMouseX+config.stim_scale/2)%(config.stim_scale) < 0 ? preciseMouseX - preciseMouseX%(config.stim_scale) - config.stim_scale/2 : preciseMouseX - (preciseMouseX+config.stim_scale/2)%(config.stim_scale) + config.stim_scale;
      //snappedY = preciseMouseY%(config.stim_scale) < (config.stim_scale/2) ? preciseMouseY - preciseMouseY%(config.stim_scale) : preciseMouseY - preciseMouseY%(config.stim_scale) - config.stim_scale;
      x_index = snappedX / config.stim_scale - snappedX % config.stim_scale + 7 + 5; // + 7 for structure world, -
    } else if (selectedBlockKind.h % 2 == 1) {
      snappedX = preciseMouseX % (config.stim_scale) < (config.stim_scale / 2) ? preciseMouseX - preciseMouseX % (config.stim_scale) : preciseMouseX - preciseMouseX % (config.stim_scale) + config.stim_scale;
      //snappedY = (preciseMouseY+config.stim_scale/2)%(config.stim_scale) < (config.stim_scale/2) ? preciseMouseY - (preciseMouseY%(config.stim_scale/2)) : preciseMouseY - (preciseMouseY%(config.stim_scale)) + (config.stim_scale/2);
      x_index = snappedX / config.stim_scale - snappedX % config.stim_scale - selectedBlockKind.w / 2 - 5 + 5;
    }
    else {
      snappedX = preciseMouseX % (config.stim_scale) < (config.stim_scale / 2) ? preciseMouseX - preciseMouseX % (config.stim_scale) : preciseMouseX - preciseMouseX % (config.stim_scale) + config.stim_scale;
      //snappedY = snappedY = preciseMouseY%(config.stim_scale) < (config.stim_scale/2) ? preciseMouseY - preciseMouseY%(config.stim_scale) : preciseMouseY - preciseMouseY%(config.stim_scale) + config.stim_scale;
      x_index = snappedX / config.stim_scale - snappedX % config.stim_scale - selectedBlockKind.w / 2 - 5 + 5;
    }
    //console.log(x_index)

    if (!snapY) {
      snappedBlock = new Block(engine, selectedBlockKind, snappedX, preciseMouseY, rotated, testing_placement = testing_placement, x_index = x_index);
      return (snappedBlock);
    }
    else {

      // check rows from mousy y, down
      var y = Math.round(13 - (selectedBlockKind.h / 2) - ((preciseMouseY + (config.stim_scale / 2)) / config.stim_scale)) + 2;
      var rowFree = true;
      while (rowFree && y >= 0) {
        y -= 1;
        var blockEnd = x_index + selectedBlockKind.w
        for (let x = x_index; x < blockEnd; x++) { // check if row directly beneath block are all free at height y
          //console.log('checking:', y, x)
          rowFree = rowFree && discreteWorld[x][y];
        }

      }
      y_index = y + 1;
      //console.log('y_index',y_index);

      // ADD SNAP TO Y
      snappedY = (config.envCanvasHeight - config.floorHeight) - (config.stim_scale * (selectedBlockKind.h / 2)) - (config.stim_scale * (y_index)) + config.stim_scale / 2 + 6;

      snappedBlock = new Block(engine, selectedBlockKind, snappedX, snappedY, rotated, testing_placement = testing_placement, x_index = x_index, y_index = y_index);

      return (snappedBlock);
    }
  }

  env.mouseClicked = function () {
    //check to see if in env

    /* //Is clicking in top right of environment
       if (env.mouseY < 80 && env.mouseX > config.canvasWidth - 80 && isPlacingObject) {
       rotated = !rotated;
       }
    */

    // if mouse in main environment
    if (env.mouseY > 0 && (env.mouseY < config.envCanvasHeight - config.menuHeight) && (env.mouseX > 0 && env.mouseX < config.envCanvasWidth)) {

      if (isPlacingObject) {
        // test whether all blocks are sleeping
        sleeping = blocks.filter((block) => block.body.isSleeping);
        allSleeping = sleeping.length == blocks.length;

        time_placing = Date.now();

        if ((allSleeping || (time_placing - timeLastPlaced > 3000)) && ((env.mouseX > (config.sF * (selectedBlockKind.w / 2))) && (env.mouseX < config.envCanvasWidth - (config.sF * (selectedBlockKind.w / 2))))) {
          // SEND WORLD DATA AFTER PREVIOUS BLOCK HAS SETTLED
          // Sends information about the state of the world prior to next block being placed

          //test whether there is a block underneath this area

          test_block = snapToGrid(selectedBlockKind, env.mouseX, env.mouseY, rotated, testing_placement = true); //maybe redundant with y-snapping

          //test_block = new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated, testing_placement = true);
          if (test_block.can_be_placed() && trialObj.blockFell == false) {
            newBlock = snapToGrid(selectedBlockKind, env.mouseX, env.mouseY, rotated);
            blocks.push(newBlock);

            // jsPsych.pluginAPI.setTimeout(function () {
            //   var moved = newBlock.checkMotion();
            //   if (moved) {
            //     trialObj.blockFell = true;
            //     newBlock.color = mistakeColor;
            //     var env_divs = document.getElementsByClassName("col-md env-div");
            //     Array.prototype.forEach.call(env_divs, env_div => {
            //       env_div.style.backgroundColor = "#F02020";
            //     });
            //   } 
            // }, 1500);

            // update discrete world map

            discreteWorldPrevious = _.cloneDeep(discreteWorld);

            blockTop = newBlock.y_index + selectedBlockKind.h;
            blockRight = newBlock.x_index + selectedBlockKind.w;

            for (let y = newBlock.y_index; y < blockTop; y++) {
              for (let x = newBlock.x_index; x < blockRight; x++) {
                discreteWorld[x][y] = false;
              }
            }


            postSnap = false;
            // blocks.push(new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated));
            selectedBlockKind = null;
            env.cursor();
            isPlacingObject = false;
            blocks.forEach(b => {
              Sleeping.set(b.body, false);
            });

          } else {
            disabledBlockPlacement = true;
            // jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to white
            //   disabledBlockPlacement = false;
            // }, 100);
          }

        } else {
          disabledBlockPlacement = true;
          // jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to white
          //   disabledBlockPlacement = false;
          // }, 100);

        }

      }
    }

    if (env.mouseY > 0 && (env.mouseY < config.envCanvasHeight) && (env.mouseX > 0 && env.mouseX < config.envCanvasWidth)) { //or if in menu then update selected blockkind

      // is mouse clicking a block?
      newSelectedBlockKind = blockMenu.hasClickedButton(env.mouseX, env.mouseY, selectedBlockKind);
      if (newSelectedBlockKind) {
        if (newSelectedBlockKind == selectedBlockKind) {
          timeBlockSelected = Date.now();

          //rotated = !rotated; // uncomment to allow rotation by re-selecting block from menu
        } else {
          rotated = false;
        }
        selectedBlockKind = newSelectedBlockKind;
        isPlacingObject = true;
      }

    }

  }

}

var removeEnv = function () {

  // remove environment
  p5env.remove();

  // Update variables
  blocks = [];
  blockKinds = [];
  isPlacingObject = false;
  rotated = false;
  selectedBlockKind = null;
  // setup new environment   
}

var removeStimWindow = function () {
  // remove environment
  p5stim.remove();
}

function showStimulus(env, envName, stimulus, individual_blocks = false, blockColor = [28,54,220,50]){
  Array.prototype.forEach.call(stimulus, block => {
    showBlock(env, envName, block, individual_blocks = individual_blocks, blockColor = blockColor);
  });
}

function showBlock(env, envName, block, individual_blocks = false, blockColor = [28,54,62]){
  const width = block.width;
  const height = block.height;
  const x_left = block.x - config.worldWidth/2;
  const x_center = x_left + block.width/2;
  const y_bottom = config.worldHeight - block.y - config.worldHeight/2;
  const y_center =  y_bottom - block.height/2;
  const y_top = y_bottom - height;
  const canvasHeight = envName == 'env' ? config.envCanvasHeight : config.stimCanvasHeight;
  const canvasWidth = envName == 'env' ? config.envCanvasWidth : config.stimCanvasWidth;  
        
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

function setupGrid(){

  grid_left = -9;
  grid_right = 11;
  grid_bottom = 0;
  grid_top = 20;

  var grid_x = new Array(grid_right-grid_left);
  var grid_y = new Array(grid_top-grid_bottom);

  i = grid_left;
  while(i < grid_right) {
    grid_x[i] = config.stim_scale*i + config.canvasWidth/2 - config.stim_scale/2;
    i = i+1;
  }  

  j = grid_bottom;
  while(j < grid_top) {
    grid_y[j] =  (config.canvasHeight - config.floorHeight) - (config.stim_scale*j) + config.stim_scale/2 - 6;
    j = j+1;
  } 

  return [grid_x,grid_y]
  
}

function showGrid(env){

  var grid_x = grid[0];
  var grid_y = grid[1];

  var squareWidth = config.stim_scale;
  var squareHeight = config.stim_scale;

  grid_left = -9;
  grid_right = 11;
  grid_bottom = 0;
  grid_top = 20;

  i = grid_left;
  while(i < grid_right) {
    j = grid_bottom;
    while(j < grid_top) {
      env.push();
      env.rectMode(env.CENTER);
      env.stroke([190,190,255]);
      env.noFill()
      env.translate(grid_x[i], grid_y[j]);
      env.rect(0,0,squareWidth,squareHeight);
      env.pop();
      j = j+1;
    }
    i = i+1;
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

module.exports ={
  setupEnvs: setupEnvs
};
