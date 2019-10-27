var Confetti = require('./src/confetti.js');
var confetti = new Confetti(300);

// This gets called when someone selects something in the menu during the 
// exit survey... collects data from drop-down menus and submits using mmturkey
function dropdownTip(data){
  var commands = data.split('::');
  switch(commands[0]) {
  case 'human' :
    $('#humanResult').show();
    globalGame.data = _.extend(globalGame.data, 
			       {'thinksHuman' : commands[1]}); break;
  case 'language' :
    globalGame.data = _.extend(globalGame.data, 
			       {'nativeEnglish' : commands[1]}); break;
  case 'partner' :
    globalGame.data = _.extend(globalGame.data,
			       {'ratePartner' : commands[1]}); break;
  case 'confused' :
    globalGame.data = _.extend(globalGame.data,
			       {'confused' : commands[1]}); break;
  case 'submit' :
    globalGame.data = _.extend(globalGame.data, 
			       {'comments' : $('#comments').val(),
				'strategy' : $('#strategy').val(),
				'role' : globalGame.my_role,
				'totalLength' : Date.now() - globalGame.startTime});
    globalGame.submitted = true;
    console.log("data is...");
    console.log(globalGame.data);
    if(_.size(globalGame.urlParams) >= 4) {
      globalGame.socket.send("exitSurvey." + JSON.stringify(globalGame.data));
      window.opener.turk.submit(globalGame.data, true);
      window.close(); 
    } else {
      console.log("would have submitted the following :")
      console.log(globalGame.data);
    }
    break;
  }
}

function setupListenerHandlers(game) {
  $('div.pressable').click(function(event) {
    // Only let listener click once they've heard answer back
    if(game.messageSent) {
      var clickedId = $(this).attr('id');
      game.sendResponse(clickedId);
      console.log('highlighting clicked');
      $(this).css({
	'border-color' : '#FFFFFF', 
	'border-width' : '10px', 
	'border-style' : 'solid'
      });
      console.log('highlighting target');
      $('#target').css({
	'border-color' : '#458B00', 
	'border-width' : '10px', 
	'border-style' : 'solid'
      });

    }
  });
}

function initGrid(game) {
  // Add objects to grid
  _.forEach(game.currStim, (stim, i) => {
    console.log(stim);
    var div = $('<div/>')
	  .addClass('pressable')
	  .attr({'id' : stim.targetStatus})
	  .css({
	    'position': 'relative',
	    'grid-row': 1, 'grid-column': i+1,
	    'background' : 'rgb(' + stim.color.join(',') + ')'
	  });
    $("#object_grid").append(div);
  });

  // Allow listener to click on things
  game.selections = [];
  if (game.my_role === game.playerRoleNames.role2) {
    console.log('seting up');
    setupListenerHandlers(game);
  }

}

function drawScreen (game) {
  var player = game.getPlayer(game.my_id);
  if (player.message) {
    $('#waiting').html(this.player.message);
  } else {
    $('#waiting').html('');
    confetti.reset();
    initGrid(game);
    
  }
};

function reset (game, data) {
  $('#scoreupdate').html(" ");
  if(game.roundNum + 1 > game.numRounds) {
    $('#roundnumber').empty();
    $('#instructs').empty()
      .append("Round\n" + (game.roundNum + 1) + "/" + game.numRounds);
  } else {
    $('#feedback').empty();
    $('#roundnumber').empty()
      .append("Round\n" + (game.roundNum + 1) + "/" + game.numRounds);
  }

  $('#main').show();

  // reset labels
  // Update w/ role (can only move stuff if agent)
  $('#roleLabel').empty().append("You are the " + game.my_role + '.');
  $('#instructs').empty();
  $("#object_grid").empty();
  if(game.my_role === game.playerRoleNames.role1) {
    $('#leaderchatarea').show();
    $('#helperchatarea').hide();          
    $('#instructs')
      .append("<p>Fill in the question so your partner</p> " +
	      "<p>can help you complete the highlighted combo!</p>");
  } else if(game.my_role === game.playerRoleNames.role2) {
    $('#chatarea').hide();
    $('#instructs')
      .append("<p>After your partner types their question, </p>" 
	      + "<p>select up to <b>two</b> cards to complete their combo!</p>");
    // $('#yes_button').click({game: game, response: 'yes'}, giveAdditionalInfo);
    // $('#no_button').click({game: game, response: 'no'}, giveAdditionalInfo);
  }
  drawScreen(game);
}

module.exports = {
  confetti,
  drawScreen,
  reset
};
