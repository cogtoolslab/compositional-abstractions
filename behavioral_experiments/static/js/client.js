var ClientGame = require('./game.js')['ClientGame'];
var _ = require('lodash');

window.onload = function(){
  var customConfig = require('../../config.json');
  var customEvents = require('../../customClient.js');
  
  var game = new ClientGame(customConfig, customEvents);
  game.listen();
};

window.addEventListener('beforeunload', function (e) {
  // If you prevent default behavior in Mozilla Firefox prompt will always be shown
  e.preventDefault(); 
  // Chrome requires returnValue to be set
  e.returnValue = '';
});

