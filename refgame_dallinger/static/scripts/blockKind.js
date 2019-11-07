// BlockKinds are a type of block- of which several might be placed in the environment. To be concretely instantiated, a Block must be created that inherets its properties from a BlockKind
// BlockKind also holds the information for displaying the menu item associated with that blockKind.
function BlockKind(w,h,blockColor){
    // BlockKind width and height should be given in small integers. They are scaled in the block class.
    this.w = w;
    this.h = h;
    this.color = blockColor;
    
    var x;
    var y;

    // removed: options variable- add in later when we need different properties with different block kinds

    // show block scaled according to given ratio, in a given location
    this.showMenuItem = function(env,x,y) {

        this.x = x;
        this.y = y;
        env.push();
        env.rectMode(env.CENTER);
        env.fill(this.color);
        env.rect(x,y,this.w*sF,this.h*sF)
        env.pop();

    }

    this.showGhost = function(env, mouseX, mouseY, rotated) {

        // update to include scrolling to rotate? https://p5js.org/reference/#/p5/mouseWheel
        env.push();
        env.translate(mouseX, mouseY);
        env.rectMode(env.CENTER);
        env.stroke(200);
        env.fill(blockColor);
        if(rotated){
            env.rect(0,0,this.h*sF,this.w*sF);
        } else {
            env.rect(0,0,this.w*sF,this.h*sF);
        }
        env.pop();

    }

}