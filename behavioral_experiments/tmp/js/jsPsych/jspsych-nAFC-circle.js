/**
 *
 * jspsych-nAFC-circle
 * Judy Fan
 *
 * displays a target image at center surrounded by several unique images
 * positioned equidistant from the target.
 * participant's goal is to click on the surround image that best matches the target.
 *
 *
 * requires Snap.svg library (snapsvg.io)
 *
 * documentation: docs.jspsych.org || TBD
 *
 **/

// socket = io.connect();

var start_time;
var score = 0;

jsPsych.plugins["nAFC-circle"] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'nAFC-circle',
    parameters: {
    }
  }

  plugin.trial = function(display_element, trial) {
    // screen information
    var screenw = $(display_element).width();
    var screenh = $(display_element).height();
    var centerx = screenw / 2;
    var centery = screenh / 2;

    // // initialize start_time timestamp
    // var start_time = Date.now();

    // grid params
    var num_cells = 6;
    var paper_size = trial.grid_size;
    var cell_size = Math.floor(trial.grid_size / num_cells);

    // stimuli width, height
    var stimh = trial.object_size[0];
    var stimw = trial.object_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;

    // sketch location
    var fix_loc = [Math.floor(paper_size / 2 - trial.sketch_size[0] / 4), Math.floor(paper_size / 2 - trial.sketch_size[1] / 4)];

    // possible stimulus locations on the circle
    var display_locs = [];

    function get_grid_coords(xrange,yrange) {
      var coords = [];
      for (var i = 0; i < xrange.length; i++) {
        for (var j = 0; j < yrange.length; j++) {
          coords.push([xrange[i],yrange[j]]);
        }
      }
      return coords;
    }

    function remove_one_coord(coords,excluded) {
      var tmp = [];
      for (var i = 0; i < coords.length; i++) {
        if (!(coords[i][0] == excluded[0] && coords[i][1] == excluded[1])) {
          tmp.push(coords[i]);
        }
      }
      return tmp;
    }

    // top left group
    xrange = _.map(_.range(0,cell_size*3,cell_size), function(x) {return x + hstimw});
    yrange = _.map(_.range(0,cell_size*3,cell_size), function(x) {return x + hstimw});
    excluded = [Math.max.apply(null,xrange),Math.max.apply(null,yrange)];
    coords = get_grid_coords(xrange,yrange);
    coordsTL = remove_one_coord(coords,excluded);

    // top right
    xrange = _.map(_.range(cell_size*3,cell_size*6,cell_size), function(x) {return x + hstimw});
    yrange = _.map(_.range(0,cell_size*3,cell_size), function(x) {return x + hstimw});
    excluded = [Math.min.apply(null,xrange),Math.max.apply(null,yrange)];
    coords = get_grid_coords(xrange,yrange);
    coordsTR = remove_one_coord(coords,excluded);

    // bottom left
    xrange = _.map(_.range(0,cell_size*3,cell_size), function(x) {return x + hstimw});
    yrange = _.map(_.range(cell_size*3,cell_size*6,cell_size), function(x) {return x + hstimw});
    excluded = [Math.max.apply(null,xrange),Math.min.apply(null,yrange)];
    coords = get_grid_coords(xrange,yrange);
    coordsBL = remove_one_coord(coords,excluded);

    // bottom right
    xrange = _.map(_.range(cell_size*3,cell_size*6,cell_size), function(x) {return x + hstimw});
    yrange = _.map(_.range(cell_size*3,cell_size*6,cell_size), function(x) {return x + hstimw});
    excluded = [Math.min.apply(null,xrange),Math.min.apply(null,yrange)];
    coords = get_grid_coords(xrange,yrange);
    coordsBR = remove_one_coord(coords,excluded);

    var display_locs = coordsTL.concat(coordsTR).concat(coordsBL).concat(coordsBR);

    // get target to draw on
    var upperBound = parseFloat(paper_size) + 50;
    var sideBound = parseFloat(paper_size) + 80;
    display_element.innerHTML = '<svg id="jspsych-nAFC-circle-svg" width=' + sideBound + ' height=' + upperBound + '></svg> ';
    display_element.innerHTML += '<div id="score"> <p> bonus points earned: ' + score + '</p></div>'
    var paper = Snap('#jspsych-nAFC-circle-svg');
    var element = document.getElementById("jspsych-nAFC-circle-svg");
    element.scrollIntoView(false);

    // wait
    setTimeout(function() {show_object_array(); }, trial.timing_objects);

    function show_sketch() {
      // show sketch
      var sketch = paper.image(trial.sketch, fix_loc[0], fix_loc[1], trial.sketch_size[0], trial.sketch_size[1]);
      start_time = Date.now();
    }

    function show_object_array() {
      var object_array_images = [];
    	img = new Array;
    	for (var i = 0; i < display_locs.length; i++) {
          var img = paper.image(trial.options[i], display_locs[i][0], display_locs[i][1],
				trial.object_size[0], trial.object_size[1]);
        object_array_images.push(img);
      }
      var trial_over = false;

      // group object images and add hover animation
      images = paper.g(paper.selectAll('image'));
      images.selectAll('image').forEach( function( el, index ) {
         el.hover( function() { el.animate({ transform: 's1.5,1.5' }, 100, mina.easein); },
                   function() { el.animate({ transform: 's1,1' }, 100 , mina.easein); }
          )
      } );

      // add click listener to the objects
      var a = document.getElementsByTagName('g')[0];
      imgs = a.children;

      for (var i = 0; i < display_locs.length; i++) {
        imgs[i].addEventListener('click', function (e) {
          var choice = e.currentTarget.getAttribute('href'); // don't use dataset for jsdom compatibility
          after_response(choice);
         })
      }

      var after_response = function(choice) {
        trial_over = true;
        // measure rt
        var end_time = Date.now();
        var rt = end_time - start_time;
        bare_choice = choice.split('/')[2].split('.')[0];
        // console.log('choice',bare_choice);
        // console.log('target',trial.target);
        var correct = 0;
        if (bare_choice == trial.target) {
          correct = 1;
          score += 1;
          // update hidden scoreboard
          $('#score').html(score);
        }
        clear_display();
        end_trial(rt, correct, choice);
      }

      function clear_display() {
        paper.clear();
      }

      // wait
      setTimeout(function() {
        // after wait is over
        show_sketch();
      }, trial.timing_sketch);

    }

    function end_trial(rt, correct, choice) {

      var turkInfo = jsPsych.turk.turkInfo();
      // workerID
      var wID = turkInfo.workerId;
      // hitID
      var hitID = turkInfo.hitId;
      // assignmentID
      var aID = turkInfo.assignmentId;

      // data saving
      var current_data = {
        dbname: '3dObjects',
        colname: 'sketchpad_basic_recog',
        iterationName: trial.iterationName,
        trialNum: trial.trialNum,
        rt: rt,
        correct: correct,
        score: score,
        choice: choice.split('/')[2].split('.')[0],
        locations: JSON.stringify(display_locs),
        sketch: trial.sketch,
	      sketchID: trial.sketchID,
        target: trial.target,
        category: trial.category,
        distractor1: trial.distractor1,
        distractor2: trial.distractor2,
        distractor3: trial.distractor3,
        context: trial.context,
        draw_duration: trial.draw_duration,
        num_strokes: trial.num_strokes,
        viewer_correct_in_context: trial.viewer_correct_in_context,
        viewer_response_in_context: trial.viewer_response_in_context,
        viewer_RT_in_context: trial.viewer_RT_in_context,
        gameID: trial.gameID,
        original_gameID: trial.original_gameID,
        original_trialNum: trial.original_trialNum,
        wID: wID,
        hitID: hitID,
        aID: aID,
        object_size: trial.object_size,
        sketch_size: trial.sketch_size,
        grid_size: trial.grid_size
      };

      console.log(current_data);

      jsPsych.finishTrial(current_data);
      // Pause until data from next round is obtained
      jsPsych.pauseExperiment();
    }
  };



  // helper function for determining stimulus locations

  function cosd(num) {
    return Math.cos(num / 180 * Math.PI);
  }

  function sind(num) {
    return Math.sin(num / 180 * Math.PI);
  }

  return plugin;
})();
