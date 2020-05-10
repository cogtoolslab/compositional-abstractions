var UI = require('./UI.js');
var stim = require('./static/js/stimList.js');

// Update client versions of variables with data received from
// server_send_update function in game.core.js
// -- data: packet send by server

function updateState(game, data) {
  console.log('updating local state with data from server', data);
  game.active = data.active;
  game.trialNum = data.currStim.trialNum;
  game.repNum = data.currStim.repNum;
  game.roundStartTime = Date.now();
  game.speakerTurn = true;
  game.role = data.currStim.roles[game.my_id];
  game.currStim = {
    targetBlocks: stim.makeScene(data.currStim.stimulus)
  };
  game.blocksInStructure = game.currStim.targetBlocks.length;
  game.blockNum = 0;
  $('#chatbox').prop('disabled', game.speakerTurn && game.role == 'listener' ||
		     !game.speakerTurn && game.role == 'speaker');

  UI.blockUniverse.disabledBlockPlacement = true;
  UI.blockUniverse.blockSender = function (blockData) {
    game.socket.send('block.' + JSON.stringify(_.extend(blockData, { blockNum: game.blockNum })));

    //end trial when 8 blocks have been placed
    console.log("blockNum in updateState:", game.blockNum);
    if(game.blockNum == game.blocksInStructure - 1){
      game.socket.send('endTrial');
    }
  };
};

var customEvents = function (game) {
  $('#done_button').click(() => {
    game.socket.send('endTrial');
  });

  $('#reset_button').click(() => {
    //game.socket.send('reset');
    UI.blockUniverse.removeEnv();
    UI.blockUniverse.removeStimWindow();
    UI.blockUniverse.setupEnvs(game.currStim);
  })

  // TOGGLE TURNS IN HERE?
  $("#send-message").click(() => {
    console.log("message", game.speakerTurn);
    // if (game.speakerTurn && game.role == 'speaker' || !game.speakerTurn && game.role == 'listener') {
    var origMsg = $('#chatbox').val();
    var timeElapsed = Date.now() - game.typingStartTime;
    var msg = ['chatMessage', origMsg.replace(/\./g, '~~~'), timeElapsed].join('.');
    if ($('#chatbox').val() != '') {
      game.socket.send(msg);
      game.socket.send('switchTurn');
      game.sentTyping = false;
      $('#chatbox').val('');
      $('#charRemain').text(100); //reset char Limit counter for text box
      $('#partnerTyping').hide();
    }
    // This prevents the form from submitting & disconnecting person
    return false;
  });

  $("#end-turn").click(() => {
    //check if any blocks placed this turn
    let blocksPlaced = true;
    if (blocksPlaced) {
      // if so send block
      game.socket.send('switchTurn');
      blocksPlaced = false;

      // This prevents the form from submitting & disconnecting person
      return false;
    } else {
      alert('Please place a block');
    }
  });

  //update textbox with remaining character count
  $("#chatbox").keyup(function (e) {
    $('#charRemain').text($('#chatbox').attr('maxlength') - ($("#chatbox").val().length));
      game.socket.send('typing');
  });

  game.socket.on('feedback', function(data) {
    // display feedback here
    if (game.role == 'listener'){
      UI.blockUniverse.revealTarget = true;
    } 
  });

  game.socket.on('typing', function (data) {
    if (game.role == 'listener'){
      $('#partnerTyping').show();
    }  
  });

  game.socket.on('block', function (data) {
    game.blockNum +=1;
    $('#blocksPlaced').text(game.blockNum);
    UI.blockUniverse.sendingBlocks.push(data.block);
    if (game.blockNum == game.blocksInStructure){
      UI.blockUniverse.disabledBlockPlacement = true;
    }
  });

  game.socket.on('switchTurn', function (data) {
    game.speakerTurn = !game.speakerTurn;
    $('#chatbox').prop('disabled', game.speakerTurn && game.role == 'listener'
		       || !game.speakerTurn && game.role == 'speaker');
    $('#end-turn').prop('disabled', game.speakerTurn);
    $('#send-message').prop('disabled', !game.speakerTurn);
    UI.blockUniverse.disabledBlockPlacement = game.speakerTurn;
  });


  game.socket.on('chatMessage', function (data) {
    var source = data.user === game.my_id ? "you" : "partner";
    var color = data.user === game.my_id ? "#A9A9A9" : "#000000";
    //hide for both when message sent
    $('#partnerTyping').hide();
    // To bar responses until speaker has uttered at least one message
    game.messageSent = true;
    $('#messages')
      .append('<p style="padding: 5px 10px; color: ' + color + '">' +
        source + ": " + data.msg + "</p>")
      .stop(true, true)
      .animate({
        scrollTop: $("#messages").prop("scrollHeight")
      }, 800);
    console.log('done');
  });

  game.socket.on('newRoundUpdate', function (data) {
    console.log('received newroundupdate');

    // reset variables here
    UI.blockUniverse.sendingBlocks = [];
    UI.blockUniverse.revealTarget = false;

    if (data.active) {
      $('#blocksPlaced').text(0);
      updateState(game, data);
      UI.reset(game, data);
    };
  });
};

// $(document).keypress(e => {
//   if (e.which === 13) {
//     $("#send-message").click();
//     return false;
//   }
// });

module.exports = customEvents;
