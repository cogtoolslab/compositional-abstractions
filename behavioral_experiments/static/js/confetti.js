// Rain down confetti
class Confetti {
  constructor(count) {
    this.count = count;
  }

  pickColor(index) {
    return (index == 1 ? '#faa040' : // yellow
	    index == 2 ? '#e94a3f' : // blue
	    "#e94a3f");              // red 
  }

  // Initialize confetti particle
  create(i) {
    var width = Math.random() * 8;
    var height = width * 0.4;
    var colourIdx = Math.ceil(Math.random() * 3);
    var colour = this.pickColor(colourIdx);
    $(`<div style="position:fixed" id=confetti-${i} class="confetti"></div>`).css({
      "width" : width+"px",
      "height" : height+"px",
      "top" : -Math.random()*20+"%",
      "left" : Math.random()*100+"%",
      "opacity" : Math.random()+0.5,
      "background-color": colour,
      "transform" : "rotate("+Math.random()*360+"deg)"
    }).appendTo('#header');  
  }

  //Dropp all confetti
  drop() {
    for(var i = 0; i < this.count; i++) {
      this.create(i);
      $('#confetti-' + i).animate({
	top: "100%",
	left: "+="+Math.random()*15+"%"
      }, {
	duration: Math.random()*3000 + 3000
      });
    };
  }

  reset() {
    for(var i = 0; i < this.count; i++) {
      $('#confetti-' + i).remove();
    }
  }
}

module.exports = Confetti;
