/*
 * Displays a domain stimuli and prompts subject for language production.
 *
 * Requirements for towers domain.
 *  block Display widget (i.e. import blockConfig.js and blockDisplay.js above this plugin in html)
 */

var DEFAULT_IMAGE_SIZE = 200;

jsPsych.plugins["ca-label-ref-exp"] = (function () {
  var plugin = {};

  // jsPsych.pluginAPI.registerPreload('tower-display', 'stimulus');

  plugin.info = {
    name: "ca-label-ref-exp",
    parameters: {
      domain: {
        type: jsPsych.plugins.parameterType.STRING, // Domain to display.
        default: "",
      },
      stimURL: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: "",
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.OBJECT,
        default: {},
      },
      levels: {
        type: jsPsych.plugins.parameterType.OBJECT,
        default: ["block", "tower", "scene"],
      },
      sceneID: {
        type: jsPsych.plugins.parameterType.OBJECT,
        default: ["none","none"],
      },
      stimId: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "None",
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Preamble",
        default: null,
        description:
          "HTML formatted string to display at the top of the page above all the questions.",
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Button label",
        default: "Continue",
        description: "The text that appears on the button to finish the trial.",
      },
      messages: {
        type: jsPsych.plugins.parameterType.OBJECT,
        default: [],
      }
    },
  };

  plugin.trial = function (display_element, trial) {

    // ##### HTML Layout #####

    display_element.innerHTML = "";

    var html_content = "";

    html_content += '<div class="row pt-1 env-row">';
    html_content += '<div class="col env-div stim-no-resize" id="stimulus-canvas"></div>';
    html_content += '<div class="col env-div" id="message-column">';
    html_content += '<div class="col" id="all-messages">';
    html_content += '<form name="ref-exp-form" method="post">'
    html_content += '</form>';
    html_content += '</div>';
    html_content += '</div>';
    html_content += '</div>';
    html_content += '<button id="next-button" type="button" class="btn btn-primary">Next</button>';
    // html_content += '<div class="row pt-1 env-row">';
    
    // html_content += '</div>';

    display_element.innerHTML = html_content;

    var trialStartTime = Date.now();


    // ##### Generate text boxes #####

    trial.messages = _.concat(trial.messages);

    let allMessages = document.querySelector("#all-messages");

    // header
    headerDiv = document.createElement("div");
    headerDiv.setAttribute("id", "ref-header");
    headerDiv.setAttribute("class", "row");

    _.reverse(_.clone(trial.levels)).forEach(level => {
      icon = document.createElement("p");
      icon.setAttribute("id", "ref-header-"+level);
      icon.setAttribute("class", "ref-icon");
      icon.appendChild(document.createTextNode(level[0]));
      headerDiv.appendChild(icon);
    });

    allMessages.appendChild(headerDiv);


    for (var i = 0; i < trial.messages.length; i++) {
      let message = trial.messages[i]["clean_msg"];

      messageRow = document.createElement("div");
      messageRow.setAttribute("id", "message-row-" + i.toString());
      messageRow.setAttribute("class", "row message-row");
      
      messageDiv = document.createElement("div");
      messageDiv.setAttribute("id", "message-" + i.toString());
      messageDiv.setAttribute("class", "col message-text-div");

      messageP = document.createElement("p");
      messageP.setAttribute("class", "message");
      messageP.appendChild(document.createTextNode(message));
      
      messageDiv.appendChild(messageP);
      messageRow.appendChild(messageDiv);
      

      trial.levels.forEach(level => {
        newInput = createInput(level, i, cols=2);
        messageRow.appendChild(newInput);
      });

      allMessages.appendChild(messageRow);
      console.log(allMessages);
    }


    // ##### Display Scene #####

    // object to send to block display
    let constructionTrial = {
      stimulus: trial.stimulus.blocks,
      endCondition: 'none',
      blocksPlaced: 0,
      nResets: -1, // start minus one as reset env at beginning of new trial
      //nBlocksMax: trial.nBlocksMax,
      offset: trial.offset,
    };

    trial.constructionTrial = constructionTrial;

    var showStimulus = true;
    var showBuilding = false;

    blockSetup(constructionTrial, showStimulus, showBuilding);


    function createInput(level, msgNum, cols=20) {

      let newInput = document.createElement("input");
      newInput.setAttribute("id", "input-msg-" + msgNum.toString() + "-" + level);
      newInput.setAttribute("class", "ref-exp-input");
      newInput.setAttribute("autocomplete","off");
      newInput.setAttribute("type", "number");
      newInput.setAttribute("maxlength", "1");
      newInput.setAttribute("min", "0");
      newInput.setAttribute("max", "9");
      newInput.setAttribute("step", "1");
      // newInput.setAttribute("pattern", "[0-9]{1}");
      newInput.setAttribute("oninput", "javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);");
      newInput.setAttribute("title", level);
      // newInput.setAttribute("cols", question.columns); // change input to textarea and use these settings for multi-line input
      // newInput.setAttribute("rows", question.rows);
      newInput.setAttribute("size", cols);
      newInput.setAttribute("name", "msg-" + msgNum.toString() + "-" + level);
      newInput.setAttribute("data-name", "msg-" + msgNum.toString() + "-" + level);
      newInput.setAttribute("placeholder", "0");
      newInput.required = true; 

      return newInput;

    };

    $("#next-button").click(() => {
      validateForm();
    });

    let nWarnings = 0;

    function validateForm() {

      let trialEndTime = Date.now();

      let form = document.forms["ref-exp-form"];

      let responses = [];

      let changes = 0;

      for (let i = 0; i < trial.messages.length; i++) {

        messageResponse = {};
        messageResponse['msgNum'] = i;
        messageResponse['message'] = trial.messages[i]['clean_msg'];
        messageResponse['counts'] = {}

        for (let lev = 0; lev < trial.levels.length; lev++) {
          const level = trial.levels[lev];
          var id = "input-msg-" + i.toString() + "-" + level;
          var q_element = document.querySelector('#' + id);
          var val = q_element.value ? q_element.value : "0";
          messageResponse['counts'][level] = val;

          if(val != "0") {
            changes += 1;
          }
        };

        responses.push(messageResponse);
        
      };
      
      console.log(nWarnings);

      if (nWarnings < 1) {
        if (changes == 0) {
          alert("It looks like you didn't record any referring expressions. Please enter how many blocks, towers, and scenes are referred to in each message.");
          nWarnings += 1;
          return false;
        }
        else {
          endTrial({
            trialStartTime: trialStartTime,
            trialEndTime : trialEndTime,
            trialDuration : trialEndTime - trialStartTime,
            responses : responses,
            nWarnings: nWarnings});
        }
      }
      else {
        endTrial({
          trialStartTime: trialStartTime,
          trialEndTime : trialEndTime,
          trialDuration : trialEndTime - trialStartTime,
          responses : responses,
          nWarnings: nWarnings});
      }
    }


    function endTrial(trial_data) { // called by block_widget when trial ends

      trial_data = _.extend(trial_data, trial.towerDetails, {
        stimulus: trial.stimulus,
        levels: trial.levels,
        sceneID: trial.sceneID,
        leftTower: trial.sceneID[0],
        rightTower: trial.sceneID[1]
      });

      console.log(trial_data);

      // window.blockUniverse.blockMenu.blockKinds = [];
      setTimeout(function () {
        display_element.innerHTML = '';
        setTimeout(function () {
          // move on to the next trial
          jsPsych.finishTrial(trial_data);
        }, trial.iti);

      }, trial.afterBuildPauseDuration);

    };

  };

  return plugin;
})();
