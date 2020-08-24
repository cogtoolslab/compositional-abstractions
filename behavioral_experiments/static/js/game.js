var player = require('./player.js');
var io = require('socket.io-client');
var _ = require('lodash');

class Game {
  constructor(config) {
    this.roundNum = -1;

    this.email = config.email;
    this.projectName = config.projectName;
    this.experimentName = config.experimentName;
    this.iterationName = config.iterationName;
    this.anonymizeCSV = config.anonymizeCSV;
    this.bonusAmt = config.bonusAmt;
    this.dataStore = config.dataStore;
    this.playersThreshold = config.playersThreshold;
    this.playerRoleNames = config.playerRoleNames;
    this.numHorizontalCells = config.numHorizontalCells;
    this.numVerticalCells = config.numVerticalCells;
    this.cellDimensions = config.cellDimensions;
    this.cellPadding = config.cellPadding;
    this.world = {
      height: this.cellDimensions.height * this.numVerticalCells,
      width: this.cellDimensions.width * this.numHorizontalCells
    },
      this.delay = config.delay;
  }
 

  // Returns player object corresponding to id
  getPlayer(id) {
    return _.find(this.players, { id: id })['player'];
  };

  // Returns all players that aren't the given id
  getOthers(id) {
    var otherPlayersList = _.filter(this.players, e => e.id != id);
    var noEmptiesList = _.map(otherPlayersList, p => p.player ? p : null);
    return _.without(noEmptiesList, null);
  };

  // Returns array of all active players
  activePlayers() {
    return _.without(_.map(this.players, p => p.player ? p : null), null);
  };
};

// ServerGame is copy of game with more specific server-side functions
// Takes a more specific config as well as custom functions to construct
// trial list and advance to next round
class ServerGame extends Game {
  constructor(config) {
    super(config);
    this.active = false;
    this.streams = {};
    this.id = config.id;
    this.expPath = config.expPath;
    this.playerCount = config.playerCount;
    this.players = [{
      id: config.initPlayer.userid,
      instance: config.initPlayer,
      player: new player(this, config.initPlayer)
    }];
  }

  // Bundle up server-side info to update client
  takeSnapshot() {
    var playerPacket = _.map(this.players, p => { return { id: p.id, player: null }; });
    var state = {
      active: this.active,
      roundNum: this.roundNum,
      currStim: this.currStim,
      objects: this.objects
    };

    _.extend(state, { players: playerPacket });

    return state;
  };

  start() {
    this.active = true;
    this.trialList = this.makeTrialList();
    this.newRound();
  }

  end() {
    setTimeout(() => {
      _.forEach(this.activePlayers(), p => {
        try {
          p.player.instance.emit('showExitSurvey', {
            roundNum: this.roundNum,
            numRounds: this.numRounds
          });
        } catch (err) {
          console.log('player did not exist to disconnect');
        }
      });
    }, this.delay);
  }

  // This is called on the server side to trigger new round
  newRound(delay) {
    if (this.roundNum == this.numRounds - 1) {
      this.end();
    } else {
      this.roundNum += 1;
      this.currStim = this.trialList[this.roundNum];
      var state = this.takeSnapshot();
      if(this.activePlayers().length > 1){ // added check to see if both players are in round
        _.forEach(this.activePlayers(), p => {
          setTimeout(() => p.player.instance.emit('newRoundUpdate', state), delay);
        });
      }
    }
  };
}

function getURLParams() {
  var match,
    pl = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query = location.search.substring(1);

  var urlParams = {};
  while ((match = search.exec(query))) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
  return urlParams;
};

// ServerGame is copy of game with more specific client-side functions
class ClientGame extends Game {
  constructor(config, customEvents) {
    super(config);
    this.submitted = false;
    this.urlParams = getURLParams();
    this.socket = io({ reconnection: false, query: this.urlParams });
    this.customEvents = customEvents;
    this.startTime = Date.now();

    this.data = {
      score: 0
    };

    this.players = [{
      id: null,
      instance: null,
      player: new player(this)
    }];
  }

  listen() {
    this.socket.on('connect', function () {
      console.log('connected... waiting for server info');
    });

    this.socket.on('joinGame', function (data) {
      this.my_id = data.id;
      this.players[0].id = data.id;
      this.data.gameID = data.id;
    }.bind(this));

    this.socket.on('addPlayer', function (data) {
      this.players.push({ id: data.id, player: new player(this) });
    }.bind(this));

    this.socket.on('showExitSurvey', function (data) {
      this.finished = true;
      if (this.viewport) {
        this.viewport.style.display = "none";
      } else if (document.getElementById('viewport')) {
        document.getElementById('viewport').style.display = 'none';
      }
      var email = this.email ? this.email : '';
      var failMsg = [
        '<h3>Oops! It looks like your partner lost their connection!</h3>',
        '<p> Completing this survey will submit your HIT so you will still receive full ',
        'compensation.</p> <p>If you experience any problems, please email us (',
        email, ')</p>'
      ].join('');
      var successMsg = [
        "<h3>Thanks for participating in our experiment!</h3>",
        "<p>Before you submit your HIT, we'd like to ask you a few questions.</p>"
      ].join('');
      if (data.roundNum >= data.numRounds - 1) {
        $('#exit_survey').prepend(successMsg);
      } else {
        $('#exit_survey').prepend(failMsg);
      }

      $('#exit_survey').show();
      $('#main_div').hide();
      $('#header').hide();
      $('#context').hide(); // from QA expt

      $('#message_panel').hide();
      $('#submitbutton').hide();
      $('#roleLabel').hide();
      $('#score').hide();

    }.bind(this));

    this.customEvents(this);
  }
}

module.exports = { ClientGame, ServerGame };
