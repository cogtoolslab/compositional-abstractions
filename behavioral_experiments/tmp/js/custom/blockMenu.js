class BlockMenu {

    constructor(h, blockKinds){
        this.h = h;
        this.blockKinds = blockKinds;
    }

    // Adds a type of block to the menu
    addBlockKinds(newBlockKinds) {
        newBlockKinds.forEach(bK => {
            blockKinds.push(bK);    
        });
        
    }
    
    hasClickedButton(mouseX, mouseY, selectedBlockKind){
        for (let i = 0; i < blockKinds.length; i++) {
            // has click hit the block item?
            const blockX = blockKinds[i].x;
            const blockY = blockKinds[i].y;
            if (mouseX >= blockX - blockKinds[i].w*sF/2 && mouseX <= blockX + blockKinds[i].w*sF/2
                && mouseY >= blockY - blockKinds[i].h*sF/2 && mouseY <= blockY + blockKinds[i].h*sF/2
                ){
                //console.log(blockKinds[i])
                return blockKinds[i];
            }
                
        }
        return selectedBlockKind;

    }

    // Display menu
    show(env) {

        env.push();
        env.rectMode(env.CORNER);
        env.stroke([28,54,62,100]);
        env.fill([236,232,226]);
        env.rect(0,canvasHeight-this.h,canvasWidth,this.h);
        
        var i;
        for (i = 0; i < blockKinds.length; i++) { 
            blockKinds[i].showMenuItem(env,((i+1)*(menuWidth/(blockKinds.length+1)))+blockKinds[i].w*sF/2.2 - worldWidth*sF/5,canvasHeight - menuHeight/2);
        } 
        env.pop();

    }



}