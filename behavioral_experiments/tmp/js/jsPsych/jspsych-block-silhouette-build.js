/**
 * jspsych-block-silhouette
 * 
 * Plugin for presenting a silhouette and prompting participants to reconstruct it from a set of blocks
 * Previous version of this experiment had preparation and build phases-
 * This is only the 'build' phase- i.e. there is no preparation beforehand
 * 
 * Plugin will not work without supporting js files, and correctly configured app.js and setup.js files running on node
 *
 * documentation: docs.jspsych.org
 *
 * created by Will McCarthy (wmccarth@ucsd.edu) & Judy Fan (jefan@ucsd.edu) Oct 2019
 * 
 **/

// Task performance
var deltaScore = 0; // diff in score btw end and start of phase
var nullScore = 0; // reconstruction score for blank reconstruction
var normedScore = 0; // reconstruction score for blank reconstruction
var scoreGap = 0; // difference between nullScore and perfect score (F1 = 1)
var rawScore = 0; // raw F1 score after phase end

var nullScoreDiscrete = 0; // reconstruction score for blank reconstruction
var normedScoreDiscrete = 0; // reconstruction score for blank reconstruction
var scoreGapDiscrete = 0; // difference between nullScore and perfect score (F1 = 1)
var rawScoreDiscrete = 0;

var currBonus = 0; // current bonus increment 
var timeBonus = 0; // current bonus increment 
var cumulBonus = 0; // cumulative bonus earned in experiment
var points = 0;


// Metadata
var gameID = 'GAMEID_PLACEHOLDER';
var version = 'VERSION_PLACEHOLDER';

jsPsych.plugins["block-silhouette-build"] = (function () {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('block-silhouette-build', 'stimulus', 'image');

  plugin.info = {
    name: 'block-silhouette-build',
    description: '',
    parameters: {
      targetBlocks: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Block Collection (JSON String)',
        default: undefined,
        description: 'list of blocks comprising target structure'
      },
      targetName: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Block Collection (JSON String)',
        default: undefined,
        description: 'nickname for target structure'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function (display_element, trial) {

    // Make target a stonehenge
    //trial.targetBlocks = [{"x": 1, "y": 0, "width": 2, "height": 4}, {"x": 5, "y": 0, "width": 2, "height": 4}, {"x": 2, "y": 4, "width": 4, "height": 2}];

    trial.score = score;
    trial.points = points;
    var timers = [];
    trial.pMessingAround = 0;

    if (typeof trial.targetBlocks === 'undefined') {
      console.error('Required parameter "target" missing in block-silhouette');
    }

    trial.targetMap = makeTargetMap(trial.targetBlocks);

    // wrapper function to show everything, call this when you've waited what you
    // reckon is long enough for the data to come back from the db
    function show_display() {


      // ***************** SETUP *****************
      // *****************************************
      
      var html = '';
      
      html += '<div class="container pt-1" id="experiment">'
      html += '<div class="row" id="text-bar">'
      html += `<div class="col-md-auto"><p class="scores">Points: <span id="points-meter">${points}</span> </p></div>`
      html += `<div class="col-md-auto"><p class="scores">Bonus:<span id="bonus-meter">${cumulBonus >= 1 ? '$' + String(cumulBonus.toFixed(3)) : String((cumulBonus*100).toFixed(1)) + '¢'}</span> </p></div>`
      html += '<div class="col"><p id="condition-heading">Build that tower!</p></div>'
      html += '<div class="col-md-auto"><p id="timer-text">00:00</p></div>'
      html += '</div>'
      html += '<div class="row pt-1">'
      html += '<div class="col-md env-div" id="stimulus-window">'
      html += '</div>'
      html += '<div class="col-md env-div pl-2" id="environment-window">'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="experiment-button-col">'
      html += '<div class="col-auto mr-auto" id="zoom-message"><p>If silhouette window is above building window, please adjust zoom until they are side by side.</p></div>'
      html += '<div class="col-auto ml-auto button-col" id="env-buttons">'
      html += '<button type="button" class="btn btn-success btn-lg" id="done" value="done">Done</button>'
      html += '<button type="button" class="btn btn-danger btn-lg" id="reset" value="reset">Reset</button>'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="trial-info">'
      html += '<div class="col align-text-center" id="trial-number">'
      html += '</div>'
      html += '</div>'
      html += '</div>'
      if (trial.condition != 'practice') {
        html += '<div id="trial-counter"> <p> Trial ' + (parseInt(trial.trialNum) + parseInt(1)).toString() + ' of ' + trial.num_trials + '</p></div>'
      }

      // introduce occluder to make the inter-trial transitions less jarring
      html += '<div class="occluder" id="occluder">'
      html += '<div><p id="occluder-text"></p><br><p id="occluder-timer-text"></p></div>'
      html += '</div>'

      // actually assign html to display_element.innerHTML
      display_element.innerHTML = html;

    }

    var build_text = 'Now build the tower! Click anywhere to begin.';
    var practice_feedback_text = {
      'success': 'Success! Now onto the real experiment. Please wait.',
      'failure': 'Nice try! But your tower was not quite a close enough match. Please click anywhere to try again.'
    }
    var practice_text = 'Click anywhere to begin.';

    // call show_display now, which includes a massive occluder that covers everything up
    show_display();

    // get html elements
    var done_button = document.getElementById("done");
    var reset_button = document.getElementById("reset");
    var occluder = document.getElementById("occluder");
    var occluder_text = document.getElementById("occluder-text");
    var condition_heading = document.getElementById("condition-heading");
    var timer_text = document.getElementById("timer-text");
    var occluder_timer_text = document.getElementById("occluder-timer-text");
    var env_divs = document.getElementsByClassName("col-md env-div");
    var zoom_message = document.getElementById("zoom-message");

    zoom_message.style.display = "none";
    var progressBar = $('#progress-bar');
    occluder.setAttribute('style', 'white-space: pre;');

    // update these global metadata vars with actual values for this trial  
    gameID = trial.gameID;
    version = trial.version;

    occluder.style.display = "block";
    occluder_timer_text.style.display = "none";


    // **************** SCORING ****************
    // *****************************************

    function getCurrScore() {
      // call this to get: 
      // (1) F1 score for target vs. blank at beginning of each phase
      // (2) F1 score for target vs. blank at end of each phase
      current_score_to_return = getScore('defaultCanvas0', 'defaultCanvas1', 0.75, 64);
      return current_score_to_return;
    }

    function getNormedScore(rawScore, nullScore, scoreGap) {
      // compute relative change in score
      deltaScore = math.subtract(rawScore, nullScore);
      normedScore = math.divide(deltaScore, scoreGap);
      // console.log('scoreGap = ', scoreGap.toFixed(2));
      // console.log('deltaScore = ', deltaScore.toFixed(2));
      // console.log('normedScore = ', normedScore.toFixed(2));
      return normedScore;
    }

    function convertNormedScoreToBonus(normedScore) {
      if (normedScore > trial.bonusThresholdHigh) { bonus = trial.bonusHigh; }
      else if (normedScore > trial.bonusThresholdMid) { bonus = trial.bonusMid; }
      else if (normedScore > trial.bonusThresholdLow) { bonus = trial.bonusLow; }
      else { bonus = 0; }
      return bonus;
    }

    function getBonusEarned(rawScore, nullScore, scoreGap) {
      normedScore = getNormedScore(rawScore, nullScore, scoreGap);
      bonus = convertNormedScoreToBonus(normedScore);
      return bonus;
    }

    function getTimeBonus(timeToBuild) {
      if (build_duration * 1000 - timeToBuild > trial.timeThresholdYellow) { timeBonus = trial.timeBonusHigh;}
      else if (build_duration * 1000 - timeToBuild > trial.timeThresholdRed) { timeBonus = trial.timeBonusLow;}
      else { timeBonus = 0; }
      return timeBonus;
    }

    function updateTrialScores(trial) {
      // update official bonus tallies
      trial.F1Score = rawScore;
      trial.endReason = endReason;
      trial.normedScore = normedScore;
     
      trial.rawScoreDiscrete = normedScoreDiscrete;
      trial.scoreGapDiscrete = scoreGapDiscrete;
      trial.normedScoreDiscrete = normedScore;

      trial.score = cumulBonus; // update trial.score var to reflect cumulative bonustrial.nullScore = nullScore;
      trial.points = points;

      //sendData('settled', trial);
    }

    // hacky solution to obtaining scores at every block-settle event
    trial.getCurrScore = getCurrScore;
    trial.getNormedScore = (rawScore) => getNormedScore(rawScore, nullScore, scoreGap);



    function getCurrScoreDiscrete() {
      // call this to get: 
      // (1) F1 score for target vs. blank at beginning of each phase
      // (2) F1 score for target vs. blank at end of each phase
      current_score_to_return = getScoreDiscrete(trial.targetMap, discreteWorld);
      return current_score_to_return;
    }

    trial.getNormedScoreDiscrete = function(rawScoreDiscrete, nullScoreDiscrete, scoreGapDiscrete) {
      // compute relative change in score
      deltaScoreDiscrete = math.subtract(rawScoreDiscrete, nullScoreDiscrete);
      normedScoreDiscrete = math.divide(deltaScoreDiscrete, scoreGapDiscrete);
      // console.log('scoreGap = ', scoreGap.toFixed(2));
      // console.log('deltaScore = ', deltaScore.toFixed(2));
      // console.log('normedScore = ', normedScore.toFixed(2));
      return normedScoreDiscrete;
    }


    // ********* TIMERS, EVENT HANDLERS ********
    // *****************************************

    // start timing
    var start_time = Date.now();
    var time_bonus = 0;

    var seconds_passed = 0;

    function timer(time_left, callback = null) {

      var interval = setInterval(function () {
        // happens every second
        seconds_passed += 1;

        time_left -= 1;
        minutes = parseInt(time_left / 60, 10);
        seconds = parseInt(time_left % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        timer_text.textContent = minutes + ':' + seconds;
        occluder_timer_text.textContent = minutes + ':' + seconds;


        if (seconds < trial.timeThresholdRed / 1000) { timer_text.style.color = '#e60000'; }
        else if (seconds < trial.timeThresholdYellow / 1000) { timer_text.style.color = '#ffd633'; }


        if (time_left == 0) { // should happen once per timer
          clearInterval(interval)
          callback();
        }
      }, 1000);
      timers.push(interval);
    }

    function resetPressed() {
      /* Called to clear building environment window. 
      Works by resetting variables then building a new p5 instance.
      */
      //trial.buildResets += 1;
      //sendData('reset', trial);
      clearP5Envs();
      trial.blockFell = false;
      setupEnvs(trial);

    }

    function endPractice() {
      trial.completed = true;
      trial.endTrial(endReason = 'practice_success');
      occluder.removeEventListener('click', endPractice);
    } 

    function donePressed() {

      //scoring = true; //set global variable in ExperimentEnvironment to remove stim

      sleeping = blocks.filter((block) => block.body.isSleeping);
      allSleeping = sleeping.length == blocks.length;

      if (allSleeping) { // Only do something if world in resting state

        if (blocks.length > 0) {
          sendData(eventType = 'settled', trial);
        }

        if (trial.condition == 'practice') {

          // pixel-scores
          rawScore = getCurrScore();
          normedScore = getNormedScore(rawScore, nullScore, scoreGap);

          // discrete-scores
          rawScoreDiscrete = getScoreDiscrete(trial.targetMap, discreteWorld);
          normedScoreDiscrete = trial.getNormedScoreDiscrete(rawScoreDiscrete, trial.nullScoreDiscrete, trial.scoreGapDiscrete);
          
          trial.nPracticeAttempts += 1;
          trial.buildFinishTime = Date.now();
          sendData(eventType = 'trial_end', trial);
          trial.practiceAttempt += 1;

          // if-statements to be added here. Plus something that prevents multiple failures.
          if(normedScoreDiscrete >= trial.practiceThreshold) { // discrete score
          //if (normedScore >= trial.practiceThreshold) { //pixel-score
            // if practice score is good:
            // move on
            trial.practiceSuccess = true;
            sendData('practice_attempt', trial);
            occluder_text.textContent = practice_feedback_text['success'];
            zoom_message.style.display = "none";
            occluder.addEventListener('click', endPractice);

          } else {
            // if practice score is bad:
            // show occluder
            trial.nPracticeAttempts += 1;
            occluder_text.textContent = practice_feedback_text['failure'];
            occluder.addEventListener('click', resumePractice);

            trial.practiceSuccess = false;
            sendData('practice_attempt', trial);
            clearP5Envs();
            setupEnvs(trial);
          };
          occluder.style.display = "block";
        }/*
        else { // if a normal trial, must be build phase
          if (blocks.length > 3) { //make sure they've actually built something
            trial.completed = true;
            endTrial(endReason = 'done-pressed');
            occluder_text.textContent += `Please wait for the next trial.`
            // uncomment to allow donePressed to move on to the next trial immediately
            jsPsych.pluginAPI.setTimeout(function () {
              clear_display_move_on();
            }, 2500);
          }
          else {
            condition_heading.textContent = "Please build the structure!"
            jsPsych.pluginAPI.setTimeout(function () {
              condition_heading.textContent = "BUILD"
            }, 2500);
          };
        };*/
      } else { // If not all blocks are stationary, then make participant wait.
        done_button.textContent = 'Wait';
        setInterval(function () {
          sleeping = blocks.filter((block) => block.body.isSleeping);
          allSleeping = sleeping.length == blocks.length;
          if (allSleeping) {
            done_button.textContent = 'Done';
          }
        }, 500);
      }

    }

    // *********** CLEAN UP FUNCTIONS ********** 
    // *****************************************
    
    function clearP5Envs() {
      // Removes P5 environments to start new experiment phase or trial
      removeEnv();
      removeStimWindow();
    }

    trial.endTrial = function(endReason = 'end_of_phase') {
      console.log('end');
      console.log(endReason);

      occluder_timer_text.textContent = '';

      // // update official bonus tallies
      // trial.F1Score = rawScore;
      // trial.endReason = endReason;
      // trial.normedScore = normedScore;
      // trial.currBonus = currBonus; // update trial var to reflect current bonus earned
      // trial.score = cumulBonus; // update trial.score var to reflect cumulative bonustrial.nullScore = nullScore;
      // trial.points = points;
      // sendData('settled', trial);

      if ((blocks.length < 2) && (endReason == 'timeout')) {

        clearP5Envs();
        trial.doNothingRepeats += 1;
        p5stim, p5env = setupEnvs(trial);
        occluder_text.textContent = 'It looks like you gave up with that one... \r\nPlease try your best to build every structure, even if you mess up. \r\nClick to repeat trial ' + (parseInt(trial.trialNum) + parseInt(1)).toString();
        occluder.style.display = "block";
        timer_text.style.color = '#00b300'; 
        occluder.addEventListener('click', startBuildPhase);

      } else {

        trial.completed = true;
        trial.buildFinishTime = Date.now();

        // //calculate bonus earned
        // rawScore = getCurrScore();
        // normedScore = getNormedScore(rawScore, nullScore, scoreGap);
        // //trialPoints = Math.max(Math.ceil(normedScore * 100), 0);

        // rawScoreDiscrete = getScoreDiscrete(trial.targetMap, discreteWorld);
        // normedScoreDiscrete = trial.getNormedScoreDiscrete(rawScoreDiscrete, trial.nullScoreDiscrete, trial.scoreGapDiscrete);
        // trialPoints = Math.max(Math.ceil(normedScoreDiscrete * 100), 0);

        if (trial.condition != 'practice') {

          occluder_text.textContent = '';

          if (!trial.bonusesCalculated){
            calculateAndDisplayBonuses();
          }

          sendData(eventType = 'trial_end', trial);

          jsPsych.pluginAPI.setTimeout(function () {
            if (trial.currBonus > 0) {
              display_element.querySelector('#bonus-meter').style.color = "#00b300";
            } else {
              display_element.querySelector('#bonus-meter').style.color = "#1c363e";
            }
          }, 4000);
        } else {
          occluder_text.textContent = 'Great job! On to the real experiment';
        }

        occluder.style.display = "block";
        clearP5Envs(); // Clear everything in P5

        jsPsych.pluginAPI.setTimeout(function () { //edit here to add punishment timeout
          clear_display_move_on();
        }, 2500);
      }
        

    }

    trial.fell_over = function () {
      if(trial.phase=='practice'){
        occluder_text.textContent = `Oh no! A block fell! Remember that blocks falling cause the current trial to end. \r\n Resetting practice trial`;
        //occluder_text.textContent = occluder_text.textContent.concat(`  \r\n`);
        occluder.style.display = "block";
        occluder_timer_text.style.display = "none";
        jsPsych.pluginAPI.setTimeout(function () {
          occluder.style.display = "none";
          occluder_timer_text.style.display = "none";
          Array.prototype.forEach.call(env_divs, env_div => {
            env_div.style.backgroundColor = "#FFD819";
          });
          resetPressed();
        }, 3000);
      }
      else if(!trial.completed){
        occluder_text.textContent = `Oh no! A block fell! Remember that blocks falling cause the current trial to end. \r\n`;
        //occluder_text.textContent = occluder_text.textContent.concat(`  \r\n`);
        occluder.style.display = "block";
        occluder_timer_text.style.display = "block";
        calculateAndDisplayBonuses();
        occluder_text.textContent = occluder_text.textContent.concat('Please wait for the next trial to load\r\n ');
      }
    }

    function calculateAndDisplayBonuses() {

      trial.bonusesCalculated = true;

      trial.buildFinishTime = Date.now();

      //calculate bonus earned
      rawScore = getCurrScore();
      normedScore = getNormedScore(rawScore, nullScore, scoreGap);
      // trialPoints = Math.max(Math.ceil(normedScore * 100), 0);

      rawScoreDiscrete = getScoreDiscrete(trial.targetMap, discreteWorld);
      normedScoreDiscrete = trial.getNormedScoreDiscrete(rawScoreDiscrete, trial.nullScoreDiscrete, trial.scoreGapDiscrete);
      trialPoints = Math.max(Math.ceil(normedScoreDiscrete * 100), 0);

      _timeToBuild = trial.timeLastPlaced - trial.buildStartTime;
      trial.timeToBuild = _timeToBuild > 0 ? _timeToBuild : NaN

      //trial.currBonus = getBonusEarned(rawScore, nullScore, scoreGap);
      trial.currBonus = convertNormedScoreToBonus(normedScoreDiscrete); //bonus from discrete score

      if (normedScoreDiscrete == 1) { // only perfect score gets time bonus
        trial.timeBonus = getTimeBonus(trial.timeToBuild);
      }

      cumulBonus += parseFloat(trial.currBonus.toFixed(2));
      cumulBonus += parseFloat(trial.timeBonus.toFixed(3));
      points += trialPoints;

      occluder.style.fontSize = 'large';
      if (trial.currBonus == trial.bonusHigh) { //remove hardcoded bonus amounts
        occluder_text.textContent = occluder_text.textContent.concat(`🤩 Amazing! ${trialPoints} Points! 5¢ bonus! \r\n`);
      } else if (trial.currBonus ==trial.bonusMid) {
        occluder_text.textContent = occluder_text.textContent.concat(`😃 Great job! ${trialPoints} Points! 3¢ bonus! \r\n`);
      } else if (trial.currBonus ==trial.bonusLow) {
        occluder_text.textContent = occluder_text.textContent.concat(`🙂 Not bad! ${trialPoints} Points! 1¢ bonus! \r\n`);
      } else {
        occluder_text.textContent = occluder_text.textContent.concat(`😐 ${trialPoints} Points! Sorry, no bonus this round. \r\n`);
      }

      if (trial.timeBonus == trial.timeBonusHigh) {
        occluder_text.textContent = occluder_text.textContent.concat(`Maximum time bonus! 1¢ \r\n`);
      } else if (trial.timeBonus == trial.timeBonusLow) {
        occluder_text.textContent = occluder_text.textContent.concat(`Time bonus! 0.5¢ \r\n`);
      }
      updateTrialScores(trial);

    }

    function clear_display_move_on() {

      timers.forEach(interval => {
        clearInterval(interval);
      });

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial();

    };

    // ************ PHASES OF TRIAL ************
    // *****************************************

    var startPractice = function () {
      trial.buildStartTime = Date.now()
      zoom_message.style.display = "inline-block";
      occluder.style.display = "none";
      occluder.removeEventListener('click', startPractice);
      timer(trial.practice_duration, function () {
        clearP5Envs();
        clear_display_move_on();
      });
      
    };

    var resumePractice = function () {
      occluder.style.display = "none";
      occluder.removeEventListener('click', resumePractice);
    }

    var startBuildPhase = function () {

      trial.buildStartTime = Date.now()
      occluder.style.display = "none";
      occluder.removeEventListener('click', startBuildPhase);

      jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to default
        display_element.querySelector('#bonus-meter').style.color = "#1c363e";
      }, 3000);

      //console.log('timer starting for build');
      timer(trial.build_duration, function () { //set timer for build phase
        if (trial.completed == false) {
          trial.endTrial(endReason = 'timeout'); // calculate bonuses and clear envs
        }
        /*jsPsych.pluginAPI.setTimeout(function () { //edit here to add punishment timeout
          if (trial.pMessingAround >= 0.8 && trial.normedScore < 0.5) {
            occluder.style.fontSize = 'large';
            occluder.textContent = "It seems like you're not trying 🤨 Waiting for an extra 30 seconds";
            jsPsych.pluginAPI.setTimeout(function () { //edit here to add punishment timeout
              clear_display_move_on();
            }, 32500);
          } else {
            clear_display_move_on();
          }
        }, 2500);*/

      });
    }

    // ************* TRIAL TIMELINE ************ 
    // *****************************************

    // Code below sets up what happens before the trial- setting correct occluders, reseting scores, etc.
    // Actual code for experiment is in functions above, and setupEnvs in experimentEnvironment.js

    // Set up button event listeners
    done_button.addEventListener('click', donePressed);
    reset_button.addEventListener('click', resetPressed);

    if (trial.condition != 'practice') {

      done_button.style.display = "none";
      reset_button.style.display = "none";

      p5stim, p5env = setupEnvs(trial);

      // set null score for normed score calculation (pixel)
      nullScore = getCurrScore();
      scoreGap = math.subtract(1, nullScore);
      trial.nullScore = nullScore;
      trial.scoreGap = scoreGap;

      // set null score for normed score calculation (discrete)
      nullScoreDiscrete = getCurrScoreDiscrete();
      scoreGapDiscrete = math.subtract(1, nullScoreDiscrete);
      trial.nullScoreDiscrete = nullScoreDiscrete;
      trial.scoreGapDiscrete = scoreGapDiscrete;

      occluder_text.textContent = 'Trial ' + (parseInt(trial.trialNum) + parseInt(1)).toString() + '. Click to begin.';
      occluder.style.display = "block";
      occluder.addEventListener('click', startBuildPhase);
    }
    else { // this is a practice trial
      done_button.style.display = "none";
      trial.phase == 'practice';
      occluder_text.textContent = practice_text;

      p5stim, p5env = setupEnvs(trial); //create p5 instances for practice phase

      //Update trial appearance 
      condition_heading.textContent = "PRACTICE";

      Array.prototype.forEach.call(env_divs, env_div => {
        env_div.style.backgroundColor = "#FFD819";
      });

      nullScore = getCurrScore();
      scoreGap = math.subtract(1, nullScore);
      trial.nullScore = nullScore;
      trial.scoreGap = scoreGap;

      // set null score for normed score calculation
      nullScoreDiscrete = getCurrScoreDiscrete();
      scoreGapDiscrete = math.subtract(1, nullScoreDiscrete);
      trial.nullScoreDiscrete = nullScoreDiscrete;
      trial.scoreGapDiscrete = scoreGapDiscrete;
    

      occluder.addEventListener('click', startPractice);
    };

  };
  return plugin;
})();
