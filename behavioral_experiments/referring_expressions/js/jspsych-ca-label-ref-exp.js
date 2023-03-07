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
    },
  };

  plugin.trial = function (display_element, trial) {

    // ##### HTML Layout #####

    display_element.innerHTML = "";

    var html_content = "";

    html_content += '<div class="row pt-1 env-row">';
    html_content += '<div class="col env-div" id="stimulus-canvas"></div>';
    html_content += '<div class="col env-div" id="message-column">';
    html_content += '<div class="col" id="all-messages">';
    html_content += '</div>';
    html_content += '</div>';
    html_content += '</div>';
    // html_content += '<div class="row pt-1 env-row">';
    
    // html_content += '</div>';


    

    display_element.innerHTML = html_content;

    var trialStartTime = performance.now();


    // ##### Generate text boxes #####

    trial.messages = _.concat(trial.messages,trial.messages,trial.messages);

    let allMessages = document.querySelector("#all-messages");

    for (var i = 0; i < trial.messages.length; i++) {
      let message = trial.messages[i]["clean_msg"];
      
      messageDiv = document.createElement("div");
      messageDiv.setAttribute("id", "message-" + i.toString());
      messageDiv.setAttribute("class", "col-sm-6 message-row");

      messageP = document.createElement("p");
      messageP.setAttribute("class", "message");
      messageP.appendChild(document.createTextNode(message));
      
      messageDiv.appendChild(messageP);

      // messageDiv.innerHTML= "<p>" + message + "</p>";
      // messageDiv.setAttribute("autocomplete","off");
      // messageDiv.setAttribute("type", "text");
      // messageDiv.setAttribute("cols", question.columns); // change input to textarea and use these settings for multi-line input
      // messageDiv.setAttribute("rows", question.rows);
      // messageDiv.setAttribute("size", message.columns);
      // messageDiv.setAttribute("name", message.name);
      // messageDiv.setAttribute("data-name", message.name);
      // messageDiv.setAttribute("placeholder", message.placeholder);
      // messageDiv.required = true; 
    
      allMessages.appendChild(messageDiv);
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




    function endTrial(trial_data) { // called by block_widget when trial ends

      trial_data = _.extend(trial_data, trial.towerDetails, {

      });

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
