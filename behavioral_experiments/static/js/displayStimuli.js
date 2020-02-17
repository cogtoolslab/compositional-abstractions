var worldHeight = 8;
var worldWidth = 8;

function showStimulus(env, stimulus, individual_blocks = false, blockColor = [28,54,220,50]){
    Array.prototype.forEach.call(stimulus, block => {
        showBlock(env, block, individual_blocks = individual_blocks, blockColor = blockColor)
    });
}

function showBlock(env, block, individual_blocks = false, blockColor = [28,54,62]){
    width = block.width;
    height = block.height;
    x_left = block.x - worldWidth/2;
    x_center = x_left + block.width/2;
    y_bottom = worldHeight - block.y - worldHeight/2;
    y_center =  y_bottom - block.height/2;
    
    y_top = y_bottom - height;

    env.push(); //saves the current drawing style settings and transformations
    env.translate(stimX + stim_scale*x_center, (canvasHeight - floorHeight) - (canvasHeight - floorY) + stim_scale*y_center - 26);
    env.rectMode(env.CENTER);
    //env.noStroke();
    env.stroke(blockColor);
    env.fill(blockColor);
    if (individual_blocks) {
        env.strokeWeight(2);
        env.stroke([201,201,201]);
        env.fill(blockColor);
    }
    env.rect(0,0,stim_scale*width,stim_scale*height);
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
        grid_x[i] = stim_scale*i + canvasWidth/2 - stim_scale/2;
        i = i+1;
    }  

    j = grid_bottom;
    while(j < grid_top) {
        grid_y[j] =  (canvasHeight - floorHeight) - (stim_scale*j) + stim_scale/2 - 6;
        j = j+1;
    } 

    return [grid_x,grid_y]
    
}

function showGrid(env){

    grid_x = grid[0];
    grid_y = grid[1];

    squareWidth = stim_scale;
    squareHeight = stim_scale;

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
function showFloor(p5stim){

    floorX = canvasWidth/2, 
    floorY = (canvasWidth - menuHeight)*1.15, 
    floorWidth = canvasWidth*1.5
    floorHeight = canvasHeight/3
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
    p5stim.strokeWeight(1)
    p5stim.line(canvasWidth/2,canvasHeight-floorHeight+10,canvasWidth/2,canvasHeight-floorHeight+35);
    p5stim.pop();
}