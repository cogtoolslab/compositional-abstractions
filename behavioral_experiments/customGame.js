var _ = require('lodash');
var fs = require('fs');
var assert = require('assert');
var utils = require(__base + 'static/js/sharedUtils.js');
var ServerGame = require(__base + 'static/js/game.js')['ServerGame'];

class ServerRefGame extends ServerGame {
  constructor(config) {
    super(config);
    this.numRounds = config.numRounds;
    this.playerRoleNames = {
      role1: 'speaker',
      role2: 'listener'
    }
    this.trialList = this.makeTrialList();
  }

  customEvents(socket) {
    socket.on('endRound', function (data) {
      var all = socket.game.activePlayers();
      setTimeout(function () {
        _.map(all, function (p) {
          p.player.instance.emit('updateScore', data);
        });
      }, 1000);
      socket.game.newRound(4000);
    });
  }

  // *
  // * TrialList creation
  // *

  getRandomizedConditions() {
    var numEach = this.numRounds / 3;
    var conditions = [].concat(utils.fillArray("equal", numEach),
      utils.fillArray("closer", numEach),
      utils.fillArray("further", numEach));
    return _.shuffle(conditions);
  };

  makeTrialList() {
    var conditionList = this.getRandomizedConditions();
    var trialList = [];
    for (var i = 0; i < conditionList.length; i++) {
      var condition = conditionList[i];
      var trialInfo = this.sampleTrial(condition); // Sample three objects 
      var roleNames = _.values(this.playerRoleNames);
      trialList.push({
        stimuli: trialInfo,
        condition: condition,
        roles: _.zipObject(_.map(this.players, p => p.id), roleNames)
      });
    };
    return (trialList);
  };

  sampleTrial(condition) {
    var opts = { fixedL: true };
    var target = { color: utils.randomColor(opts), targetStatus: "target" };
    var firstDistractor = { color: utils.randomColor(opts), targetStatus: "distr1" };
    var secondDistractor = { color: utils.randomColor(opts), targetStatus: "distr2" };
    if (this.checkItem(condition, target, firstDistractor, secondDistractor)) {
      // attach "condition" to each stimulus object
      return [target, firstDistractor, secondDistractor];
    } else { // Try again if something is wrong
      return this.sampleTrial(condition);
    }
  };

  checkItem(condition, target, firstDistractor, secondDistractor) {
    var f = 5; // floor difference
    var t = 20; // threshold
    var targetVsDistr1 = utils.colorDiff(target.color, firstDistractor.color);
    var targetVsDistr2 = utils.colorDiff(target.color, secondDistractor.color);
    var distr1VsDistr2 = utils.colorDiff(firstDistractor.color, secondDistractor.color);
    if (targetVsDistr1 < f || targetVsDistr2 < f || distr1VsDistr2 < f) {
      return false;
    } else if (condition === "equal") {
      return targetVsDistr1 > t && targetVsDistr2 > t && distr1VsDistr2 > t;
    } else if (condition === "closer") {
      return targetVsDistr1 < t && targetVsDistr2 < t && distr1VsDistr2 < t;
    } else if (condition === "further") {
      return targetVsDistr1 < t && targetVsDistr2 > t && distr1VsDistr2 > t;
    } else {
      throw "condition name (" + condition + ") not known";
    }
  };

  onMessage(client, message) {
    //Cut the message up into sub components
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
        console.log('received end turn');
        _.map(all, p => p.player.instance.emit('switchTurn', {
          user: client.userid
        }));
        break;

      case 'endTrial':
        _.map(all, p => p.player.instance.emit('updateScore', {
          outcome: message_parts[2]
        }));
        setTimeout(function () {
          _.map(all, function (p) {
            p.player.instance.emit('newRoundUpdate', { user: client.userid });
          });
          gc.newRound();
        }, 3000);

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
    // function commonOutput (client, message_data) {
    //   //var target = client.game.currStim.target;
    //   //var distractor = target == 'g1' ? 'g0' : 'g1';
    //   return {
    // 	iterationName: client.game.iterationName,
    // 	gameid: client.game.id,
    // 	time: Date.now(),
    // 	workerId: client.workerid,
    // 	assignmentId: client.assignmentid,
    // 	trialNum: client.game.roundNum,
    // 	trialType: client.game.currStim.currGoalType,
    // 	// targetGoalSet: client.game.currStim.goalSets[target],
    // 	// distractorGoalSet: client.game.currStim.goalSets[distractor],
    // 	firstRole: client.game.firstRole
    //   };
    // };

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


    // var messageOutput = function(client, message_data) {
    //   return _.extend(
    // 	commonOutput(client, message_data), {
    // 	  cardAskedAbout: message_data[1],
    // 	  sender: message_data[4],
    // 	  timeFromRoundStart: message_data[3]
    // 	}
    //   );
    // };

    return {
      // 'chatMessage' : emptyF,
      // 'reveal' : emptyF,
      // 'exitSurvey' : emptyF
    };
  }
}


module.exports = ServerRefGame;
