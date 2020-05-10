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
      $('#end-turn').hide();
      $('#partnerTyping').hide();
      // add something to display block menu to speaker
    } else if (game.role == 'listener') {
      $('#partnerTyping').hide();
      $('#charLimit').hide();
      $('#experiment-button-col').hide();
      $('#environment-canvas').show();
      $('#stimulus-canvas').hide();
      $('#chatbox').hide();
      $('#send-message').hide();
    }

    $("#chat-history").show();
    $("#feedback").html("");
    $('#waiting').html('');
    $('#main_div').show();
    $("#trial-counter").text('trial ' + (game.trialNum + 1) + '/12');
    $("#story").empty();
    $("#response-form").show();
    $("#send-message").prop("disabled", false);
    $('#reproduction').prop('disabled', false);
    $('#end-turn').prop('disabled', true);
    $("#send-message").html("Send");
    $("#reproduction").focus();
  }
}

module.exports = new UI();
