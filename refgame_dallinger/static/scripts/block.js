// Wrappers for Matter Bodies that instantiate a particular BlockKind
function Block(blockKind, x, y, rotated, testing_placement = false){

    if(rotated){
        this.w = blockKind.h * sF;
        this.h = blockKind.w * sF;
    }else{
        this.w = blockKind.w * sF;
        this.h = blockKind.h * sF;
    }

    //var options = blockKind.options;

    var options = {
        friction: 0.8,
        frictionStatic: 1.4,
        //frictionAir: 0.07,
        //slop: 0.1,
        density: 0.0025,
        restitution: 0.001,
        sleepThreshold: 80
    }
    if(!testing_placement){
        this.body = Bodies.rectangle(x*worldScale,y*worldScale,this.w*worldScale,this.h*worldScale, options);
        World.add(engine.world, this.body); 
    }
    else{
        this.test_body = Bodies.rectangle(x*worldScale,y*worldScale,this.w*worldScale,this.h*worldScale);
        this.test_body.collisionFilter.category = 3;

    }
        

    // Display the block (maybe separate out view functions later?)
    this.show = function(env) {

        var pos = this.body.position;
        var angle = this.body.angle;

        env.push(); //saves the current drawing style settings and transformations
        env.translate(pos.x/worldScale, pos.y/worldScale);
        env.rectMode(env.CENTER);
        env.rotate(angle);
        env.stroke(30);
        env.fill(30);
        if(this.body.isSleeping) {
            //env.fill(100);
        }
        env.rect(0,0,this.w,this.h);

        env.pop();
        

    }

    this.can_be_placed = function(){
        colliding_bodies = Matter.Query.region(engine.world.bodies, this.test_body.bounds );
        return (colliding_bodies === undefined || colliding_bodies.length == 0)
    }

}

