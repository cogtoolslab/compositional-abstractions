var _ = require('lodash');
var utils = require('./sharedUtils.js');
var ServerGame = require('./game.js')['ServerGame'];
var Player = require('./player.js');

function getAllMethodNames(obj) {
  let methods = new Set();
  while ((obj = Reflect.getPrototypeOf(obj))) {
    let keys = Reflect.ownKeys(obj);
    keys.forEach((k) => methods.add(k));
  }
  return methods;
}

class ReferenceGameServer {
  constructor(expPath) {
    this.expPath = expPath;
    this.customGame = require([__base, expPath, 'customGame.js'].join('/'));
    this.customConfig = require([__base, expPath, 'config.json'].join('/'));

    // Track ongoing games
    this.games = {};
    this.gameCount = 0;
  }

  validateGame(game) {
    var methods = getAllMethodNames(game);
    console.assert(methods.has('customEvents'), 'missing customEvents');
    console.assert(methods.has('dataOutput'), 'missing dataOutput');
    console.assert(methods.has('onMessage'), 'missing onMessage'); 
  }
  
  /*
    Writes data specified by experiment instance to csv and/or mongodb
  */
  writeData (client, outputDict, message) {
    var messageParts = message.split('.');
    var game = client.game;
    var eventType = messageParts[0];
    if(_.has(outputDict, eventType)) {
      var dataPoint = _.extend(outputDict[eventType](client, messageParts),
			       {eventType});
      if(_.includes(game.dataStore, 'csv'))
	utils.writeDataToCSV(game, dataPoint);
      if(_.includes(game.dataStore, 'mongo'))
	utils.writeDataToMongo(game, dataPoint); 
    }
  }

  // Now we want set up some callbacks to handle messages that clients will send.
  // We'll just pass messages off to the server_onMessage function for now.
  connectPlayer(game, player) {
    player.game = game;

    // Attach custom events
    game.customEvents(player);
    
    player.on('message', function(m) {
      // Relay to user-provided onMessage function
      game.onMessage(player, m);
      // Then write 
      if(!_.isEmpty(player.game.dataStore)) {
	this.writeData(player, game.dataOutput(), m);
      }
    }.bind(this));

    player.emit('joinGame', {
      id: player.userid,
      numPlayers: game.players.length
    });
  }
  
  // Will run when first player connects
  createGame (player) {
    //Create a new game instance
    var config = _.extend({}, this.customConfig, {
      expPath: this.expPath,
      server: true,
      id : utils.UUID(),
      initPlayer : player,
      playerCount: 1
    });
    
    var game = new this.customGame(config);
    this.validateGame(game);
    this.connectPlayer(game, player);
    this.log('player ' + player.userid + ' created a game with id ' + game.id);
    
    // add to game collection
    this.games[game.id] = game;
    this.gameCount++;

    return game;
  }; 
  
  findGame (player) {
    this.log('looking for a game. We have : ' + this.gameCount);
    var joined_a_game = false;
    var game;
    for (var id in this.games) {
      game = this.games[id];
      if(game.playerCount < game.playersThreshold) {
	// End search
	joined_a_game = true;

	// Add player to game
	game.playerCount++;
	game.players.push({
	  id: player.userid,
	  instance: player,
	  player: new Player(game, player)
	});

	// Add game to player
	this.connectPlayer(game, player);
	
	// notify existing players that someone new is joining
	_.map(game.getOthers(player.userid), function(p){
	  p.player.instance.emit( 'addPlayer', {id: player.userid});
	});
      }
    }
    
    // If you couldn't find a game to join, create a new one
    if(!joined_a_game) {
      game = this.createGame(player);
    }

    // Start game
    if(game.playersThreshold == game.playerCount) {
      game.start();
    }
  };

  // we are requesting to kill a game in progress.
  // This gets called if someone disconnects
  endGame (id, userid) {
    var game = this.games[id];
    try {
      // Remove the person who dropped out
      var i = _.indexOf(game.players, _.find(game.players, {id: userid}));
      game.players[i].player = null;

      // If game is ongoing and someone drops out, tell other players and end game
      // If game is over, remove game when last player drops out
      console.log("active: " + game.active);
      if(game.active || game.activePlayers().length < 1) {
	game.end();
	delete this.games[id];
	this.gameCount--;
	this.log('game removed. there are now ' + this.gameCount + ' games' );
      } 
    } catch (err) {
      this.log('game ' + id + ' already ended');
    }  
  }; 
  
  // A simple wrapper for logging so we can toggle it, and augment it for clarity.
  log () {
    console.log.apply(this,arguments);
  };
};

module.exports = ReferenceGameServer;

