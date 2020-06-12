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
      $('#feedback').html("YOUR TURN").show();
      $('#feedback').css('border-color', "#56be2d")
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
      // $('#feedback').html("&nbsp;").hide();
      $('#feedback').html("Waiting for partner's instructions...").show();
      $('#feedback').css('border-color', "red")
      $("#roleLabel").text("You are the builder.");
      $('#instructions').text("Click and place blocks to build the structure\
                                 your partner is describing.");

    }

    $("#chat-history").show();    
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

  dropdownTip(event){
    var game = event.data.game;
    var data = $(this).find('option:selected').val();
    console.log(data);
    var commands = data.split('::');
    switch(commands[0]) {
    case 'language' :
      game.data = _.extend(game.data, {'nativeEnglish' : commands[1]}); break;
    case 'partner' :
      game.data = _.extend(game.data, {'ratePartner' : commands[1]}); break;
    case 'human' :
      $('#humanResult').show();
      game.data = _.extend(game.data, {'isHuman' : commands[1]}); break;
    case 'didCorrectly' :
      game.data = _.extend(game.data, {'confused' : commands[1]}); break;
    }
  }

  submit (event) {
    $('#button_error').show();
    var game = event.data.game;
    game.data = _.extend(game.data, {
      'comments' : $('#comments').val().trim(),
      'strategy' : $('#strategy').val().trim(),
      'partnerStrategy' : $('#partner_strategy').val().trim(),    
      'role' : game.my_role,
      'totalLength' : Date.now() - game.startTime
    });
    game.submitted = true;
    console.log("data is...");
    console.log(game.data);
    console.log(game.socket);
    game.socket.send("exitSurvey." + JSON.stringify(game.data));
    if(_.size(game.urlParams) >= 4) {
      window.opener.turk.submit(game.data, true);
      window.close(); 
    } else {
      console.log("would have submitted the following :")
      console.log(game.data);
    }
  }
}

module.exports = new UI();
