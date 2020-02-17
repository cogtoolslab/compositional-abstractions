// BlockKinds are a type of block- of which several might be placed in the environment. To be concretely instantiated, a Block must be created that inherets its properties from a BlockKind
// BlockKind also holds the information for displaying the menu item associated with that blockKind.
function BlockKind(w,h,blockColor, blockName = ''){
    // BlockKind width and height should be given in small integers. They are scaled in the block class.
    this.w = w;
    this.h = h;
    this.blockColor = blockColor;
    this.blockName = blockName;
    
    var x;
    var y;

    // removed: options variable- add in later when we need different properties with different block kinds

    // show block scaled according to given ratio, in a given location
    this.showMenuItem = function(env,x,y) {

        this.x = x;
        this.y = y;
        env.push();
        env.rectMode(env.CENTER);
        env.fill(this.blockColor);
        env.stroke([60,90,110]);
        env.strokeWeight(2);
        env.translate(x,y);
        env.rect(0,0,this.w*sF,this.h*sF);
        if (chocolateBlocks) {
            this.drawChocolateBlocks(env);
        }
        env.pop();

    }

    this.drawChocolateBlocks = function(env) {
        // draws unit squares on each block
        nRow = this.w;
        nCol = this.h;
        i = -nRow/2 + 0.5;
        while (i < nRow/2) {
            j = -nCol/2 + 0.5;
            while (j < nCol/2) { // draw one square
                env.translate(sF*i, sF*j);
                env.rect(0, 0, sF, sF);
                env.translate(-sF*i, -sF*j);
                j++;
            }
            i++;
        }
    }


    this.showGhost = function(env, mouseX, mouseY, rotated, disabledBlockPlacement = false, snapToGrid = true) {

            if((mouseX > (sF*(this.w/2))) && (mouseX < canvasWidth-(sF*(this.w/2)))){

            if(snapToGrid){
                if (this.w%2 == 1) {
                    snappedX = (mouseX+stim_scale/2)%(stim_scale) < (stim_scale/2) ? mouseX - (mouseX%(stim_scale/2)) : mouseX - (mouseX%(stim_scale)) + (stim_scale/2);
                    x_index = snappedX/stim_scale - snappedX%stim_scale + 7 + 5;
                } else {
                    snappedX = mouseX%(stim_scale) < (stim_scale/2) ? mouseX - mouseX%(stim_scale) : mouseX - mouseX%(stim_scale) + stim_scale;
                    x_index = snappedX/stim_scale - snappedX%stim_scale - selectedBlockKind.w/2 - 5 + 5;
                };

                mouseX = snappedX

                var y = Math.round(13 - (this.h/2) - ((mouseY+(stim_scale/2))/stim_scale)) + 2;
                var rowFree = true;
                while (rowFree && y>=0) {
                    y-=1;
                    var blockEnd = x_index+selectedBlockKind.w
                    for (let x = x_index; x < blockEnd; x++) { // check if row directly beneath block are all free at height y
                        //console.log('checking:', y, x)
                        rowFree = rowFree && discreteWorld[x][y];
                    }

                }
                y_index = y+1;
                //console.log('y_index',y_index);
                
                // ADD SNAP TO Y
                snappedY = (canvasHeight - floorHeight) - (stim_scale*(selectedBlockKind.h/2)) - (stim_scale*(y_index)) + stim_scale/2 + 6;

                mouseY = snappedY;
            }

            env.push();
            env.translate(mouseX, mouseY);
            env.rectMode(env.CENTER);
            env.stroke([200,200,255]);
            //env.stroke([28,54,62,100]);
            env.strokeWeight(2);
            //fillColor = disabledBlockPlacement ? [100, 100, 100, 100] : [...this.blockColor];
            //fillColor[3] = 130;
            fillColor = env.color([28,54,220]);
            fillColor.setAlpha(50);
            env.fill(fillColor);
            if(rotated){
                env.rect(0,0,this.h*sF,this.w*sF);
            } else {
                env.rect(0,0,this.w*sF,this.h*sF);
            }
            if (chocolateBlocks) {
                this.drawChocolateBlocks(env);
            }
            env.pop();
        }

    }

}