/*
 * Displays a domain stimuli and prompts subject for language production.
 *
 * Requirements for towers domain.
 *  block Display widget (i.e. import blockConfig.js and blockDisplay.js above this plugin in html)
 */

// const { transform } = require("lodash");

var DEFAULT_IMAGE_SIZE = 200;

jsPsych.plugins["block-tower-old-new"] = (function () {
  var plugin = {};

  // jsPsych.pluginAPI.registerPreload('block-construction', 'stimulus', 'image');

  plugin.info = {
    name: "block-tower-old-new",
    parameters: {
      domain: {
        type: jsPsych.plugins.parameterType.STRING, // Domain to display.
        default: "",
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.OBJECT,
        // default: {
        //   'blocks': [{ 'x': 0, 'y': 0, 'height': 2, 'width': 1 },
        //   { 'x': 2, 'y': 0, 'height': 2, 'width': 1 },
        //   { 'x': 0, 'y': 2, 'height': 1, 'width': 2 },
        //   { 'x': 2, 'y': 2, 'height': 1, 'width': 2 }]
        // },
      },
      stimId: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "None",
      },
      condition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "None provided",
      },
      novelty: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "None provided",
      },
      prompt:{
        type: jsPsych.plugins.parameterType.STRING,
        default: "",
      },
      rep: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      offset: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Offset",
        default: 0,
        description: "Number of squares to right stim is displaced in stimulus."
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Preamble",
        default: null,
        description:
          "HTML formatted string to display at the top of the page above all the questions.",
      },
      buttonLabel: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Button label",
        default: "Continue",
        description: "The text that appears on the button to finish the trial.",
      },
      nBlocksMax: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Number of blocks available",
        default: 4,
        description: "Number of blocks that can be placed before the trial ends or resets",
      },
      dataForwarder: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Function to call that forwards data to database (or otherwise)",
        default: (data) => console.log(data),
      },
      new_key: {
        type: jsPsych.plugins.parameterType.KEY,
        array: true,
        pretty_name: 'New Key',
        default: 'm',
        description: 'The key the subject should press if this is a new trial.'
      },
      old_key: {
        type: jsPsych.plugins.parameterType.KEY,
        array: true,
        pretty_name: 'Old key',
        default: 'z',
        description: 'The key the subject should press if this is an old trial.'
      },
      choices : {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Valid choices for keypress',
        default: [],
        description: 'Valid choices for keypress.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      towerDetails: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Additional tower informatiom to append to data",
        default: {},
      },
      iti: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'ITI',
        default: 0,
        description: 'Time (ms) in between trials after clearing screen.'
      },
      trialNum :{
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial Number',
        default: 0,
        description: 'Externally assigned trial number.'
      }
    },
  };

  plugin.trial = function (display_element, trial) {

    // trial number handling
    window.recallTrialNum += 1;



    display_element.innerHTML = "";
    
    var html_content = "";

    html_content += '<h1 id="prompt">'+trial.prompt+'</h1>';
    
    html_content += '<div class="container" id="experiment">';

    /** Create domain canvas **/
    html_content += '<div class="row pt-1 env-row">';
    html_content += '<div class="col env-div" id="stimulus-canvas"></div>';
    // html_content += '<div class=" col env-div" id="environment-canvas"></div>';
    html_content += '</div>';

    html_content += '<div class="col pt-3 text-right">';
    html_content += '<h5 id="trial-counter-center">Tower ' + window.recallTrialNum + ' of ' + window.totalTrials +'</h5>';
    // html_content += '<button id="reset-button" type="button" class="btn btn-primary">Reset</button>';
    html_content += '</div>';

    html_content += '<div id="key-reminders">'
    html_content += '<img src="../img/z_grey.png" class="key-reminder" id="z-reminder">'
    html_content += '<img src="../img/m_grey.png" class="key-reminder" id="m-reminder">'
    html_content += '<p class="response_side" id="new-text">new</p>' //✔
    html_content += '<p class="response_side" id="old-text">old</p>' //✖
    html_content += '</div>'

    html_content += "</div>";
    // html_content += '<p>Use ctrl/cmd + minus-sign (-) if windows do not fit on the screen at the same time.</p>';

    display_element.innerHTML = html_content;

    // store response
    var response = {
      rt: null,
      key: null
    };

    trial.finished = false;

    // key presses
    var keyPresses = 0;
    let incrementKeyPresses = function(event) {
      if(event.key == 'm' || event.key == 'z'){
        keyPresses += 1;
      };
    }

    document.addEventListener('keydown', incrementKeyPresses);

    if (trial.stimulus !== null) {

      trial.trialStartTime = Date.now();

      trial.nBlocksPlaced = 0;

      // trial.stimulus = {'blocks': [{ 'x': 0, 'y': 0, 'height': 1, 'width': 2 },
      //     { 'x': 2, 'y': 0, 'height': 2, 'width': 1 },
      //     { 'x': 0, 'y': 1, 'height': 2, 'width': 1 },
      //     { 'x': 1, 'y': 2, 'height': 1, 'width': 2 }]};

      // setup building environment for block display
      let blockDisplay = {
        stimulus: trial.stimulus.blocks,
        blocksPlaced: 0,
        nResets: -1, // start minus one as reset env at beginning of new trial
        offset: trial.offset,
      };
      trial.blockDisplay = blockDisplay;
      var showStimulus = true;
      var showBuilding = false;
      blockSetup(blockDisplay, showStimulus, showBuilding);
    
      new_side = trial.new_key == 'z' ? "left" : "right";
      old_side = trial.old_key == 'z' ? "left" : "right";
      $('#new-text').addClass(new_side+"-emoji-text");
      $('#old-text').addClass(old_side+"-emoji-text");


      var end_trial = function () {

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
  
        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
  
        // gather the data to store for the trial
        var trial_data = _.extend({
          trial_start_time: trial.trialStartTime,
          trial_finish_time: Date.now(),
          rt: response.rt,
          condition: trial.condition,
          novelty: trial.novelty,
          stimulus: trial.stimulus,
          response: response.key,
          response_meaning: response.key == trial.new_key ? 'new' : 'old',
          response_correct: trial.response_correct,
          key_presses: keyPresses,
          trial_num: trial.trialNum
        }, trial.towerDetails);
  
        // clear the display
        display_element.innerHTML = '';
 
        setTimeout(function () {
          // move on to the next trial
          jsPsych.finishTrial(trial_data);
        }, trial.iti);
      };

      var after_response = function (response_info) {
  
        // only record the first response
        if ((response.key == null)) {
          response = response_info;
        }
  
        response_correct = (response.key == trial.new_key & trial.novelty == 'new') | 
                           (response.key == trial.old_key & trial.novelty == 'old');

        // console.log(trial.condition, response_correct);
        response_class = response_correct ? 'responded_correct' : 'responded_incorrect';
  
        trial.response_correct = response_correct;
  
        // document.removeEventListener('keydown', incrementKeyPresses);
  
        if (trial.response_ends_trial) {
          setTimeout(end_trial, 
            100);
        }
      };

      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
      });

    };

  };

  return plugin;
})();
