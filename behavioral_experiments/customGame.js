var _ = require('lodash');
var fs = require('fs');
var assert = require('assert');
var utils = require(__base + 'static/js/sharedUtils.js');
var ServerGame = require(__base + 'static/js/game.js')['ServerGame'];
var stimList = require(__base + 'static/js/stimList.js');

class ServerRefGame extends ServerGame {
  constructor(config) {
    super(config);
    this.numRounds = config.numRounds;
    this.playerRoleNames = {
      role1: 'speaker',
      role2: 'listener'
    }
    this.trialList = this.makeTrialList();
    this.turnNum = 0;
    console.log(this.trialList);
  }

  customEvents(socket) {
    socket.on('sendStructure', function (blocks) {
      var all = socket.game.activePlayers(); // sends data to everyone
      _.map(all, p => p.player.instance.emit('sendStructure', {
        blocks: blocks
      }));
    });
  }

  // *
  // * TrialList creation
  // *
  makeTrialList() {
    var trialList = [];
    var numReps = 4;
    var numTrialsPerRep = 3;

    // Sample a set of `numTrialsPerRep` towers to repeat...
    var possibleObjects = stimList.getPossibleObjects();
    var combinations = _.sampleSize(utils.k_combinations(possibleObjects, 2), numTrialsPerRep);
    var roles = _.zipObject(_.map(this.players, p => p.id), _.values(this.playerRoleNames));
    
    // Start with a practice trial
    trialList.push({
      stimulus: _.shuffle(['horizontal', 'vertical']),
      repNum: "practice",
      trialNum: "practice",
      roles: roles
    });
    
    // An outer loop of repetitions
    _.forEach(_.range(numReps), repNum => {
      // Shuffle the sequence you see each of these towers per repetition
      _.forEach(_.shuffle(combinations), (tower, towerNum) => {
        trialList.push({
          stimulus: tower,
          repNum: repNum,
          trialNum: repNum + towerNum,
          roles: roles
        });
      });
    });
    return trialList;
  };

  onMessage(client, message) {
    //Cut the message up into sub components
    console.log(message)
    var message_parts = message.split('.');
    
    //The first is always the type of message
    var message_type = message_parts[0];

    //Extract important variables
    var gc = client.game;
    var id = gc.id;
    var all = gc.activePlayers();
    var target = gc.getPlayer(client.userid);
    var others = gc.getOthers(client.userid);
    switch (message_type) {
      case 'block':
        _.map(all, p => p.player.instance.emit('block', {
          block: JSON.parse(message_parts[1]).block
        }));
        break;

      case 'chatMessage':
        console.log('received chat message');
        if (client.game.playerCount == gc.playersThreshold && !gc.paused) {
          var msg = message_parts[1].replace(/~~~/g, '.');
          console.log(msg);
          _.map(all, p => p.player.instance.emit('chatMessage', {
            user: client.userid, msg: msg
          }));
        }
        break;

      case 'switchTurn':
        gc.turnNum += 1;
        _.map(all, p => p.player.instance.emit('switchTurn', {
          user: client.userid
        }));
        break;

        case 'typing':
          _.map(all, p => p.player.instance.emit('typing', {
            user: client.userid
          }));
          break;

      case 'endTrial':
      // reset turnNum
      gc.turnNum = 0;
      var trialData = JSON.parse(message_parts[1]);
      let practiceFail = false;

      // Force repeat of practice round if not perfect
      if(this.currStim.trialNum == 'practice' && trialData.score < 100) {
        gc.roundNum -= 1;
        practiceFail = true;
      }

      // Send feedback
      _.map(all, p => p.player.instance.emit('feedback', {
        score: trialData.score,
        practice_fail: practiceFail
      }));

      setTimeout(function () {
        gc.newRound();
      }, 5000);

        break;

      case 'exitSurvey':
        console.log(message_parts.slice(1));
         break;

      case 'h': // Receive message when browser focus shifts
        //target.visible = message_parts[1];
        break;
    }
  };

  /*
    Associates events in onMessage with callback returning json to be saved
    {
    <eventName>: (client, message_parts) => {<datajson>}
    }
    Note: If no function provided for an event, no data will be written
  */
  dataOutput() {
    function commonOutput(client, message_data) {
      return {
        iterationName: client.game.iterationName,
        gameid: client.game.id,
        time: Date.now(),
        workerId: client.workerid,
        assignmentId: client.assignmentid,
        leftTarget: client.game.currStim.stimulus[0],
        rightTarget: client.game.currStim.stimulus[1],
        trialNum: client.game.currStim.trialNum,
        turnNum: client.game.turnNum,
        repNum: client.game.currStim.repNum
      };
    };

    // var revealOutput = function(client, message_data) {
    //   var selections = message_data.slice(3);
    //   var allObjs = client.game.currStim.hiddenCards;
    //   return _.extend(
    // 	commonOutput(client, message_data), {
    // 	  sender: message_data[1],
    // 	  timeFromMessage: message_data[2],
    // 	  revealedObjs : selections,
    // 	  numRevealed : selections.length,
    // 	  fullContext: JSON.stringify(_.map(allObjs, v => {
    // 	    return _.omit(v, ['rank', 'suit', 'url']);
    // 	  }))
    // 	});
    // };


    // var exitSurveyOutput = function(client, message_data) {
    //   var subjInfo = JSON.parse(message_data.slice(1));
    //   return _.extend(
    // 	_.omit(commonOutput(client, message_data),
    // 	       ['targetGoalSet', 'distractorGoalSet', 'trialType', 'trialNum']),
    // 	subjInfo);
    // };


    var messageOutput = function (client, message_data) {
      return _.extend(
        commonOutput(client, message_data), {
        content: message_data[1]
      }
      );
    };

    var blockOutput = function (client, message_data) {
      var parsedData = JSON.parse(message_data[1]);
      return _.extend(
        commonOutput(client, message_data), {
        block: JSON.stringify(parsedData['block']),
        blockNum: parsedData['blockNum']
      }
      );
    };

    return {
      'chatMessage': messageOutput,
      'block': blockOutput
      // 'exitSurvey' : emptyF
    };
  }
}


module.exports = ServerRefGame;
