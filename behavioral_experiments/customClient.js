var UI = require('./UI.js');

// Update client versions of variables with data received from
// server_send_update function in game.core.js
// -- data: packet send by server
function updateState (game, data){
  console.log('id: ' + game.my_id);
  
  game.role = data.currStim.roles[game.my_id];
  console.log('my role', game.role);
  game.currStim = {
    targetBlocks: [
      {"x": 1, "y": 0, "width": 2, "height": 4},
      {"x": 5, "y": 0, "width": 2, "height": 4},
      {"x": 2, "y": 4, "width": 4, "height": 2}
    ],
    condition: 'repeated',
    blockColor: 'blue',
    blockFell: false
  };
  game.active = data.active;
  game.roundNum = data.roundNum;
  game.roundStartTime = Date.now();
};

var customEvents = function(game) {
 
  $('#response-form').submit(function(){
    var origMsg = $('#chatbox').val();
    var timeElapsed = Date.now() - game.typingStartTime;
    var msg = ['chatMessage', origMsg.replace(/\./g, '~~~'), timeElapsed].join('.');
    if($('#chatbox').val() != '') {
      game.socket.send(msg);
      game.sentTyping = false;
      $('#chatbox').val('');
    }
    // This prevents the form from submitting & disconnecting person
    return false;
  });
 
  game.socket.on('chatMessage', function(data){
    var source = data.user === game.my_id ? "you" : "partner";    
    var color = data.user === game.my_id ? "#363636" : "#707070";    
    // To bar responses until speaker has uttered at least one message
    game.messageSent = true;
    $('#messages')
      .append($('<li style="padding: 5px 10px; background: ' + color + '">')
    	      .text(source + ": " + data.msg))
      .stop(true,true)
      .animate({
	scrollTop: $("#messages").prop("scrollHeight")
      }, 800);
    console.log('done');
  });
  
  game.socket.on('newRoundUpdate', function(data){
    console.log('received newroundupdate');
    if(data.active) {
      updateState(game, data);
      UI.reset(game, data);
    }
  });
};


module.exports = customEvents;
