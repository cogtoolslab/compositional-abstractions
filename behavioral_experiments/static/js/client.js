var ClientGame = require('./game.js')['ClientGame'];
var _ = require('lodash');

var customConfig = require('../../config.json');
var customEvents = require('../../customClient.js');

window.onload = function(){
  var game = new ClientGame(customConfig, customEvents);
  game.listen();
};