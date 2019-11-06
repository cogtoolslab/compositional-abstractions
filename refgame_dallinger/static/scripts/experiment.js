/*globals $, dallinger */
const ws_scheme = (window.location.protocol === "https:") ? 'wss://' : 'ws://';

class CoordinationChatRoomClient {
  constructor() {
    this.participantid = '';
    this.networkid = '';
    this.role = '';
    this.messageSent = false;
    this.alreadyClicked = false;
    this.score = 0;
    this.bonusAmt = 2;
    this.currStim = [];
    
    // immediately open socket connection for game 
    this.socket = pubsub.Socket({"endpoint": "chat", "broadcast" : "refgame", "control":"refgame"});
    this.socket.open().done(() => this.createAgent());
  }

  createAgent() {
    self = this;
    dallinger.createAgent()
      .done(resp => {
	// initialize game
	self.participantid = resp.node.participant_id;
	self.networkid = resp.node.network_id;
	self.setupHandlers();

	// once we get our node, need to tell the server (again) that we've connected so it can launch
	self.socket.send({
	  'type' : 'connect',
	  participantid: self.participantid,
	  networkid : self.networkid
	});
      })
      .fail(rejection => {
	// A 403 is our signal that it's time to go to the questionnaire
	if (rejection.status === 403) {
          dallinger.allowExit();
          dallinger.goToPage('questionnaire');
	} else {
          dallinger.error(rejection);
	}
      });
  }

  initializeUI() {
    const p5stim, p5env = buildStage(this.currStim);
    $("#chat-history").show();
    $("#feedback").html("");
    $("#trial-counter").text('trial ' + (this.trialNum + 1) + '/24');
    $("#story").empty();
    $("#response-form").show();    
    $("#send-message").prop("disabled", false);
    $('#reproduction').prop('disabled', false);    
    $("#send-message").html("Send");
    $("#reproduction").focus();
  }
  
  handleClickedObj(msg) {
    const correct = msg.object_id == "target";
    
    // freeze UI
    $("#send-message").prop("disabled", true);
    $('#reproduction').val('');
    $('#reproduction').prop('disabled', true);    
    
    // show highlights as outlines
    const targetcolor = this.role == 'speaker' ? '#5DADE2' : '#000000';
    const clickedcolor = correct ? '#32CD32' :'#FF4136';
    $('#target').css({outline: 'solid 10px ' + targetcolor, 'z-index': 2});
    $('#' + msg.object_id).css({outline: 'solid 10px ' + clickedcolor, 'z-index': 3});
    $('#feedback').html(correct ? "Nice! You earned " + this.bonusAmt + " cents." :
			this.role == 'speaker' ? "Oh no! Your partner didn't pick the target!" :
			"Oh no! Your partner was describing a different image.");
    
    // update score
    this.score += correct ? this.bonusAmt : 0;
    const bonus_score = (parseFloat(this.score) / 100).toFixed(2);
    $('#score').empty().append('total bonus: $' + bonus_score);
  }
  
  handleChatReceived (msg) {
    // Only allow to click after speaker produces message
    if(msg.role == 'speaker') {
      this.messageSent = true;
    }

    // Add message to chat log (and scroll to bottom)
    const color = msg.role == this.role ? 'black' : '#1693A5';

    $("#story")
      .append("<p style='color: " + color + ";'>" + msg.content + "</p>")
      .stop(true,true)
      .animate({
	scrollTop: $("#story").prop("scrollHeight")
      }, 800);
  }

  sendMessage (msg) {
    $("#send-message").prop('disabled', true);
    $("#send-message").html("Sending...");
    $("#reproduction").val("");
    $("#reproduction").focus();
    if(msg != '') {
      this.socket.broadcast({
	'type' : 'chatMessage',
	'content' : msg,
	'networkid' : this.networkid,
	'participantid' : this.participantid,
	'role' : this.role
      });
    }
    $("#send-message").prop('disabled', false);
    $("#send-message").html("Send");
  }

  newRound(msg) {
    this.trialNum = msg['trialNum'];
    this.role = msg['roles']['speaker'] == this.participantid ? 'speaker' : 'listener';
    this.currStim = msg['currStim'];
    this.alreadyClicked = false;
    this.messageSent = false;      
    this.initializeStimGrid();
    this.initializeUI();
  }

  block (callback) {
    // only pass to callback if intended for our network
    return msg => {
      if(msg.networkid == this.networkid)
	return callback(msg);
    };
  }
  
  setupHandlers() {
    self = this;
    
    // Handle messages from server
    this.socket.subscribe(self.block(this.newRound.bind(this)), "newRound", this);
    this.socket.subscribe(self.block(this.handleChatReceived.bind(this)), "chatMessage", this);
    this.socket.subscribe(self.block(this.handleClickedObj.bind(this)), "clickedObj", this);
    
    // Send whatever is in the chatbox when button clicked
    $("#send-message").click(() => {
      const msg = $("#reproduction").val();
      self.sendMessage(msg);
    });
    
    // Leave the chatroom.
    $("#leave-chat").click(function() {
      dallinger.goToPage("questionnaire");
    });
  }
}

$(document).keypress(e => {
  if (e.which === 13) {
    $("#send-message").click();
    return false;
  }
});

$(document).ready(() => {
  console.log('ready');
  new CoordinationChatRoomClient();
});
