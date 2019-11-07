var worldHeight = 8;
var worldWidth = 8;

function showStimulus(p5stim,stimulus){
    Array.prototype.forEach.call(stimulus, block => {
        showBlock(p5stim, block)
    });
}

function showBlock(p5stim, block){
    width = block.width;
    height = block.height;
    x_left = block.x - worldWidth/2;
    x_center = x_left + block.width/2;
    y_bottom = worldHeight - block.y - worldHeight/2;
    y_center =  y_bottom - block.height/2;
    
    y_top = y_bottom - height;

    p5stim.push(); //saves the current drawing style settings and transformations
    p5stim.translate(stimX + stim_scale*x_center, (canvasY - menuHeight)*1.15 - (canvasY/3) + stim_scale*y_center + 6);
    p5stim.rectMode(p5stim.CENTER);
    p5stim.stroke(20)
    p5stim.fill(20);
    p5stim.rect(0,0,stim_scale*width,stim_scale*height);
    p5stim.pop();
    
}

//still to do!
function showFloor(p5stim){

    floorX = canvasX/2, 
    floorY = (canvasX - menuHeight)*1.15, 
    floorWidth = canvasX*1.5
    floorHeight = canvasY/3
    p5stim.push();
    p5stim.translate(floorX, floorY);
    p5stim.rectMode(p5stim.CENTER);
    p5stim.stroke(200);
    p5stim.fill(20);
    p5stim.rect(0,0,floorWidth,floorHeight);
    p5stim.pop();
}