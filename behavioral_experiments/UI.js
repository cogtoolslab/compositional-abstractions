var BlockUniverse = require('./static/js/experimentEnvironment.js');
var Confetti = require('./static/js/confetti.js');
var confetti = new Confetti(300);

class UI {
  // Since all the action is happening in experimentEnvironment, this
  // is basically a glorified wrapper
  constructor () {
    this.blockUniverse = new BlockUniverse();
  }

  reset (game, data) {
    this.blockUniverse.setupEnvs(game.currStim);

    if(game.role == 'speaker') {
      $('#experiment-button-col').show();
      $('#environment-canvas').hide();
      $('#stimulus-canvas').show();
      $('#send-structure').hide();
    } else if(game.role == 'listener') {
      $('#experiment-button-col').hide();
      $('#environment-canvas').show();
      $('#stimulus-canvas').hide();
      $('#chatbox').hide();
      $('#send-message').hide();
    }
    
    $("#chat-history").show();
    $("#feedback").html("");
    $("#trial-counter").text('trial ' + (game.trialNum + 1) + '/24');
    $("#story").empty();
    $("#response-form").show();    
    $("#send-message").prop("disabled", false);
    $('#reproduction').prop('disabled', false);    
    $('#send-structure').prop('disabled', true);
    $("#send-message").html("Send");
    $("#reproduction").focus();
  }
}

module.exports = new UI();
