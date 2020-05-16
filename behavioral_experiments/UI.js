var BlockUniverse = require('./static/js/experimentEnvironment.js');
var Confetti = require('./static/js/confetti.js');
var confetti = new Confetti(300);

class UI {
  // Since all the action is happening in experimentEnvironment, this
  // is basically a glorified wrapper
  constructor() {
    this.blockUniverse = new BlockUniverse();
  }

  reset(game, data) {
    // Need to remove old screens
    if(_.has(this.blockUniverse, 'p5env') ||
       _.has(this.blockUniverse, 'p5stim')) {
      this.blockUniverse.removeEnv();
      this.blockUniverse.removeStimWindow();
    }

    this.blockUniverse.setupEnvs(game.currStim);
    
    if (game.role == 'speaker') {
      $('#experiment-button-col').show();
      $('#environment-canvas').hide();
      $('#stimulus-canvas').show();
      $('#done-button').hide();
      $('#partnerTyping').hide();
      $('#yourTurn').show();
      $("#roleLabel").text("You are the architect.");
      $('#instructions').text("Send instructions to your partner to \
                               help them build the building you see on your screen.");
      // add something to display block menu to speaker
    } else if (game.role == 'listener') {
      $('#partnerTyping').hide();
      $('#charLimit').hide();
      $('#experiment-button-col').hide();
      $('#environment-canvas').show();
      $('#stimulus-canvas').hide();
      $('#chatbox').hide();
      $('#send-message').hide();
      $('#yourTurn').hide();
      $("#roleLabel").text("You are the builder.");
      $('#instructions').text("Click and place blocks to build the structure\
                                 your partner is describing.");

    }

    $("#chat-history").show();
    $("#feedback").html("&nbsp;");
    $("#messages").html("");
    $('#waiting').html('');
    $('#main_div').show();
    

    // Update counters
    $("#block-counter").text('0/' + game.blocksInStructure + ' blocks placed');
    $("#score-counter").text('Total bonus: $' + String(game.cumulativeBonus.toFixed(2)));
    if(game.trialNum === 'practice') {
      $("#trial-counter").text("Practice building the tower!");
    } else {
      $("#trial-counter").text('trial ' + (game.trialNum + 1) + '/12');
    }
    $("#story").empty();
    $("#response-form").show();
    $("#send-message").prop("disabled", false);
    $('#reproduction').prop('disabled', false);
    $('#done-button').prop('disabled', true);
    $("#send-message").html("Send");
    $("#reproduction").focus();
  }
}

module.exports = new UI();
