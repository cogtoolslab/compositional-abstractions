/*globals $, dallinger, pubsub, p5 */
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
    // TODO: refactor to get rid of p5env and p5stim globals (e.g. make canvasInteraction part of class)
    this.p5 = buildStage(this.currStim, this.socket);
    p5env = this.p5.env;
    p5stim = this.p5.stim;
    if(this.role == 'speaker') {
      $('#experiment-button-col').hide();
      $('#environment-window').hide();
      $('#stimulus-window').show();
    } else if(this.role == 'listener') {
      $('#experiment-button-col').show();
      $('#environment-window').show();
      $('#stimulus-window').hide();
    }
    
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

  handleDone(msg) {
    // increment and display score
    const numericScore = (_.toNumber(msg.score) * 100).toFixed(0);
    this.score += numericScore;
    $('#score').empty().html(numericScore.toFixed(0));

    // freeze UI
    $("#send-message").prop("disabled", true);
    $('#reproduction').val('');
    $('#reproduction').prop('disabled', true);    

    // display interpetable feedback
    $('#feedback')
      .html(numericScore > 80 ? "Excellent!" : "Nice job.")
      .append("You earned " + numericScore + " cents.");
  }
  
  newRound(msg) {
    this.trialNum = msg['trialNum'];
    this.role = msg['roles']['speaker'] == this.participantid ? 'speaker' : 'listener';
    this.currStim = msg['currStim'];
    this.alreadyClicked = false;
    this.messageSent = false;      
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
    this.socket.subscribe(self.block(this.handleDone.bind(this)), "done", this);    

    // if reset button clicked, reset build a fresh p5 instance
    $('#reset').click(e => {
      resetEnv();
      p5env = new p5(setupEnvironment, 'environment-canvas');
    });

    // if done button clicked, tell the server to advance to next round
    $('#done').click(e => {
      const score = getMatchScore('defaultCanvas0', 'defaultCanvas1', 64);
      console.log('score = ', score);
      clearP5Envs();

      self.socket.broadcast({
	type : 'done',
	participantid : this.participantid,
	networkid: this.networkid,
	score: score
      });  
    })
    
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
