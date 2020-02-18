var config = require('./display_config.js');
var Matter = require('./matter.js');

// Wrappers for Matter Bodies that instantiate a particular BlockKind
class Block {
  constructor(engine, blockKind, x, y, rotated,
              testing_placement = false, x_index = null,  y_index = null) {

    this.engine = engine;
    this.blockKind = blockKind;
    this.x_index = x_index;
    this.y_index = y_index;
    this.color = this.blockKind.blockColor;

    if (rotated) {
        this.w = blockKind.h * config.sF;
        this.h = blockKind.w * config.sF;
    } else {
        this.w = blockKind.w * config.sF;
        this.h = blockKind.h * config.sF;
    }

    //var options = blockKind.options;

    var options = {
        friction: 0.9,
        frictionStatic: 1.4,
        density: 0.0035,
        restitution: 0.0015,
        sleepThreshold: 30
    }
    if (!testing_placement) {
      this.originalX = x * config.worldScale;
      this.originalY = y * config.worldScale;
      
      this.body = Matter.Bodies.rectangle(this.originalX, this.originalY,
                                          this.w * config.worldScale,
                                          this.h * config.worldScale, options);
      Matter.World.add(this.engine.world, this.body);
    } else {
      this.test_body = Matter.Bodies.rectangle(
        x * this.worldScale, 
        y * this.worldScale,
        this.w * this.worldScale * 0.85,
        this.h * this.worldScale * 0.85
      );
      this.test_body.collisionFilter.category = 3;
    }
  }
  
  // Display the block
  show (env) {
    var pos = this.body.position;
    var angle = this.body.angle;

    env.push(); //saves the current drawing style settings and transformations
    env.rectMode(env.CENTER);
    env.translate(pos.x / config.worldScale, pos.y / config.worldScale);
    env.rotate(angle);
    env.stroke([28,54,62]);
    env.strokeWeight(2);
    env.fill(this.color);
    // if(this.body.isSleeping) {
    //     env.fill();
    // }

    if (!config.chocolateBlocks) {
      env.rect(0, 0, this.w, this.h);
    }
    else {
      this.blockKind.drawChocolateBlocks(env);
    }
    env.pop();

  }

  snapBodyToGrid () {
    // snaps matter locations of block bodies to grid
    // to be called after all blocks are sleeping?  
    var currentX = this.body.position.x / config.worldScale;
    var currentY = this.body.position.y / config.worldScale;
    var snappedX;
    var snappedY = currentY;
    if (((this.blockKind.w % 2 == 1) && (Math.abs(this.body.angle) % (Math.PI / 2) < Math.PI / 4)) ||
        ((this.blockKind.h % 2 == 1) && (Math.abs(this.body.angle) % (Math.PI / 2) > Math.PI / 4))) {
      snappedX = ((currentX + config.stim_scale / 2) % (config.stim_scale) < (config.stim_scale / 2) ?
                  currentX - (currentX % (config.stim_scale / 2)) :
                  currentX - (currentX % (config.stim_scale)) + (config.stim_scale / 2));
    } else {
      snappedX = (currentX % (config.stim_scale) < (config.stim_scale / 2) ?
                  currentX - currentX % (config.stim_scale) :
                  currentX - currentX % (config.stim_scale) + config.stim_scale);
    }
    var snapped_location = Matter.Vector.create(snappedX * config.worldScale, snappedY * config.worldScale);
    Matter.Body.setPosition(this.body, snapped_location);
  }

  can_be_placed () {
    console.log(this);
    var colliding_bodies = Matter.Query.region(this.engine.world.bodies, this.test_body.bounds);
    return (colliding_bodies === undefined || colliding_bodies.length == 0)
  }

  checkMotion () {
    var xMove = Math.abs(this.body.position.x - this.originalX) > 10;
    var yMove = Math.abs(this.body.position.y - this.originalY) > 10;
    var rotated = Math.abs(this.body.angle) > 0.70

    return (xMove || yMove || rotated)
  }

}

module.exports = Block;
