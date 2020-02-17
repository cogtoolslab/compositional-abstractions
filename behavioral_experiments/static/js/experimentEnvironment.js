// Experiment frame, with Matter canvas and surrounding buttons

var imagePath = '../img/';
const socket = io.connect();

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

// Environment parameters
var canvasHeight = 450;
var canvasWidth = 450;
var menuHeight = canvasHeight / 4.2;
var menuWidth = canvasWidth;
var floorY = (canvasHeight - menuHeight);
var floorHeight = canvasHeight / 3;
var aboveGroundProp = floorY / canvasHeight;

// Metavariables
const dbname = 'block_construction';
const colname = 'silhouette';

// Stimulus parameters
var stimCanvasWidth = canvasWidth;
var stimCanvasHeight = canvasHeight;
var stimX = stimCanvasWidth / 2;
var stimY = stimCanvasHeight / 2;

// p5 instances
var p5stim;
var p5env;

var scoring = false;

// Scaling values
var sF = 25; //scaling factor to change appearance of blocks
var worldScale = 2.2; //scaling factor within matterjs
var stim_scale = sF; //scale of stimulus silhouette
var grid = setupGrid(); // initialize grid
var chocolateBlocks = true;

// Global Variables for Matter js and custom Matter js wrappers
var engine;
var ground;
var blocks = [];
var blockMenu;
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

var buildColor = [179, 47, 10, 255];
var disabledColor = [100, 100, 100, 30];
var mistakeColor = [215, 30, 30, 200];

// discrete world representation for y-snapping
var discreteEnvHeight = 13;
var discreteEnvWidth = 18;
var discreteWorld = new Array(discreteEnvWidth);

var discreteWorldPrevious = new Array();

var setupEnvironment = function (env, trialObj = null) {
    //console.log(trialObj);

    buildColor = trialObj.blockColor;
    disabledColor = trialObj.blockColor;

    // reset discrete world representation
    for (let i = 0; i < discreteWorld.length; i++) {
        discreteWorld[i] = new Array(discreteEnvHeight).fill(true); // true represents free
    }

    // Processing JS Function, defines initial environment.
    env.setup = function () {

        // Create Experiment Canvas
        environmentCanvas = env.createCanvas(canvasWidth, canvasHeight); // creates a P5 canvas (which is a wrapper for an HTML canvas)
        environmentCanvas.parent('environment-window'); // add parent div 

        // Set up Matter Physics Engine
        engineOptions = {
            enableSleeping: true,
            velocityIterations: 24,
            positionIterations: 12
        }

        world = World.create({
            gravity: {
                y: 2
            }
        })
        engine = Engine.create(engineOptions);
        engine.world = world;

        // Create block kinds that will appear in environment/menu. Later on this will need to be represented in each task.

        blockDims.forEach((dims, i) => {
            w = dims[0]
            h = dims[1]
            blockKinds.push(new BlockKind(w, h, buildColor, blockName = blockNames[i]));

        });

        // Create Block Menu
        blockMenu = new BlockMenu(menuHeight, blockKinds);

        // Add things to the physics engine world
        ground = new Boundary(canvasWidth / 2, floorY, canvasWidth * 1.5, floorHeight);
        sideLeft = new Boundary(-30, canvasHeight / 2, 60, canvasHeight);
        sideRight = new Boundary(canvasWidth + 30, canvasHeight / 2, 60, canvasHeight);
        //box1 = new Box(200, 100, 30, 30);

        // Runner- use instead of line above if changes to game loop needed
        runner = Matter.Runner.create({
            isFixed: true
        });
        Runner.run(runner, engine);

        // Set up interactions with physics objects
        // TO DO: stop interactions with menu bar rect
        var canvasMouse = Mouse.create(environmentCanvas.elt); //canvas.elt is the html element associated with the P5 canvas
        canvasMouse.pixelRatio = env.pixelDensity(); // Required for mouse's selected pixel to work on high-resolution displays

        var options = {
            mouse: canvasMouse // set object to mouse object in canvas
        }

    }


    env.draw = function () { // Called continuously by Processing JS 
        env.background(220);
        ground.show(env);

        // Menu
        blockMenu.show(env);
        /*
        // Rotate button
        env.noFill();
        env.stroke(200);
        env.arc(canvasWidth - 50, 50, 50, 50, env.TWO_PI, env.PI + 3 * env.QUARTER_PI);
        env.line(canvasWidth - 50 + 25, 50 - 23, canvasWidth - 50 + 25, 40);
        env.line(canvasWidth - 50 + 12, 40, canvasWidth - 50 + 25, 40);
        */

        showGrid(env);

        if (trialObj.condition == 'practice' && !scoring) {
            showStimulus(env, trialObj.targetBlocks, individual_blocks = true);
        }

        blocks.forEach(b => {
            b.show(env);
        });

        if (isPlacingObject) {

            // sleeping = blocks.filter((block) => block.body.isSleeping); // Would rather not be calculating this constantly.. update to eventlistener?
            // allSleeping = sleeping.length == blocks.length;

            selectedBlockKind.showGhost(env, env.mouseX, env.mouseY, rotated, disabledBlockPlacement = disabledBlockPlacement);
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
        //var snappedX = (currentX+stim_scale/2)%(stim_scale) < (stim_scale/2) ? currentX - (currentX%(stim_scale/2)) : currentX - (currentX%(stim_scale)) + (stim_scale/2);
        if (((block.blockKind.w % 2 == 1) && (Math.abs(block.body.angle) % (Math.PI / 2) < Math.PI / 4)) || ((block.blockKind.h % 2 == 1) && (Math.abs(block.body.angle) % (Math.PI / 2) > Math.PI / 4))) {
            var snappedX = (currentX + stim_scale / 2) % (stim_scale) < (stim_scale / 2) ? currentX - (currentX % (stim_scale / 2)) : currentX - (currentX % (stim_scale)) + (stim_scale / 2);
        } else {
            var snappedX = currentX % (stim_scale) < (stim_scale / 2) ? currentX - currentX % (stim_scale) : currentX - currentX % (stim_scale) + stim_scale;
        }
        var snappedY = currentY;
        var snapped_location = Matter.Vector.create(snappedX * worldScale, snappedY * worldScale);
        Matter.Body.setPosition(block.body, snapped_location);
    }

    snapToGrid = function (selectedBlockKind, preciseMouseX, preciseMouseY, rotated = false, testing_placement = false, snapY = true) {

        // snaps X location of dropped block to grid

        var x_index = 0;
        if (selectedBlockKind.w % 2 == 1) {
            snappedX = (preciseMouseX + stim_scale / 2) % (stim_scale) < (stim_scale / 2) ? preciseMouseX - (preciseMouseX % (stim_scale / 2)) : preciseMouseX - (preciseMouseX % (stim_scale)) + (stim_scale / 2);
            //snappedY = snappedY = preciseMouseY%(stim_scale) < (stim_scale/2) ? preciseMouseY - preciseMouseY%(stim_scale) : preciseMouseY - preciseMouseY%(stim_scale) + stim_scale;
            //snappedX =  (preciseMouseX+stim_scale/2)%(stim_scale) < 0 ? preciseMouseX - preciseMouseX%(stim_scale) - stim_scale/2 : preciseMouseX - (preciseMouseX+stim_scale/2)%(stim_scale) + stim_scale;
            //snappedY = preciseMouseY%(stim_scale) < (stim_scale/2) ? preciseMouseY - preciseMouseY%(stim_scale) : preciseMouseY - preciseMouseY%(stim_scale) - stim_scale;
            x_index = snappedX / stim_scale - snappedX % stim_scale + 7 + 5; // + 7 for structure world, -
        } else if (selectedBlockKind.h % 2 == 1) {
            snappedX = preciseMouseX % (stim_scale) < (stim_scale / 2) ? preciseMouseX - preciseMouseX % (stim_scale) : preciseMouseX - preciseMouseX % (stim_scale) + stim_scale;
            //snappedY = (preciseMouseY+stim_scale/2)%(stim_scale) < (stim_scale/2) ? preciseMouseY - (preciseMouseY%(stim_scale/2)) : preciseMouseY - (preciseMouseY%(stim_scale)) + (stim_scale/2);
            x_index = snappedX / stim_scale - snappedX % stim_scale - selectedBlockKind.w / 2 - 5 + 5;
        }
        else {
            snappedX = preciseMouseX % (stim_scale) < (stim_scale / 2) ? preciseMouseX - preciseMouseX % (stim_scale) : preciseMouseX - preciseMouseX % (stim_scale) + stim_scale;
            //snappedY = snappedY = preciseMouseY%(stim_scale) < (stim_scale/2) ? preciseMouseY - preciseMouseY%(stim_scale) : preciseMouseY - preciseMouseY%(stim_scale) + stim_scale;
            x_index = snappedX / stim_scale - snappedX % stim_scale - selectedBlockKind.w / 2 - 5 + 5;
        }
        //console.log(x_index)

        if (!snapY) {
            snappedBlock = new Block(selectedBlockKind, snappedX, preciseMouseY, rotated, testing_placement = testing_placement, x_index = x_index);
            return (snappedBlock);
        }
        else {

            // check rows from mousy y, down
            var y = Math.round(13 - (selectedBlockKind.h / 2) - ((preciseMouseY + (stim_scale / 2)) / stim_scale)) + 2;
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
            snappedY = (canvasHeight - floorHeight) - (stim_scale * (selectedBlockKind.h / 2)) - (stim_scale * (y_index)) + stim_scale / 2 + 6;

            snappedBlock = new Block(selectedBlockKind, snappedX, snappedY, rotated, testing_placement = testing_placement, x_index = x_index, y_index = y_index);

            return (snappedBlock);
        }
    }

    env.mouseClicked = function () {
        //check to see if in env

        /* //Is clicking in top right of environment
        if (env.mouseY < 80 && env.mouseX > canvasWidth - 80 && isPlacingObject) {
            rotated = !rotated;
        }
        */

        // if mouse in main environment
        if (env.mouseY > 0 && (env.mouseY < canvasHeight - menuHeight) && (env.mouseX > 0 && env.mouseX < canvasWidth)) {

            if (isPlacingObject) {
                // test whether all blocks are sleeping
                sleeping = blocks.filter((block) => block.body.isSleeping);
                allSleeping = sleeping.length == blocks.length;

                time_placing = Date.now();

                if ((allSleeping || (time_placing - timeLastPlaced > 3000)) && ((env.mouseX > (sF * (selectedBlockKind.w / 2))) && (env.mouseX < canvasWidth - (sF * (selectedBlockKind.w / 2))))) {
                    // SEND WORLD DATA AFTER PREVIOUS BLOCK HAS SETTLED
                    // Sends information about the state of the world prior to next block being placed

                    //test whether there is a block underneath this area

                    test_block = snapToGrid(selectedBlockKind, env.mouseX, env.mouseY, rotated, testing_placement = true); //maybe redundant with y-snapping

                    //test_block = new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated, testing_placement = true);
                    if (test_block.can_be_placed() && trialObj.blockFell == false) {

                        //if (test_block.can_be_placed()) {

                        // if (blocks.length != 0) { //if a block has already been placed, send settled world state
                        //     sendData('settled', trialObj);
                        // }

                        if (env.mouseY < canvasHeight / 6 && trialObj.phase == 'build') { // if dropping from a great height, assume they are messing around
                            trialObj.pMessingAround += 0.2;
                            if (trialObj.pMessingAround > 0.6) {
                                alert('Dropping blocks from high up is likely to make the tower unstable!');
                            }
                        }

                        newBlock = snapToGrid(selectedBlockKind, env.mouseX, env.mouseY, rotated);
                        blocks.push(newBlock);

                        jsPsych.pluginAPI.setTimeout(function () {
                            var moved = newBlock.checkMotion();
                            if (moved) {
                                trialObj.blockFell = true;
                                newBlock.color = mistakeColor;
                                var env_divs = document.getElementsByClassName("col-md env-div");
                                Array.prototype.forEach.call(env_divs, env_div => {
                                    env_div.style.backgroundColor = "#F02020";
                                });
                                jsPsych.pluginAPI.setTimeout(function () {
                                    //trialObj.endTrial(endReason ='block_motion');
                                    discreteWorld = _.cloneDeep(discreteWorldPrevious);
                                    trialObj.fell_over();
                                }, 3500);
                            } else { //auto advance trials
                                // var currentNormedScore = trialObj.getNormedScore(trialObj.getCurrScore());
                                // console.log(currentNormedScore)
                                // if (currentNormedScore > 0.99) {
                                //     trialObj.perfectStructure();
                                // }

                                //printTwoDiscreteMaps(trialObj.targetMap, discreteWorld);

                                
                                if (trialObj.incrementalNormedScoreDiscrete == 1 && !trialObj.completed) {
                                    trialObj.completed = true;
                                    trialObj.endTrial(endReason = 'perfect_structure');
                                }

                            }
                            
                        }, 1500);

                        // update discrete world map

                        discreteWorldPrevious = _.cloneDeep(discreteWorld);

                        blockTop = newBlock.y_index + selectedBlockKind.h;
                        blockRight = newBlock.x_index + selectedBlockKind.w;

                        for (let y = newBlock.y_index; y < blockTop; y++) {
                            for (let x = newBlock.x_index; x < blockRight; x++) {
                                discreteWorld[x][y] = false;
                            }
                        }

                        rawScoreDiscrete = getScoreDiscrete(trialObj.targetMap, discreteWorld);
                        //console.log(rawScoreDiscrete);
                        trialObj.incrementalNormedScoreDiscrete = trialObj.getNormedScoreDiscrete(rawScoreDiscrete, trialObj.nullScoreDiscrete, trialObj.scoreGapDiscrete);
                        //console.log('normedDiscrete', normedScoreDiscrete);
                        sendData('settled', trialObj);

                        postSnap = false;
                        // blocks.push(new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated));
                        selectedBlockKind = null;
                        env.cursor();
                        isPlacingObject = false;
                        blocks.forEach(b => {
                            Sleeping.set(b.body, false);
                        });

                        // send initial data about block placement
                        jsPsych.pluginAPI.setTimeout(function () { // will be a rough estimate- not entirely useful and maybe misleading info
                            sendData('initial', trialObj);
                        }, 30);


                    } else {
                        disabledBlockPlacement = true;
                        jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to white
                            disabledBlockPlacement = false;
                        }, 100);
                    }

                } else {
                    disabledBlockPlacement = true;
                    jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to white
                        disabledBlockPlacement = false;
                    }, 100);

                }

            }
        }

        if (env.mouseY > 0 && (env.mouseY < canvasHeight) && (env.mouseX > 0 && env.mouseX < canvasWidth)) { //or if in menu then update selected blockkind

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

var setupStimulus = function (p5stim, trialObj) {

    var testStim = trialObj.targetBlocks;

    p5stim.setup = function () {
        stimulusCanvas = p5stim.createCanvas(stimCanvasWidth, stimCanvasWidth);
        stimulusCanvas.parent('stimulus-window'); // add parent div 
    };

    p5stim.draw = function () {
        p5stim.background(220);
        showStimulus(p5stim, testStim, individual_blocks = false, blockColor = trialObj.blockColor);
        //showGrid(p5stim);
        showFloor(p5stim);
    };

};

var setupEnvs = function (trialObj) {
    p5stim = new p5((env) => {
        setupStimulus(env, trialObj = trialObj)
    }, 'stimulus-canvas');
    p5env = new p5((env) => {
        setupEnvironment(env, trialObj = trialObj)
    }, 'environment-canvas');
    return p5stim, p5env
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


var sendData = function (eventType, trialObj) {

    //console.log('sending data of type: ', eventType);
    /** eventType one of:
     *  - initial, first placement of block. Sends data of type:
     *      - blockData (note that state of world can be inferred from previous settled state)
     *      - also state of the world
     *  - settled, state of world when that block has been placed. Sends data of type:
     *      - worldData (note that block placement can be inferred from previous settled state)
     *  - reset, when reset button pressed and world emptied. Sends data of type:
     *      - resetData
    */

    // info from mturk
    var turkInfo = jsPsych.turk.turkInfo();

    // common info to send to mongo
    var commonInfo = {
        // identification
        dbname: dbname,
        colname: colname,
        iterationName: trialObj.iterationName,
        workerId: turkInfo.workerId,
        hitID: turkInfo.hitId,
        aID: turkInfo.assignmentId,
        gameID: trialObj.gameID,
        version: trialObj.versionInd,
        randID: trialObj.randID, // additional random ID in case none assigned from other sources
        //timing
        timeRelative: performance.now(), // time since session began
        timeAbsolute: Date.now(),
        // phase and condition
        phase: trialObj.phase,
        condition: trialObj.condition,
        trialNum: trialObj.trialNum,
        //scoring
        nullScore: trialObj.nullScore,
        scoreGap: trialObj.scoreGap,
        F1Score: trialObj.F1Score,
        normedScore: trialObj.normedScore,
        rawScoreDiscrete: trialObj.rawScoreDiscrete,
        normedScoreDiscrete: trialObj.normedScoreDiscrete,
        nullScoreDiscrete: trialObj.nullScoreDiscrete,
        scoreGapDiscrete: trialObj.scoreGapDiscrete,
        currBonus: trialObj.currBonus,
        score: cumulBonus,
        points: trialObj.points,
        numTrials: trialObj.num_trials,
        //trial vars
        targetName: trialObj.targetName,
        targetBlocks: trialObj.targetBlocks,
        prompt: trialObj.prompt,
        blockColors: trialObj.blockColors,
        blockColor: trialObj.blockColor,
        blockColorID: trialObj.blockColorID,
        numTargets: numTargets,
        prePostSetSize: setSize,
        numRepetitions: numReps,
        repetition: trialObj.repetition,
        targetID: trialObj.targetID,
        //global vars
        practiceDuration: trialObj.practice_duration,
        buildDuration: trialObj.build_duration,
        timeThresholdYellow: trialObj.timeThresholdYellow,
        timeThresholdRed: trialObj.timeThresholdRed,
        devMode: trialObj.dev_mode,
        discreteEnvHeight: discreteEnvHeight,
        discreteEnvWidth: discreteEnvWidth,
        browser: trialObj.browser,
        browserVersion: trialObj.browserVersion,
        os: trialObj.os
    };

    if (eventType == 'survey_data') {

        survey_data = _.extend(commonInfo, JSON.parse(trialObj.text_data), JSON.parse(trialObj.multi_choice_data), {
            dataType: eventType,
            eventType: eventType
        });
        //console.log(survey_data);
        socket.emit('currentData', survey_data);

    } else {
        // general info about world params, bundled into worldInfo
        floorBody = ground.body;
        // test out sending newBlock info to server/mongodb
        floorPropertyList = Object.keys(floorBody); // extract block properties;
        floorPropertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
        floorProperties = _.pick(floorBody['body'], propertyList); // pick out all and only the block body properties in the property list    
        vertices = _.map(floorBody.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });

        worldInfo = {
            canvasHeight: canvasHeight,
            canvasWidth: canvasWidth,
            menuHeight: menuHeight,
            menuWidth: menuWidth,
            floorY: floorY,
            stimCanvasWidth: stimCanvasWidth,
            stimCanvasHeight: stimCanvasHeight,
            stimX: stimX,
            stimY: stimY,
            scalingFactor: sF,
            worldScale: worldScale,
            stim_scale: stim_scale,
            allBlockDims: [
                [1, 2],
                [2, 1],
                [2, 2],
                [2, 4],
                [4, 2]
            ],
            worldWidthUnits: 8,
            worldHeightUnits: 8,
            blockOptions: { //update if changed in block
                friction: 0.9,
                frictionStatic: 1.4,
                density: 0.0035,
                restitution: 0.001,
                sleepThreshold: 30
            },
            floorOptions: {
                isStatic: true, // static i.e. not affected by gravity
                friction: 0.9,
                frictionStatic: 2
            },
            floorProperties: floorProperties, //properties of floor body
            vertices: vertices
        };

        // glom commonInfo and worldInfo together
        _.extend(commonInfo, worldInfo);

        //console.log('commonInfo: ', commonInfo);
        //console.log('trialObj: ', trialObj);

        if (eventType == 'none') {
            console.log('Error: Null eventType sent');
        };

        //console.log('Trying to send ' + eventType + ' data from ' + phase + ' phase');

        if (eventType == 'initial') {
            // Send data about initial placement of a block
            // Could be in Build 

            timeLastPlaced = Date.now();
            trialObj.timeLastPlaced = timeLastPlaced;

            // test out sending newBlock info to server/mongodb
            propertyList = Object.keys(newBlock.body); // extract block properties;
            propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
            blockProperties = _.pick(newBlock['body'], propertyList); // pick out all and only the block body properties in the property list

            // get score of placement of block before gravity (likely a rough estimate)
            var incrementalScore = trialObj.getCurrScore()
            var normedIncrementalScore = trialObj.getNormedScore(trialObj.getCurrScore());

            // custom de-borkification
            vertices = _.map(newBlock.body.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });

            block_data = _.extend({}, commonInfo, {
                dataType: 'block',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                phase: trialObj.phase,
                blockDimUnits: [newBlock.blockKind.w, newBlock.blockKind.h],
                blockWidth: newBlock['w'],
                blockHeight: newBlock['h'],
                blockCenterX: newBlock['body']['position']['x'],
                blockCenterY: newBlock['body']['position']['y'],
                blockVertices: vertices,
                blockBodyProperties: blockProperties,
                blockKind: newBlock.blockKind.blockName,
                incrementalScore: incrementalScore,
                normedIncrementalScore: normedIncrementalScore,
                timeBlockSelected: timeBlockSelected,
                timeBlockPlaced: timeLastPlaced,
                relativePlacementTime: timeLastPlaced - trialObj.buildStartTime,
                blockNum: blocks.length,
                x_index: newBlock.x_index,
                y_index: newBlock.y_index,
                x_discrete: newBlock.x_index - 5,
                y_discrete: newBlock.y_index,
                width_discrete: newBlock.blockKind.w,
                height_discrete: newBlock.blockKind.h,
                incrementalNormedScoreDiscretePrevious: trialObj.incrementalNormedScoreDiscrete,
                discreteWorld: discreteWorld

            })
            //console.log(block_data);

            //console.log('block_data', block_data);
            socket.emit('currentData', block_data);
        }
        else if ((eventType == 'settled') && (blocks.length > 0)) {

            lastBlock = newBlock;

            // test out sending newBlock info to server/mongodb
            propertyList = Object.keys(lastBlock.body); // extract block properties;
            propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
            blockProperties = _.pick(lastBlock['body'], propertyList); // pick out all and only the block body properties in the property list

            // custom de-borkification
            vertices = _.map(lastBlock.body.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });

            last_block_data = {
                blockDimUnits: [lastBlock.blockKind.w, lastBlock.blockKind.h],
                blockWidth: lastBlock['w'],
                blockHeight: lastBlock['h'],
                blockCenterX: lastBlock['body']['position']['x'],
                blockCenterY: lastBlock['body']['position']['y'],
                blockVertices: vertices,
                blockBodyProperties: blockProperties,
                blockKind: lastBlock.blockKind.blockName,
                x_index: lastBlock.x_index,
                y_index: lastBlock.y_index,
                x_discrete: lastBlock.x_index - 5,
                y_discrete: lastBlock.y_index,
                incrementalNormedScoreDiscrete: trialObj.incrementalNormedScoreDiscrete,
                blockFell: trialObj.blockFell
            };


            //hacky solution to get current score from trial object
            //console.log('CurrScore: ' + trialObj.getCurrScore());
            //console.log('NormedScore: ' + trialObj.getNormedScore(trialObj.getCurrScore()));
            var incrementalScore = trialObj.getCurrScore()
            var normedIncrementalScore = trialObj.getNormedScore(trialObj.getCurrScore());
            // A world is, primarily, a list of blocks and locations
            // Get this list of blocks

            var bodiesForSending = blocks.map(block => {
                // test out sending newBlock info to server/mongodb
                propertyList = Object.keys(block.body); // extract block properties;
                propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
                propertyList = _.pullAll(propertyList, ['collisionFilter', 'constraintImpulse', 'density', 'force', 'friction', 'frictionAir', 'frictionStatic', 'isSensor', 'label', 'render', 'restitution', 'sleepCounter', 'sleepThreshold', 'slop', 'timeScale', 'type']);  // omit extraneus matter properties
                blockProperties = _.pick(block.body, propertyList); // pick out all and only the block body properties in the property list
                return blockProperties
            });

            var allVertices = blocks.map(block => {
                vertices = _.map(block.body.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });
                return vertices
            });

            world_data = _.extend({}, commonInfo, last_block_data, {
                dataType: 'settled',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                allBlockBodyProperties: bodiesForSending, // matter information about bodies of each block. Order is order of block placement
                allVertices: allVertices,
                numBlocks: bodiesForSending.length,
                incrementalScore: incrementalScore,
                normedIncrementalScore: normedIncrementalScore,
                timeBlockPlaced: timeLastPlaced,
                relativePlacementTime: timeLastPlaced - trialObj.buildStartTime,
                discreteWorld: discreteWorld
            });

            //console.log('world_data', world_data);
            socket.emit('currentData', world_data);
        }
        else if (eventType == 'reset') {
            // Event to show that reset has occurred
            // We can infer from the existence of this event that the world is empty

            // Do we calculate anything about the reset?
            reset_data = _.extend({}, commonInfo, {
                dataType: 'reset',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                numBlocks: blocks.length //number of blocks before reset pressed
            });

            //console.log('reset_data', reset_data);
            socket.emit('currentData', reset_data);

        } else if (eventType == 'practice_attempt' || eventType == 'trial_end') {

            // Data for all blocks
            var bodiesForSending = blocks.map(block => {
                // test out sending newBlock info to server/mongodb
                propertyList = Object.keys(block.body); // extract block properties;
                propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
                propertyList = _.pullAll(propertyList, ['collisionFilter', 'constraintImpulse', 'density', 'force', 'friction', 'frictionAir', 'frictionStatic', 'isSensor', 'label', 'render', 'restitution', 'sleepCounter', 'sleepThreshold', 'slop', 'timeScale', 'type']);  // omit extraneus matter properties
                blockProperties = _.pick(block.body, propertyList); // pick out all and only the block body properties in the property list
                return blockProperties
            });

            var allVertices = blocks.map(block => {
                vertices = _.map(block.body.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });
                return vertices
            });

            // Data for world
            world_data = _.extend({}, commonInfo, {
                dataType: 'world',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                allBlockBodyProperties: bodiesForSending, // matter information about bodies of each block. Order is order of block placement
                numBlocks: bodiesForSending.length,
                timeFinished: timeLastPlaced,
                buildTime: timeLastPlaced - trialObj.buildStartTime
            });

            if (eventType == 'practice_attempt') {
                // Summary data for 
                trial_end_data = _.extend({}, commonInfo, world_data, {
                    dataType: 'practice_attempt',
                    eventType: eventType, // initial block placement decision vs. final block resting position.
                    numBlocks: blocks.length, //number of blocks before reset pressed
                    completed: trialObj.completed,
                    F1Score: trialObj.F1Score, // raw score
                    normedScore: trialObj.normedScore,
                    currBonus: trialObj.currBonus,
                    score: trialObj.score,
                    success: trialObj.practiceSuccess,
                    nPracticeAttempts: trialObj.nPracticeAttempts,
                    practiceAttempt: trialObj.practiceAttempt,
                    allVertices: allVertices
                });
                //console.log('trial_end_data: ', trial_end_data);
                socket.emit('currentData', trial_end_data);

            } else if (eventType == 'trial_end') {
                // Summary data for 
                trial_end_data = _.extend({}, commonInfo, world_data, {
                    dataType: 'trial_end',
                    eventType: eventType, // initial block placement decision vs. final block resting position.
                    numBlocks: blocks.length, //number of blocks before reset pressed
                    buildStartTime: trialObj.buildStartTime,
                    buildFinishTime: trialObj.buildFinishTime,
                    timeToBuild: trialObj.timeToBuild,
                    endReason: trialObj.endReason,
                    completed: trialObj.completed,
                    F1Score: trialObj.F1Score, // raw score
                    normedScore: trialObj.normedScore,
                    currBonus: trialObj.currBonus,
                    timeBonus: trialObj.timeBonus,
                    score: trialObj.score,
                    buildResets: trialObj.buildResets,
                    nPracticeAttempts: trialObj.nPracticeAttempts,
                    doNothingRepeats: trialObj.doNothingRepeats,
                    bonusThresholdHigh: trialObj.bonusThresholdHigh,
                    bonusThresholdMid: trialObj.bonusThresholdMid,
                    bonusThresholdLow: trialObj.bonusThresholdLow,
                    allVertices: allVertices,
                    blockFell: trialObj.blockFell,
                    discreteWorld: discreteWorld
                });
                //console.log('trial_end_data: ', trial_end_data);
                socket.emit('currentData', trial_end_data);

            };
        };
    };

};

