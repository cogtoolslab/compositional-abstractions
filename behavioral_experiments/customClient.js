var UI = require('./UI.js');
var stim = require('./static/js/stimList.js');

// Update client versions of variables with data received from
// server_send_update function in game.core.js
// -- data: packet send by server

function updateState(game, data) {
  game.speakerTurn = true;
  UI.blockUniverse.disabledBlockPlacement = true;
  console.log('id: ' + game.my_id);

  game.role = data.currStim.roles[game.my_id];
  console.log('my role', game.role);
  game.currStim = {
    targetBlocks: stim.makeScene('T','C')

      // { "x": 1, "y": 0, "width": 2, "height": 4 },
      // { "x": 5, "y": 0, "width": 2, "height": 4 },
      // { "x": 2, "y": 4, "width": 4, "height": 2 }
      //stonehenge
      // { "x": 1, "y": 0, "width": 1, "height": 2},
      // { "x": 4, "y": 0, "width": 1, "height": 2 },
      // { "x": 1, "y": 2, "width": 2, "height": 1 },
      // { "x": 3, "y": 2, "width": 2, "height": 1 },
      // // Tall C
      // { "x": 8, "y": 0, "width": 2, "height": 1 },
      // { "x": 8, "y": 1, "width": 1, "height": 2 },
      // { "x": 8, "y": 3, "width": 1, "height": 2 },
      // { "x": 8, "y": 5, "width": 2, "height": 1 },
      // L
      // { "x": 7, "y": 1, "width": 1, "height": 2 },
      // { "x": 7, "y": 3, "width": 1, "height": 2 },
      // { "x": 7, "y": 0, "width": 2, "height": 1 },
      // { "x": 9, "y": 0, "width": 2, "height": 1 },
      // reverse L
      // { "x": 10, "y": 1, "width": 1, "height": 2 },
      // { "x": 10, "y": 3, "width": 1, "height": 2 },
      // { "x": 7, "y": 0, "width": 2, "height": 1 },
      // { "x": 9, "y": 0, "width": 2, "height": 1 },
      // T
      // { "x": 8, "y": 0, "width": 1, "height": 2 },
      // { "x": 9, "y": 0, "width": 1, "height": 2 },
      // { "x": 7, "y": 2, "width": 2, "height": 1 },
      // { "x": 9, "y": 2, "width": 2, "height": 1 },
    ,
    condition: 'repeated',
    blockColor: '#a10316',
    blockFell: false
  };
  game.active = data.active;
  game.roundNum = data.roundNum;
  game.roundStartTime = Date.now();
  $('#chatbox').prop('disabled', game.speakerTurn && game.role == 'listener' || !game.speakerTurn && game.role == 'speaker');

  UI.blockUniverse.blockSender = function(blockData){
    game.socket.emit('sendBlock', blockData);
  };

};

var customEvents = function (game) {

  $('#done_button').click(() => {
    game.socket.send('endTrial');
    removeEnv();
  })

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
    }
    // This prevents the form from submitting & disconnecting person
    return false;


  });

  //change this to done
  // $("#send-structure").click(() => {
  //   //check if any blocks placed this turn
  //   console.log("send structure");
  //   let blocksPlaced = true;

  //   if (blocksPlaced) {
  //     // if so send block
  //     // game.socket.emit('sendStructure', UI.blockUniverse.sendingBlocks);
  //     game.socket.send('switchTurn');
  //     // This prevents the form from submitting & disconnecting person

  //     blocksPlaced = false;
  //     return false;

  //     //reset block counter (for turn)

  //   } else {
  //     alert('Please place a block');
  //   }

  // });

  game.socket.on('sendBlock', function (data) {
    UI.blockUniverse.sendingBlocks.push(data.block);
  });

  game.socket.on('switchTurn', function (data) {
    game.speakerTurn = !game.speakerTurn
    $('#chatbox').prop('disabled', game.speakerTurn && game.role == 'listener' || !game.speakerTurn && game.role == 'speaker');
    $('#send-structure').prop('disabled', game.speakerTurn);
    $('#send-message').prop('disabled', !game.speakerTurn);
    UI.blockUniverse.disabledBlockPlacement = game.speakerTurn;
  });

  game.socket.on('chatMessage', function (data) {
    var source = data.user === game.my_id ? "you" : "partner";
    var color = data.user === game.my_id ? "#A9A9A9" : "#000000";
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
    if (data.active) {
      updateState(game, data);
      UI.reset(game, data);
    }
  });
};

$(document).keypress(e => {
  if (e.which === 13) {
    $("#send-message").click();
    return false;
  }
});

module.exports = customEvents;
