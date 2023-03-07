/*
experimentUtils.js | Credit : WPM, YF. CW.

Utility functions for running experiments. Contains importable constants.
*/

DEBUG_MODE = false;
DEBUG_TRIALS_ONLY = false; // Hide exit survey and config.

// CONST_ALL = "all";
// CONST_DOWNLOADED = "downloaded"; // stim set should be obtained from mongo
// DOMAIN_TOWERS = "towers";
// DOMAIN_DRAWING = "drawing";
// DOMAINS = [DOMAIN_TOWERS, DOMAIN_DRAWING];

// EXPERIMENT_TRIAL_INSTRUCTIONS = "instructions";
// EXPERIMENT_TRIAL_ATTENTION_CHECK_SURVEY_MULTIPLE_CHOICE = "attention-check-survey-multiple-choice";
// EXPERIMENT_STIMULI_LANGUAGE_PRODUCTION = "stimuli-language-production";
// EXPERIMENT_STIMULI_PROCEDURAL_LANGUAGE_PRODUCTION = "stimuli-procedural-language-production";
// EXPERIMENT_STIMULI_CONTEXTUAL_LANGUAGE_PRODUCTION = "stimuli-contextual-language-production";
// STIMULI_PRODUCTION = "stimuli-production";
// STIMULI_CATEGORY_FAMILIARIZATION = "category-familiarization";

// INSTITUTION_MIT = "mit";
// INSTITUTION_USCD = "ucsd";
// NO_CODE = "NOCODE"

var logIfDebug = function (text) {
  if (DEBUG_MODE) {
    console.log(text);
  }
};

var constructDefaultExperimentalTimelineFromTrials = function (
  trials,
  institution,
  completionCode
) {
  /** Constructs a default experimental timeline from a set of experiment-specific trials. Appends a consent form and an exit survey. **/
  var timeline = [];
  if (DEBUG_TRIALS_ONLY) {
    timeline = trials;
  } else {
    timeline.push(constructDefaultConsent(institution));
    timeline = timeline.concat(trials);
    timeline.push(constructDefaultExitSurvey(completionCode));
  }
  logIfDebug(timeline);
  return timeline;
};

var constructDefaultConsent = function (institution) {
  var consent_html;
  logIfDebug(institution);
  switch (institution) {
    case INSTITUTION_MIT:
      consent_html = "../html/consent-mit.html";
      break;
    case INSTITUTION_USCD:
      consent_html = "../html/consent-ucsd.html";
      break;
    default:
      consent_html = "../html/consent-ucsd.html";
      break;
  }
  var consent = {
    type: "external-html",
    url: consent_html,
    cont_btn: "start",
  };
  return consent;
};

var constructDefaultExitSurvey = function (studyLocation, completionCode) {
  var comments_block = {
    type: "survey-text",
    preamble:
      '<p>Thank you for participating in our study!</p><p><strong>Click "Finish" to complete the experiment and receive compensation.</strong> If you have any comments, please let us know in the form below.</p>',
    questions: [{ prompt: "Did you run into any technical difficulties?", name: "technical"},
                { prompt: "Were you confused at all about what you had to do? What did you find confusing?", name: "confused" },
                { prompt: "Do you have any other comments to share with us?", name: "comments" }],
    button_label: "Finish",
    on_finish: function () {
      window.experimentFinished = true;
      document.body.innerHTML =
        "<p> Please wait. You will be redirected back to "+studyLocation+" in a few moments.</p>";
      setTimeout(function () {
        if (studyLocation == 'Prolific'){
          location.href =
            "https://app.prolific.co/submissions/complete?cc=" + completionCode; // add correct completion code
        }
        else if (studyLocation == 'SONA'){
          location.href =
          "https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=2252&credit_token=8e4fb5c680cd4cdabe1681e8fece8f56&survey_code=" + completionCode; 
        }
      }, 500);
    },
  };
  return comments_block;
};

longestSubsequence = function(list) {
  longest = 0
  current_elem = list[0]
  currentlength = 1
  i = 0
  while (i < list.length){
      i += 1
      if(list[i] == current_elem) {
          currentlength += 1;
          if(currentlength >= longest) {
              longest = currentlength;
          }
      } else {
          current_elem = list[i];
          currentlength = 1;
      }
  }
  return longest
}

psuedoRandomizeTrials = function(unshuffledTrials, condition = (ts) => { return true } ) {

  shuffledTrials = _.shuffle(unshuffledTrials);

  while(!condition(shuffledTrials)) {
      shuffledTrials = _.shuffle(unshuffledTrials);
  };
  return shuffledTrials;
}


// var constructExperimentTrialsForParameters = function (
//   config,
//   domain,
//   condition,
//   batchIndex,
//   experimentTrialParameters,
//   stimuliIdsToPreloadedStimuli
// ) {
//   /** Constructs experiment-specific trials from the trial parameters block in a config. **/
//   switch (experimentTrialParameters.type) {
//     case EXPERIMENT_TRIAL_INSTRUCTIONS:
//       return constructInstructionTrialsForParameters(
//         config,
//         domain,
//         experimentTrialParameters,
//         stimuliIdsToPreloadedStimuli
//       );
//     case EXPERIMENT_TRIAL_ATTENTION_CHECK_SURVEY_MULTIPLE_CHOICE:
//       return constructAttentionCheckSurveyMultipleChoiceTrialsForParameters(
//         config,
//         domain,
//         experimentTrialParameters
//       );
//     case EXPERIMENT_STIMULI_LANGUAGE_PRODUCTION:
//       return constructStimuliLanguageProductionTrialsForParameters(
//         config,
//         domain,
//         condition,
//         batchIndex,
//         experimentTrialParameters,
//         stimuliIdsToPreloadedStimuli
//       );
//     case EXPERIMENT_STIMULI_PROCEDURAL_LANGUAGE_PRODUCTION:
//       return constructStimuliProceduralLanguageProductionTrialsForParameters(
//         config,
//         domain,
//         condition,
//         batchIndex,
//         experimentTrialParameters,
//         stimuliIdsToPreloadedStimuli
//       );
//     case STIMULI_PRODUCTION:
//       return constructStimuliProductionTrialsForParameters(
//         config,
//         domain,
//         condition,
//         batchIndex,
//         experimentTrialParameters,
//         stimuliIdsToPreloadedStimuli
//       );
//     case EXPERIMENT_STIMULI_CONTEXTUAL_LANGUAGE_PRODUCTION:
//       return constructStimuliContextualLanguageProductionTrials(
//         config,
//         domain,
//         condition,
//         batchIndex,
//         experimentTrialParameters,
//         stimuliIdsToPreloadedStimuli
//       )
//     case STIMULI_CATEGORY_FAMILIARIZATION:
//       return constructCategoryFamiliarizationTrials(
//         config,
//         domain,
//         condition,
//         batchIndex,
//         experimentTrialParameters,
//         stimuliIdsToPreloadedStimuli
//       )
//     default:
//       return [];
//   }
// };

// var constructInstructionTrialsForParameters = function (
//   config,
//   domain,
//   experimentTrialParameters,
//   stimuliIdsToPreloadedStimuli
// ) {
//   logIfDebug("Constructing instruction trials.");
//   return [
//     {
//       type: EXPERIMENT_TRIAL_INSTRUCTIONS,
//       pages: experimentTrialParameters.pages,
//       show_clickable_nav: true,
//     },
//   ];
// };

// var constructAttentionCheckSurveyMultipleChoiceTrialsForParameters = function(
//   config,
//   domain,
//   experimentTrialParameters
// ) {
//   // Runs a multiple choice attention check until you run out of valid tries or get it correct.
  
//   logIfDebug("Constructing attention check.");
//   // Construct the basic attention check.
//   valid_tries = experimentTrialParameters["valid_tries"]
//   base_attention_check = { 
//             type: "survey-multi-choice",
//             preamble: experimentTrialParameters["preamble"],
//             data : {},
//             questions: experimentTrialParameters['questions'].map(function (question) { return {
//               prompt: question['prompt'],
//               options: question['options'],
//               required: true
//             } }),
//             on_finish: function(data) {
//               // JSPsych stores responses in the form Q0, Q1...
//               data.familiarization_check_correct = true;
//               var responses = JSON.parse(data.responses);
//               for (let q_index = 0; q_index < experimentTrialParameters['questions'].length; q_index++) {
//                   correctAnswer =  experimentTrialParameters['questions'][q_index]['answer'];
//                   userAnswer = responses['Q' + q_index];
//                   logIfDebug(correctAnswer);
//                   logIfDebug(userAnswer);
//                   if (!(userAnswer == correctAnswer)) {
//                     data.familiarization_check_correct = false;
//                   }
//                 }
//             }
//         }
//   var loop_node = {
//         timeline: [base_attention_check],
//         loop_function: function(data){
//             data = jsPsych.data.get().last(1).values()[0];
//             num_tries = parseInt(data.internal_node_id.split(".").slice(-1)[0]) + 1;
//             is_tries_left = num_tries < valid_tries;
//             is_incorrect = !data.familiarization_check_correct;
//             should_loop = is_incorrect && is_tries_left;
            
//             if (!should_loop && !data.familiarization_check_correct) {
//               document.body.innerHTML =
//                 "<p> Sorry, you have not succeeded in passing the qualification check for this study. Please wait. You will be redirected back to Prolific in a few moments. You will receive a NOCODE, but will be compensated for the time you have taken for this qualification check.</p>";
//               setTimeout(function () {
//                 location.href =
//                   "https://app.prolific.co/submissions/complete?cc=" + NO_CODE; 
//               }, 500);
//               sendData();
//             }
//             return should_loop;
//         }
//     }
//   return [loop_node];
// }

// var constructStimuliProductionTrialsForParameters = function (
//   config,
//   domain,
//   condition,
//   batchIndex,
//   experimentTrialParameters,
//   stimuliIdsToPreloadedStimuli
// ) {
//   logIfDebug("Constructing stimuli production trials.");

//   stimuliBatch = getStimuliBatchForTrialBlockByCondition(
//     config,
//     domain,
//     condition,
//     batchIndex,
//     experimentTrialParameters.stimuli,
//     stimuliIdsToPreloadedStimuli
//   );

//   var productionTrials = [];
//   if (domain == DOMAIN_DRAWING) {
//     stimuliBatch.forEach(function (stimuliId) {
//       let trial = {
//         type: "jspsych-sketchpad-display",
//         domain: domain,
//         label_prompt: experimentTrialParameters.label_prompt,
//         stimulus: stimuliIdsToPreloadedStimuli[stimuliId],
//         stimURL: stimuliIdsToPreloadedStimuli[stimuliId],
//         stimId: stimuliId,
//         post_trial_gap: 500,
//       };
//       productionTrials.push(trial);
//     });
//   } else if (domain == DOMAIN_TOWERS) {
//       stimuliBatch.forEach(function (stimuliId) {
//       let trial = {
//         type: "jspsych-tower-building",
//         domain: domain,
//         stimulus: stimuliIdsToPreloadedStimuli[stimuliId],
//         stimURL: stimuliIdsToPreloadedStimuli[stimuliId],
//         stimId: stimuliId,
//         preamble: experimentTrialParameters.label_prompt
//       }
//       productionTrials.push(trial);
//     });
//   } else {
//     logIfDebug("ERROR: unknown domain.");
//   }

//   return productionTrials;
// };

// var constructStimuliLanguageProductionTrialsForParameters = function (
//   config,
//   domain,
//   condition,
//   batchIndex,
//   experimentTrialParameters,
//   stimuliIdsToPreloadedStimuli
// ) {
//   logIfDebug("Constructing stimuli language production trials.");

//   stimuliBatch = getStimuliBatchForTrialBlockByCondition(
//     config,
//     domain,
//     condition,
//     batchIndex,
//     experimentTrialParameters.stimuli,
//     stimuliIdsToPreloadedStimuli
//   );

//   var languageProductionTrials = [];
//   if (domain == DOMAIN_DRAWING || domain == DOMAIN_TOWERS) {
//     stimuliBatch.forEach(function (stimuliId) {
//       let trial = {
//         type: EXPERIMENT_STIMULI_LANGUAGE_PRODUCTION,
//         domain: domain,
//         stimulus: stimuliIdsToPreloadedStimuli[stimuliId],
//         stimURL: stimuliIdsToPreloadedStimuli[stimuliId],
//         stimId: stimuliId,
//         questions: [
//           // can add more questions for each stimulus here if wanted
//           {
//             prompt: experimentTrialParameters.label_prompt,
//             required: true,
//             columns: 50,
//             rows: 5,
//           },
//         ],
//         post_trial_gap: 500,
//       };
//       languageProductionTrials.push(trial);
//     });
//   } else {
//     logIfDebug("ERROR: unknown domain.");
//   }

//   return languageProductionTrials;
// };

// // For collection of step by step procedures.
// var constructStimuliProceduralLanguageProductionTrialsForParameters = function (
//   config,
//   domain,
//   condition,
//   batchIndex,
//   experimentTrialParameters,
//   stimuliIdsToPreloadedStimuli
// ) {
//   logIfDebug("Constructing stimuli language production trials.");

//   stimuliBatch = getStimuliBatchForTrialBlockByCondition(
//     config,
//     domain,
//     condition,
//     batchIndex,
//     experimentTrialParameters.stimuli,
//     stimuliIdsToPreloadedStimuli
//   );

//   var languageProductionTrials = [];
//   if (domain == DOMAIN_DRAWING || domain == DOMAIN_TOWERS) {
//     stimuliBatch.forEach(function (stimuliId) {
//       let trial = {
//         type: EXPERIMENT_STIMULI_PROCEDURAL_LANGUAGE_PRODUCTION,
//         domain: domain,
//         stimulus: stimuliIdsToPreloadedStimuli[stimuliId],
//         stimURL: stimuliIdsToPreloadedStimuli[stimuliId],
//         firstRowPrompt: experimentTrialParameters.firstRowPrompt,
//         additionalRowPrompt: experimentTrialParameters.additionalRowPrompt,
//         stimId: stimuliId,
//         questions: [
//           // can add more questions for each stimulus here if wanted
//           {
//             prompt: experimentTrialParameters.labelPrompts[0],
//             placeholder: experimentTrialParameters.labelPrompts[0],
//             name: experimentTrialParameters.labelPrompts[0],
//             required: true,
//             columns: 40,
//             rows: 1,
//           },
//           {
//             prompt: experimentTrialParameters.labelPrompts[1],
//             placeholder: experimentTrialParameters.labelPrompts[1],
//             name: experimentTrialParameters.labelPrompts[1],
//             required: true,
//             columns: 40,
//             rows: 1,
//           },
//         ],
//         post_trial_gap: 500,
//       };
//       languageProductionTrials.push(trial);
//     });
//   } else {
//     logIfDebug("ERROR: unknown domain.");
//   }

//   return languageProductionTrials;
// };

// var constructStimuliContextualLanguageProductionTrials = function(
//   config,
//   domain,
//   condition,
//   batchIndex,
//   experimentTrialParameters,
//   stimuliIdsToPreloadedStimuli
// )  {
//   logIfDebug("Constructing stimuli language production trials.");

//   stimuliBatch = getStimuliBatchForTrialBlockByCondition(
//     config,
//     domain,
//     condition,
//     batchIndex,
//     experimentTrialParameters.stimuli,
//     stimuliIdsToPreloadedStimuli
//   );
//     var languageProductionTrials = [];
//     if (domain == DOMAIN_DRAWING || domain == DOMAIN_TOWERS) {
//       stimuliBatch.forEach(function (stimuliId) {
//         let trial = {
//           type: "jspsych-category-labels-display",
//           domain: domain,
//           label_prompt: experimentTrialParameters.label_prompt,
//           stimulus: stimuliIdsToPreloadedStimuli[stimuliId],
//           stimURL: stimuliIdsToPreloadedStimuli[stimuliId],
//           stimId: stimuliId,
//           stimBatch: stimuliBatch,
//           stimURLs: stimuliIdsToPreloadedStimuli,
//           post_trial_gap: 500,
//           firstRowPrompt: experimentTrialParameters.firstRowPrompt,
//           additionalRowPrompt: experimentTrialParameters.additionalRowPrompt,
//           questions: [
//             // can add more questions for each stimulus here if wanted
//             {
//               prompt: experimentTrialParameters.labelPrompts[0],
//               placeholder: experimentTrialParameters.labelPrompts[0],
//               name: experimentTrialParameters.labelPrompts[0],
//               required: true,
//               columns: 40,
//               rows: 1,
//             },
//             {
//               prompt: experimentTrialParameters.labelPrompts[1],
//               placeholder: experimentTrialParameters.labelPrompts[1],
//               name: experimentTrialParameters.labelPrompts[1],
//               required: true,
//               columns: 40,
//               rows: 1,
//             },
//           ]
//         };
//         languageProductionTrials.push(trial);

//       });

//     } else {
//         logIfDebug("ERROR: unknown domain.");
//     }
    
//     return languageProductionTrials;
//   }
    
//   var constructCategoryFamiliarizationTrials = function(
//     config,
//     domain,
//     condition,
//     batchIndex,
//     experimentTrialParameters,
//     stimuliIdsToPreloadedStimuli
//   ) {
    
//     stimuliBatch = getStimuliBatchForTrialBlockByCondition(
//       config,
//       domain,
//       condition,
//       batchIndex,
//       experimentTrialParameters.stimuli,
//       stimuliIdsToPreloadedStimuli
//     );

//     let trial = {
//       type: "jspsych-category-familiarization",
//       domain: domain,
//       label_prompt: experimentTrialParameters.label_prompt,
//       stimBatch: stimuliBatch,
//       stimURLs: stimuliIdsToPreloadedStimuli,
//       requireClickThrough: experimentTrialParameters.requireClickThrough,
//     }

//     return [trial];
//   }

// var getStimuliBatchForTrialBlockByCondition = function (
//   config,
//   domain,
//   condition,
//   batchIndex,
//   trialBlockStimuli,
//   stimuliIdsToPreloadedStimuli
// ) {
//   /** Gets a batch of stimuli from a selected possible set. Performs randomized shuffling within the trial block if need be. **/
//   var trialBlockStimuliIdsForCondition = trialBlockStimuli[condition];
//   if (trialBlockStimuli[condition] == CONST_ALL) {
//     trialBlockStimuliIdsForCondition = Object.keys(
//       stimuliIdsToPreloadedStimuli
//     );
//   }
//   stimuliBatchForTrials = shuffleStimuliAndGetBatch(
//     config,
//     batchIndex,
//     trialBlockStimuliIdsForCondition
//   );

//   return stimuliBatchForTrials;
// };

// var shuffleStimuliAndGetBatch = function (config, batchIndex, stimuliArray) {
//   /** Shuffles the stimuli in array according to stimuliShuffleSeed and gets a batch at the index. **/
//   stimuliShuffleSeed = config.experiment_parameters.stimuli_shuffle_seed;
//   shuffledStimuliArray = shuffle(stimuliArray, stimuliShuffleSeed);
//   var batchSize = shuffledStimuliArray.length;
//   if (config.experiment_parameters.stimuli_batch_size !== CONST_ALL) {
//     batchSize = config.experiment_parameters.stimuli_batch_size;
//   }
//   batchedStimuli = _.chunk(shuffledStimuliArray, batchSize);
//   stimuliBatch = batchedStimuli[batchIndex];
//   return stimuliBatch;
// };

var shuffle = function (array, seed) {
  /** Seeded random shuffling. 
    Credit: https://github.com/yixizhang/seed-shuffle **/
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  seed = seed || 1;
  let random = function () {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

var serveFile = function (req, res) {
  var fileName = req.params[0];
  //console.log('\t :: Express :: file requested: ' + fileName);
  return res.sendFile(fileName, { root: __base });
};

var handleDuplicate = function (req, res) {
  console.log("duplicate id: blocking request");
  return res.redirect("/static/html/duplicate.html");
};

var handleInvalidID = function (req, res) {
  console.log("invalid id: blocking request");
  return res.redirect("/static/html/invalid.html");
};

var checkPreviousParticipant = function (workerId, callback) {
  var p = { workerId: workerId };
  console.log("checking participant for duplicates: ", workerId.toString());
  var postData = {
    dbname: "compositional-abstractions",
    query: p,
    projection: { _id: 1 },
  };
  sendPostRequest(
    "http://localhost:5000/db/exists",
    { json: postData },
    (error, res, body) => {
      try {
        if (!error && res.statusCode === 200) {
          //console.log("success! Received data " + JSON.stringify(body));
          callback(body);
        } else {
          throw `${error}`;
        }
      } catch (err) {
        console.log(err);
        console.log("no database; allowing participant to continue");
        return callback(false);
      }
    }
  );
};

const k_combinations = (set, k) => {
  if (k > set.length || k <= 0) {
    return [];
  }

  if (k == set.length) {
    return [set];
  }

  if (k == 1) {
    return set.reduce((acc, cur) => [...acc, [cur]], []);
  }

  let combs = [],
    tail_combs = [];

  for (let i = 0; i <= set.length - k + 1; i++) {
    tail_combs = k_combinations(set.slice(i + 1), k - 1);
    for (let j = 0; j < tail_combs.length; j++) {
      combs.push([set[i], ...tail_combs[j]]);
    }
  }

  return combs;
};

const combinations = (set) => {
  return set.reduce(
    (acc, cur, idx) => [...acc, ...k_combinations(set, idx + 1)],
    []
  );
};

var writeDataToCSV = function (game, _dataPoint) {
  var dataPoint = _.clone(_dataPoint);
  var eventType = dataPoint.eventType;

  // Omit sensitive data
  if (game.anonymizeCSV)
    dataPoint = _.omit(dataPoint, ["workerId", "assignmentId"]);

  // Establish stream to file if it doesn't already exist
  if (!_.has(game.streams, eventType)) establishStream(game, dataPoint);

  var line = _.values(dataPoint).join("\t") + "\n";
  game.streams[eventType].write(line, (err) => {
    if (err) throw err;
  });
};

var writeDataToMongo = function (game, line) {
  var postData = _.extend(
    {
      dbname: game.projectName,
      colname: game.experimentName,
    },
    line
  );
  sendPostRequest(
    "http://localhost:5000/db/insert",
    { json: postData },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log(`sent data to store`);
      } else {
        console.log(`error sending data to store: ${error} ${body}`);
      }
    }
  );
};

var addPptToMongo = function (postData) {
  sendPostRequest(
    "http://localhost:5000/db/insert",
    { json: postData },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log(`sent data to store`);
      } else {
        console.log(`error sending data to store: ${error} ${body}`);
      }
    }
  );
};

var UUID = function () {
  var baseName =
    Math.floor(Math.random() * 10) +
    "" +
    Math.floor(Math.random() * 10) +
    "" +
    Math.floor(Math.random() * 10) +
    "" +
    Math.floor(Math.random() * 10);
  var template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  var id =
    baseName +
    "-" +
    template.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  return id;
};

var getURLParams = function () {
  var match,
    pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) {
      return decodeURIComponent(s.replace(pl, " "));
    },
    query = location.search.substring(1);

  var urlParams = {};
  while ((match = search.exec(query))) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
  return urlParams;
};

// var requestStimsFromMongo = function(config) {

//   sendPostRequest('http://localhost:6021/db/getstims', {
//     json: {
//       dbname: 'stimuli',
//       colname: config.stimColName, //needs to be sent in data
//       // numTrials: 1,
//       gameid: data.gameID
//     }
//   }, (error, res, body) => {
//     if (!error && res.statusCode === 200) {
//       // socket.emit('stimulus', body);
//       return (body.stimNumbers);
//     } else {
//       console.log(`error getting stims: ${error} ${body}`);
//       console.log(`falling back to local stimList`);
//       //socket.emit('stimulus', _.sample(require('./data/example.json')));
//     }
//   });

// }

// var getAllStimuliToLoadForExperimentTrials = function (config) {
//   /**
//     Gets all stimuli paths to preload across the experiment trials.
//     :ret: [array of stimuli IDs] or CONST_ALL to load all stimuli.
//   */
//   allStimuliForTrials = [];
//   for (const idx in config.experiment_trial_parameters) {
//     let experimentTrialParameters = config.experiment_trial_parameters[idx];
//     if (experimentTrialParameters.stimuli) {
//       for (const condition in experimentTrialParameters.stimuli) {
//         if (config.stimColName) {
//           console.log('trying to fetch stims from mongo');
//           allStimuliForTrials = allStimuliForTrials.concat(
//             getStimListFromMongo(config)
//           );
//         } 
//         else if (
//           allStimuliForTrials === CONST_ALL ||
//           experimentTrialParameters.stimuli[condition] === CONST_ALL
//         ) {
//           allStimuliForTrials = CONST_ALL;
//         }
//         else {
//           allStimuliForTrials = allStimuliForTrials.concat(
//             experimentTrialParameters.stimuli[condition]
//           );
//         }
//       }
//     }
//   }
//   return allStimuliForTrials;
// };


var getStimuliIdsToStimuliURLs = function (config, domain, stimuliIds) {
  /** :ret: {stimuliId : URL path corresponding to stimuli IDs.}  */

  s3BucketName = config.experiment_parameters.s3_bucket;
  stimuliIdsToStrings = getStimuliIdsToPaddedStrings(
    stimuliIds,
    config.experiment_parameters.s3_bucket_total_stimuli
  );
  if (domain === DOMAIN_DRAWING) {
    Object.keys(stimuliIdsToStrings).map(function (stimuliId, _) {
      stimuliIdsToStrings[stimuliId] = getS3DrawingStimuliUrl(
        s3BucketName,
        stimuliIdsToStrings[stimuliId]
      );
    });
    return stimuliIdsToStrings;
  } else if (domain === DOMAIN_TOWERS) {
    stimuliVersionPrefix = config.experiment_parameters.s3_stimuli_path_format;
    Object.keys(stimuliIdsToStrings).map(function (stimuliId, _) {
      stimuliIdsToStrings[stimuliId] = getS3TowersStimuliUrl(
        s3BucketName,
        stimuliVersionPrefix,
        stimuliIdsToStrings[stimuliId]
      );
    });
    console.log(stimuliIdsToStrings)
    return stimuliIdsToStrings;
  } else {
    logIfDebug("ERROR: unknown domain.");
  }
};

var getStimuliIdsToPaddedStrings = function (stimuliIds, totalStimuli) {
  /** : ret: {stimuliId to 0-padded ID strings corresponding to ID numbers}. Constructs  [0 - total-stimuli] IDs if stimuliIds is ALL **/
  if (stimuliIds === CONST_ALL) {
    stimuliIds = [...Array(totalStimuli).keys()];
  }
  let stimuliIdsToStrings = Object.fromEntries(
    stimuliIds.map((stimuliId) => [
      stimuliId,
      String(stimuliId).padStart(3, "0"),
    ])
  );

  return stimuliIdsToStrings;
};

var getS3DrawingStimuliUrl = function (s3BucketName, stimuliIdString) {
  return (
    "https://" +
    s3BucketName +
    ".s3.amazonaws.com/" +
    s3BucketName +
    "-" +
    stimuliIdString +
    ".png"
  );
};

var getS3TowersStimuliUrl = function (
  s3BucketName,
  stimuliVersionPrefix,
  stimuliIdString
) {
  return (
    "https://" +
    s3BucketName +
    ".s3.amazonaws.com/" +
    stimuliVersionPrefix +
    "_" +
    stimuliIdString +
    ".json"
  );
};

var getS3TowersURL = function (stimInfo, stimId) {
  url =
    "https://" +
    stimInfo.s3Bucket +
    ".s3.amazonaws.com/" +
    stimInfo.stimVersion +
    "_" +
    stimId +
    ".json"; //watch out for correct number of digits

  return url;
};

var getStimuliIdsToPreloadedStimuli = function (
  domain,
  stimuliIdsToUrls,
  callback
) {
  /** :ret: {stimuliID to preloaded stimuli, then calls callback} */
  if (domain === DOMAIN_DRAWING) {
    callback(stimuliIdsToUrls);
  } else if (domain === DOMAIN_TOWERS) {
    getTowerStimuliJSONsFromUrls(stimuliIdsToUrls, (stimuliIdsToJSONs) => {
      callback(stimuliIdsToJSONs);
    });
  } else {
    logIfDebug("ERROR: unknown domain.");
  }
};

var getTowerStimuliJSONsFromUrls = function (stimURLs, callback) {
  let stimURLsToJSONs = {};
  var stimJSONPromise = new Promise((resolve, reject) => {
      stimURLs.forEach(stimURL => {
          getJSON(stimURL, function (err, data) {
          if (err !== null) {
              logIfDebug("Unable to load: " + stimURL);
          } else {
              stimURLsToJSONs[stimURL] = data;
              // if (index === array.length - 1) resolve();
              if (Object.keys(stimURLsToJSONs).length === stimURLs.length) { resolve() }
          };
      });
    });
  });

  stimJSONPromise.then(() => {
    // const stims = stimJSONs;
    callback(stimURLsToJSONs);
  });
};

var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

// var getTowerStimuliJSONsFromUrls = function (stimuliIdsToUrls, callback) {
//   let stimuliIdsToJSONs = {};
//   var stimJSONPromise = new Promise((resolve, reject) => {
//     Object.keys(stimuliIdsToUrls).forEach((stimuliId, index, array) => {
//       getJSON(stimuliIdsToUrls[stimuliId], function (err, data) {
//         if (err !== null) {
//           logIfDebug("Unable to load: " + stimuliIdsToUrls[stimuliId]);
//         } else {
//           stimuliIdsToJSONs[stimuliId] = data;
//           // if (index === array.length - 1) resolve();
//           if (Object.keys(stimuliIdsToJSONs).length === array.length){ resolve()}
//         }
//       });
//     });
//   });

//   stimJSONPromise.then(() => {
//     // const stims = stimJSONs;
//     callback(stimuliIdsToJSONs);
//   });
// };

// var getJSON = function (url, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.open("GET", url, true);
//   xhr.responseType = "json";
//   xhr.onload = function () {
//     var status = xhr.status;
//     if (status === 200) {
//       callback(null, xhr.response);
//     } else {
//       callback(status, xhr.response);
//     }
//   };
//   xhr.send();
// };

// var getLongFormTime = function() {
//   var d = new Date();
//   var day = [d.getFullYear(), (d.getMonth() + 1), d.getDate()].join('-');
//   var time = [d.getHours() + 'h', d.getMinutes() + 'm', d.getSeconds() + 's'].join('-');
//   return day + '-' + time;
// };

// var establishStream = function(game, dataPoint) {
//   var startTime = getLongFormTime();
//   var dirPath = ['.', 'data', dataPoint.eventType].join('/');
//   var fileName = startTime + "-" + game.id + ".csv";
//   var filePath = [dirPath, fileName].join('/');

//   // Create path if it doesn't already exist
//   mkdirp.sync(dirPath, err => {if (err) console.error(err);});

//   // Write header
//   var header = _.keys(dataPoint).join('\t') + '\n';
//   fs.writeFile(filePath, header, err => {if(err) console.error(err);});

//   // Create stream
//   var stream = fs.createWriteStream(filePath, {'flags' : 'a'});
//   game.streams[dataPoint.eventType] = stream;
// };

// var getObjectLocHeaderArray = function() {
//   var arr =  _.map(_.range(1,5), function(i) {
//     return _.map(['Name', 'SenderLoc', 'ReceiverLoc'], function(v) {
//       return 'object' + i + v;
//     });
//   });
//   return _.flatten(arr);
// };

// var hsl2lab = function(hsl) {
//   return converter.hsl.lab(hsl);
// };

// function fillArray(value, len) {
//   var arr = [];
//   for (var i = 0; i < len; i++) {
//     arr.push(value);
//   }
//   return arr;
// }

// var checkInBounds = function(object, options) {
//   return (object.x + (object.w || object.d) < options.width) &&
//          (object.y + (object.h || object.d) < options.height);
// };

// var randomColor = function (options) {
//   var h = ~~(Math.random() * 360);
//   var s = ~~(Math.random() * 100);
//   var l = _.has(options, 'fixedL') ? 50 : ~~(Math.random() * 100) ;
//   return [h, s, l];
// };

// var randomSpline = function () {
//   var numPoints = 4;
//   return _.sample(_.range(50, 250), 2 * numPoints);
// };

// // returns an object with x, y, w, h fields
// var randomRect = function(options) {
//   if (_.isEmpty(options)) {
//     throw "Error, must provide options to randomRect!";
//   }

//   var wRange = _.range(options.wMin, options.wMax);
//   var hRange = _.range(options.hMin, options.hMax);

//   var rect = randomPoint(options);
//   rect.h = _.sample(wRange),
//   rect.w = _.sample(hRange)

//   if (!checkInBounds(rect, options)) {
//     return this.randomRect(options);
//   }

//   return rect;
// }

// var randomCircle = function(options) {
//   if (_.isEmpty(options)) {
//     throw "Error, must provide options to randomCircle!";
//   }

//   //TODO, better error checking
//   var dRange = _.range(options.dMin, options.dMax);
//   if (_.isEmpty(dRange)) dRange = [options.dMin]; //hacky for now

//   var circle = randomPoint(options);
//   circle.d = _.sample(dRange);

//   if (!checkInBounds(circle, options)) {
//     return this.randomCircle(options);
//   }

//   return circle;
// }

// var randomPoint = function(options) {

//   var xRange = _.range(options.xMin, options.xMax);
//   var yRange = _.range(options.yMin, options.yMax);

//   return {
//     x: _.sample(xRange),
//     y: _.sample(yRange)
//   }
// }

// var colorDiff = function(color1, color2) {
//   var subLAB = _.object(['L', 'A', 'B'], hsl2lab(color1));
//   var tarLAB = _.object(['L', 'A', 'B'], hsl2lab(color2));
//   var diff = Math.round(DeltaE.getDeltaE00(subLAB, tarLAB));
//   return diff;
// };

// // --- below added by jefan March 2017
// // extracts all the values of the javascript dictionary by key
// var vec = function extractEntries(dict,key) {
//     vec = []
//     for (i=0; i<dict.length; i++) {
//         vec.push(dict[i][key]);
//     }
//     return vec;
// }

// // finds matches to specific value given key
// var vec = function matchingValue(dict,key,value) {
//   vec = []
//   for (i=0; i<dict.length; i++) {
//     if (dict[i][key]==value) {
//         vec.push(dict[i]);
//     }
//   }
//   return vec;
// }

// // add entry to dictionary object
// var dict = function addEntry(dict,key,value) {
//   for (i=0; i<dict.length; i++) {
//       dict[i][key] = value;
//   }
//   return dict;
// }

// // make integer series from lb (lower) to ub (upper)
// var series = function makeSeries(lb,ub) {
//     series = new Array();
//     if (ub<=lb) {
//       throw new Error("Upper bound should be greater than lower bound!");
//     }
//    for (var i = lb; i<(ub+1); i++) {
//       series = series.concat(i);
//    }
//    return series;
// }
