global.__base = __dirname + '/';

const
  use_https = true,
  argv = require('minimist')(process.argv.slice(2)),
  https = require('https'),
  fs = require('fs'),
  app = require('express')(),
  express = require('express'),
  _ = require('lodash'),
  parser = require('xmldom').DOMParser,
  XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
  sendPostRequest = require('request').post;
  
var gameport;
var researchers = ['A4SSYO0HDVD4E', 'A1BOIDKD33QSDK', 'A1MMCS8S8CTWKU', 'A1MMCS8S8CTWKV', 'A1MMCS8S8CTWKS', 'A1RFS3YXD1ZIKG'];
var blockResearcher = false;

app.use(express.static('static'));

if (argv.gameport) {
  var gameport = argv.gameport;
  console.log('using port ' + gameport);
} else {
  var gameport = 8850;
  console.log('no gameport specified: using ' + gameport + '\nUse the --gameport flag to change');
}

try {
  var privateKey = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/privkey.pem'),
    certificate = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/cert.pem'),
    intermed = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/chain.pem'),
    options = { key: privateKey, cert: certificate, ca: intermed },
    server = require('https').createServer(options, app).listen(gameport),
    io = require('socket.io')(server,{
      pingTimeout:60000
        });
} catch (err) {
  console.log("cannot find SSL certificates; falling back to http");
  var server = app.listen(gameport),
  io = require('socket.io')(server,{
	  pingTimeout:60000
      });
}

// serve stuff that the client requests
app.get('/*', (req, res) => {
  console.log('requesting')
  serveFile(req, res);
});


io.on('connection', function (socket) {

  console.log('connected');

  // Recover query string information and set condition
  var hs = socket.request;
  var query = require('url').parse(hs.headers.referer, true).query;
  var id = query.workerId;
  
  var isResearcher = _.includes(researchers, id);

  // if (!id || (isResearcher && !blockResearcher)){
  //   // initializeWithTrials(socket);
  //   console.log('doing nothing');
  //   {}
  // } else if (!valid_id(id)) {
  //   console.log('invalid id, blocked');
  // } else {
  //   console.log(id);
  //   checkPreviousParticipant(id, (exists) => {
  //     return exists ? handleDuplicate(socket) : {};
  //   });
  // }

  // Send client stims
 // initializeWithTrials(socket);

  socket.on('currentData', function (data) {
    console.log(data.dataType + ' data: ' + JSON.stringify(data));
    writeDataToMongo(data);
  });

  socket.on('getStim', function(data) {

    sendPostRequest('http://localhost:6022/db/getstims', {
      json: {
        dbname: 'stimuli',
        colname: data.stimColName,
        gameid: data.gameID // to mark record
      }
    }, (error, res, body) => {
      if (!error && res.statusCode === 200) {
        socket.emit('stimulus', body);
      } else {
        console.log(`error getting stims: ${error} ${body}`);
        console.log(`falling back to local stimList`);
        //socket.emit('stimulus', _.sample(require('./data/example.json')));
      }
    });
  });
  
});

var serveFile = function (req, res) {
  var fileName = req.params[0];
  console.log('\t :: Express :: file requested: ' + fileName);
  return res.sendFile(fileName, { root: __dirname });
};

// var handleDuplicate = function (req, res) {
//   console.log("duplicate id: blocking request");
//   res.sendFile('duplicate.html', { root: __dirname });
//   return res.redirect('/duplicate.html');
// };

var handleDuplicate = function (socket) {
  console.log("duplicate id: blocking request");
  socket.emit('redirect', '/duplicate.html');
};

var valid_id = function (id) {
  return (id.length <= 15 && id.length >= 12) || id.length == 41;
};

var handleInvalidID = function (socket) {
  console.log("invalid id: blocking request");
  socket.emit('redirect', '/invalid.html');
};

function checkPreviousParticipant(workerId, callback) {
  var p = { 'workerId': workerId };
  var postData = {
    dbname: 'block_construction',
    query: p,
    projection: { '_id': 1 }
  };
  sendPostRequest(
    'http://localhost:6023/db/exists',  // match port number to store.js
    { json: postData },
    (error, res, body) => {
      try {
        if (!error && res.statusCode === 200) {
          console.log("success! Received data " + JSON.stringify(body));
          callback(body);
        } else {
          throw `${error}`;
        }
      }
      catch (err) {
        console.log(err);
        console.log('no database; allowing participant to continue');
        return callback(false);
      }
    }
  );
};

function UUID() {
  var baseName = (Math.floor(Math.random() * 10) + '' +
    Math.floor(Math.random() * 10) + '' +
    Math.floor(Math.random() * 10) + '' +
    Math.floor(Math.random() * 10));
  var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  var id = baseName + '-' + template.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return id;
};

var writeDataToMongo = function (data) {
  sendPostRequest('http://localhost:6022/db/insert',
    { json: data },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log(`sent data to store`);
      } else {
        console.log(`error sending data to store: ${error} ${body}`);
      }
    }
  );
};
