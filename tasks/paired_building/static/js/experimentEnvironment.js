// Experiment frame, with Matter canvas and surrounding buttons
var config = require('./display_config.js');
var Matter = require('./matter.js');
var p5 = require('./p5.js');
var Boundary = require('./boundary.js');
var BlockMenu = require('./blockMenu.js');
var BlockKind = require('./blockKind.js');
var Block = require('./block.js');
var display = require('./displayStimuli.js');
var imagePath = '../img/';

class BlockUniverse {

  constructor() {
    this.scoring = false;

    // Global Variables for Matter js and custom Matter js wrappers
    this.engine = undefined;
    this.blocks = [];
    this.blockKinds = [];
    this.propertyList = [];

    // Block placement variables
    this.isPlacingObject = false;
    this.rotated = false;
    this.selectedBlockKind = null;
    this.disabledBlockPlacement = false;
    this.snapBodiesPostPlacement = true;
    this.postSnap = false;

    // Store world
    this.discreteWorld = new Array(config.discreteEnvWidth);
    this.discreteWorldPrevious = new Array();

    // Task variables
    this.timeLastPlaced = Date.now();
    this.timeBlockSelected = Date.now();

    this.blockDims = [
      [1, 2],
      [2, 1]
    ];

    this.blockNames = ['v', 'h'];

    // // Metavariables
    // this.dbname = 'block_construction';
    // this.colname = 'silhouette';

    this.sendingBlocks = [];

    // Scaling values
    display.grid.setup(); // initialize grid

    this.blockSender = undefined;

    this.blockMenu = this.setupBlockMenu();

    this.revealTarget = false;

  }

  setupEnvs(trialObj) {
    var localThis = this;
    this.p5stim = new p5((env) => {
      localThis.setupStimulus(env, trialObj);
    }, 'stimulus-canvas');

    this.p5env = new p5((env) => {
      localThis.setupEnvironment(env, trialObj);
    }, 'environment-canvas');
  };

  setupStimulus(p5stim, trialObj) {
    var localThis = this;

    var testStim = trialObj.targetBlocks;
    p5stim.setup = function () {
      p5stim
        .createCanvas(config.stimCanvasWidth, config.stimCanvasHeight)
        .parent('stimulus-canvas'); // add parent div 

    };

    p5stim.draw = function () {
      p5stim.background(220);
      display.showStimulus(p5stim, testStim, false, config.stimColor);
      display.showStimFloor(p5stim);
      display.grid.show(p5stim);
      display.showReconstruction(p5stim, localThis.sendingBlocks, false);
      
      localThis.blockMenu.show(p5stim, false);
    };

  };

  setupEngine() {
    // Set up Matter Physics Engine
    this.engine = Matter.Engine.create({
      enableSleeping: true,
      velocityIterations: 24,
      positionIterations: 12
    });

    this.engine.world = Matter.World.create({
      gravity: {
        y: 0
      }
    });
  }

  setupBlockMenu() {
    // Create block kinds that will appear in environment &
    // menu. Later on this will need to be represented in each task.
    var c = 0;
    this.blockDims.forEach((dims, i) => {
      this.blockKinds.push(new BlockKind(this.engine, dims[0], dims[1], config.buildColors[c], this.blockNames[i]));
      c++;
    });

    // Create Block Menu
    return new BlockMenu(config.menuHeight, this.blockKinds);
  }

  setupBoundaries() {
    this.ground = new Boundary(
      config.envCanvasWidth / 2,
      config.floorY,
      config.envCanvasWidth * 1.5,
      config.floorHeight
    );
    this.leftSide = new Boundary(
      -30, config.envCanvasHeight / 2, 60, config.envCanvasHeight
    );
    this.rightSide = new Boundary(
      config.envCanvasWidth + 30, config.envCanvasHeight / 2, 60, config.envCanvasHeight
    );
    Matter.World.add(this.engine.world, this.ground.body);
    Matter.World.add(this.engine.world, this.leftSide.body);
    Matter.World.add(this.engine.world, this.rightSide.body);
  }

  setupEnvironment(env, trialObj = null) {

    // reset discrete world representation
    for (let i = 0; i < this.discreteWorld.length; i++) {
      this.discreteWorld[i] = new Array(config.discreteEnvHeight).fill(true); // true represents free
    }

    // Processing JS Function, defines initial environment.
    env.setup = function () {
      // Create Experiment Canvas
      // creates a P5 canvas (which is a wrapper for an HTML canvas)
      var envCanvas = env.createCanvas(config.envCanvasWidth, config.envCanvasHeight);
      envCanvas.parent('environment-canvas'); // add parent div 

      this.setupEngine();
      //this.setupBlockMenu();
      this.setupBoundaries();

      // Add things to the physics engine world

      // Runner- use instead of line above if changes to game loop needed
      Matter.Runner.run(Matter.Runner.create({
        isFixed: true
      }), this.engine);

      // Set up interactions with physics objects
      // TO DO: stop interactions with menu bar rect
      //canvas.elt is the html element associated with the P5 canvas
      var canvasMouse = Matter.Mouse.create(envCanvas.elt);

      // Required for mouse's selected pixel to work on high-resolution displays
      canvasMouse.pixelRatio = env.pixelDensity();

      var options = {
        mouse: canvasMouse // set object to mouse object in canvas
      };
    }.bind(this);

    env.draw = function () { // Called continuously by Processing JS 
      env.background(220);
      this.ground.show(env);
      this.leftSide.show(env);
      this.rightSide.show(env);
      display.showMarker(env);

      // Menu & grid
      this.blockMenu.show(env, this.disabledBlockPlacement);
      display.grid.show(env);

      if (trialObj.condition == 'practice' && !this.scoring) {
        display.showStimulus(env, trialObj.targetBlocks, true);
      }

      this.blocks.forEach(b => {
        b.show(env);
      });

      // Show outline of block snapped to grid when placing object
      if (this.isPlacingObject) {
        this.selectedBlockKind.showGhost(
          env, env.mouseX, env.mouseY, this.rotated, this.discreteWorld, this.disabledBlockPlacement
        );
      }

      // Make sure all blocks are snapped
      if (!this.postSnap && this.snapBodiesPostPlacement) {
        this.sleeping = this.blocks.filter((block) => block.body.isSleeping);
        this.allSleeping = this.sleeping.length == this.blocks.length;
        if (this.allSleeping) {
          this.blocks.forEach(block => {
            block.snapBodyToGrid();
          });
          this.postSnap = true;
          this.blocks.forEach(b => {
            Matter.Sleeping.set(b, false);
          });
        }
      }

      if (this.revealTarget){
        display.showStimulus(env, trialObj.targetBlocks, false, config.revealedTargetColor);
      }

    }.bind(this);


    //ADD IF TO EVENT HANDLER, CHANGE TURNS ON BUTTON

    env.mouseClicked = function () {

      if (!this.disabledBlockPlacement) {

        // if mouse in main environment
        if (env.mouseY > 0 && (env.mouseY < config.envCanvasHeight - config.menuHeight) &&
          (env.mouseX > 0 && env.mouseX < config.envCanvasWidth)) {
          if (this.isPlacingObject) {
            // test whether all blocks are sleeping
            this.sleeping = this.blocks.filter((block) => block.body.isSleeping);
            this.allSleeping = this.sleeping.length == this.blocks.length;

            this.time_placing = Date.now();

            if ((this.allSleeping || (this.time_placing - this.timeLastPlaced > 3000)) &&
              ((env.mouseX > (config.sF * (this.selectedBlockKind.w / 2))) &&
                (env.mouseX < config.envCanvasWidth - (config.sF * (this.selectedBlockKind.w / 2))))) {
              // SEND WORLD DATA AFTER PREVIOUS BLOCK HAS SETTLED
              // Sends information about the state of the world prior to next block being placed
              this.placeBlock(env, trialObj);
            } 
            
            // else {
            //   this.disabledBlockPlacement = true;
            //   // jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to white
            //   //   disabledBlockPlacement = false;
            //   // }, 100);
            // }
          }
        }

        // or if in menu then update selected blockkind
        if (env.mouseY > 0 && (env.mouseY < config.envCanvasHeight) &&
          (env.mouseX > 0 && env.mouseX < config.envCanvasWidth)) {

          // is mouse clicking a block?
          var newSelectedBlockKind = this.blockMenu.hasClickedButton(env.mouseX, env.mouseY, this.selectedBlockKind);
          if (newSelectedBlockKind) {
            if (newSelectedBlockKind == this.selectedBlockKind) {
              this.timeBlockSelected = Date.now();
              //rotated = !rotated; // uncomment to allow rotation by re-selecting block from menu
            } else {
              this.rotated = false;
            }
            this.selectedBlockKind = newSelectedBlockKind;
            this.isPlacingObject = true;
          }
        }
      }
    }.bind(this);
  }

  placeBlock(env, trialObj) {

    var testBlock = this.selectedBlockKind.createSnappedBlock(
      env.mouseX, env.mouseY, this.discreteWorld, true
    );

    if (testBlock.can_be_placed_discrete(this.discreteWorld)) { // don't test for anything with placement
      var newBlock = this.selectedBlockKind.createSnappedBlock(
        env.mouseX, env.mouseY, this.discreteWorld, false
      );

      this.blocks.push(newBlock);

      var transluscent_color = _.cloneDeep(this.selectedBlockKind.blockColor);
      transluscent_color[3] -= 100;

      const sendingBlockData = {
        block: {
          x: newBlock.x_index,
          y: newBlock.y_index,
          width: newBlock.blockKind.w,
          height: newBlock.blockKind.h,
          color: transluscent_color, // appends alpha value to color of block- will fail if block is not opaque
        },
        blockNum: this.blocks.length
      }

      this.sendingBlocks.push(sendingBlockData.block);
      this.blockSender(sendingBlockData);

      // update discrete world map

      this.discreteWorldPrevious = _.cloneDeep(this.discreteWorld);

      var blockTop = newBlock.y_index + this.selectedBlockKind.h;
      var blockRight = newBlock.x_index + this.selectedBlockKind.w;

      for (let y = newBlock.y_index; y < blockTop; y++) {
        for (let x = newBlock.x_index; x < blockRight; x++) {
          this.discreteWorld[x][y] = false;
        }
      }


      this.postSnap = false;
      // blocks.push(new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated));
      this.selectedBlockKind = null;
      env.cursor();
      this.isPlacingObject = false;
      this.blocks.forEach(b => {
        Matter.Sleeping.set(b.body, false);
      });

    } else {
      //this.disabledBlockPlacement = true;
      // jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to white
      //   disabledBlockPlacement = false;
      // }, 100);
    }


  }

  removeEnv() {
    // remove environment
    this.p5env.remove();

    // Update variables
    this.blocks = [];
    this.blockKinds = [];
    this.isPlacingObject = false;
    this.rotated = false;
    this.selectedBlockKind = null;
  }

  removeStimWindow() {
    // remove environment
    this.p5stim.remove();
  }
}

module.exports = BlockUniverse;
