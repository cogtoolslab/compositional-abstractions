var BlockUniverse = require("./experimentEnvironment.js");
var Confetti = require("./confetti.js");
var stim = require("./stimList.js");
var scoring = require("./scoring.js");
var _ = require("lodash");

window.onload = function () {
  var customConfig = require("../../config.json");
  practiceUI = new PracticeUI();
  practiceUI.reset();
};

class PracticeUI {
  // Since all the action is happening in experimentEnvironment, this
  // is basically a glorified wrapper
  constructor() {
    this.blockUniverse = new BlockUniverse();
    this.confetti = new Confetti(300);
    this.targetBlocks = stim.makeBuildPracticeScene();
    this.targetMap = scoring.getDiscreteWorld(this.targetBlocks);
    this.blockNum = 0;
    this.failedAttempts = 0;
    this.attemptsAllowed = 3;
    $("#attempt-counter").text(
      this.attemptsAllowed - this.failedAttempts + " attempts left"
    );
    $("#practice-feedback").hide();
    $("#block-counter").text(
      "0/" + String(this.targetBlocks.length) + " blocks placed"
    );
    $("#done-button").hide();

    this.practiceStim = {
      targetBlocks: this.targetBlocks,
    };
    this.blocksInStructure = this.targetBlocks.length;

    this.blockUniverse.ui = this;

    this.blockUniverse.blockSender = function (blockData) {
      $("#block-counter").text(
        String(blockData.blockNum) +
          "/" +
          String(this.targetBlocks.length) +
          " blocks placed"
      );
      if (blockData.blockNum == this.blocksInStructure) {
        this.submitAttempt();
      }
    }.bind(this);
  }

  // Get URL params to pass along
  submitAttempt() {
    this.blockUniverse.disabledBlockPlacement = true;

    var finalState = scoring.getDiscreteWorld(this.blockUniverse.sendingBlocks);
    var trialScore = scoring.getScoreDiscrete(this.targetMap, finalState);
    console.log("score", trialScore);
    if (parseInt(trialScore) < 100) { //haven't passed practice
      this.failedAttempts += 1;

      if (this.failedAttempts < this.attemptsAllowed) {

        let attemptString = this.failedAttempts != this.attemptsAllowed-1 ? (this.attemptsAllowed - this.failedAttempts) + " attempts left" : "1 attempt left";
        $("#practice-feedback").text("Oops, that's not quite right- you have " + attemptString);

        if (this.failedAttempts == this.attemptsAllowed - 1) {
          $("#attempt-counter").text("last try!");
        } else {
          $("#attempt-counter").text(attemptString);
        }

        $("#practice-feedback").show();
        setTimeout(function () {
          $("#practice-feedback").hide();
          this.reset();
        }.bind(this), 3000);

      } else {
        $("#practice-feedback").hide();
          // update attempts remaining
          if (this.failedAttempts == this.attemptsAllowed) {
            location.replace(
              "./fail.html?workerId=" +
                urlParams.workerId +
                "&assignmentId=" +
                urlParams.assignmentId +
                "&hitId=" +
                urlParams.hitId +
                "&turkSubmitTo=" +
                urlParams.turkSubmitTo +
                "&failType=soloPractice"
            );
        }
      }
        //$("#practice-feedback").show()
    } else {
      // advance to real experiment
      location.replace(
        "./../../index.html?workerId=" +
          urlParams.workerId +
          "&assignmentId=" +
          urlParams.assignmentId +
          "&hitId=" +
          urlParams.hitId +
          "&turkSubmitTo=" +
          urlParams.turkSubmitTo +
          "&qAs=" +
          urlParams.qAs + 
          "&individualPracticeAttempts=" +
          this.failedAttempts
      );
    }

  }

  reset() {
    // Need to remove old screens
    if (
      _.has(this.blockUniverse, "p5env") ||
      _.has(this.blockUniverse, "p5stim")
    ) {
      this.blockUniverse.removeEnv();
      this.blockUniverse.removeStimWindow();
    }
    this.blockUniverse.sendingBlocks = [];

    this.confetti.reset();

    this.blockNum = 0;
    $("#block-counter").text(
      "0/" + String(this.targetBlocks.length) + " blocks placed"
    );

    this.targetMap = scoring.getDiscreteWorld(this.targetBlocks); // Add discrete map for scoring
    this.blockUniverse.setupEnvs(this.practiceStim);
    this.blockUniverse.disabledBlockPlacement = false;
  }
}
