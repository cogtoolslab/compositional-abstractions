var config = require('./display_config.js');
var Matter = require('./matter.js');

// Wrapper for Bodies.rectangle class to create boundaries/ walls. 
// Also includes a show function which draws the box using P5.
class Boundary {

  constructor(x, y, w, h){
    var options = {
      isStatic: true, // static i.e. not affected by gravity
      friction: 0.9,
      frictionStatic: 2
    };
    
    this.w = w;
    this.h = h;

    this.body = Matter.Bodies.rectangle(
      x * config.worldScale,
      y * config.worldScale,
      w * config.worldScale,
      h * config.worldScale,
      options
    );
  }
  
  // Display the boundary on the screen
  show (env) {
    var pos = this.body.position;
    var angle = this.body.angle;

    env.push();
    env.translate(pos.x / config.worldScale, pos.y / config.worldScale);
    env.rectMode(env.CENTER);
    env.rotate(angle);
    env.stroke(220);
    env.strokeWeight(2);
    env.fill(config.floorColor);
    env.rect(0, 0, this.w, this.h);
    env.pop();
  };
}

module.exports = Boundary;
