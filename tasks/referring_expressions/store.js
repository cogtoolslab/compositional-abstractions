"use strict";
const argv = require("minimist")(process.argv.slice(2));
const _ = require("lodash");
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const mongodb = require("mongodb");
const path = require("path");
const sendPostRequest = require("request").post;
const colors = require("colors/safe");

const app = express();
const MongoClient = mongodb.MongoClient;
const port = 6022;
const mongoCreds = require("./auth.json");

let USEMONGOCLOUD;
if (argv.USEMONGOCLOUD) {
  USEMONGOCLOUD = argv.USEMONGOCLOUD;
  console.log("Setting USEMONGOCLOUD to " + USEMONGOCLOUD);
} else {
  USEMONGOCLOUD = false;
  console.log(
    "Mongo DB Location not specified: setting `USEMONGOCLOUD = false`.\
    \nPlease use --USEMONGOCLOUD [true/false] to specify local or cloud db instance."
  );
}

const mongoURL = `mongodb://${mongoCreds.user}:${mongoCreds.password}@localhost:27017/`;
const mongoCloudURL = `mongodb+srv://${mongoCreds.user}:${mongoCreds.password}@cluster0.iyh6o.mongodb.net`;
const handlers = {};

function makeMessage(text) {
  return `${colors.blue("[store]")} ${text}`;
}

function log(text) {
  console.log(makeMessage(text));
}

function error(text) {
  console.error(makeMessage(text));
}

function failure(response, text) {
  const message = makeMessage(text);
  console.error(message);
  return response.status(500).send(message);
}

function success(response, text) {
  const message = makeMessage(text);
  console.log(message);
  return response.send(message);
}

function mongoConnectWithRetry(delayInMilliseconds, callback) {
  var mongoConnURL = USEMONGOCLOUD ? mongoCloudURL : mongoURL;
  MongoClient.connect(
    mongoConnURL,
    { useUnifiedTopology: true },
    (err, connection) => {
      if (err) {
        console.error(`Error connecting to MongoDB: ${err}`);
        setTimeout(
          () => mongoConnectWithRetry(delayInMilliseconds, callback),
          delayInMilliseconds
        );
      } else {
        log("connected succesfully to mongodb");
        callback(connection);
      }
    }
  );
}

function markAnnotation(collection, gameid, trialListID) { //TODO update this
  collection.updateOne({ _id: trialListID }, {
    $push: { games: gameid },
    $inc: { numGames: 1 } // changed from numGames
  }, function (err, items) {
    if (err) {
      console.log(`error marking annotation data: ${err}`);
    } else {
      console.log(`successfully marked annotation. result: ${JSON.stringify(items)}`);
    }
  });
};


function serve() {
  mongoConnectWithRetry(2000, (connection) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post("/db/exists", (request, response) => {
      if (!request.body) {
        return failure(response, "/db/exists needs post request body");
      }
      const databaseName = request.body.dbname;
      const database = connection.db(databaseName);
      const query = request.body.query;
      const projection = request.body.projection;

      // hardcoded for now (TODO: get list of collections in db)
      // var collectionList = [
      //   "compositional-abstractions-prior-elicitation_example",
      // ];

      var collectionArrayPromise = database.listCollections().toArray();

      function checkCollectionForHits(
        collectionName,
        query,
        projection,
        callback
      ) {
        const collection = database.collection(collectionName);
        collection
          .find(query, projection)
          .limit(1)
          .toArray((err, items) => {
            callback(!_.isEmpty(items));
          });
      }

      function checkEach(
        collectionArrayPromise,
        checkCollectionForHits,
        query,
        projection,
        evaluateTally
      ) {
        var doneCounter = 0;
        var results = 0;
        collectionArrayPromise
          .then((collectionList) => {
            collectionList.forEach((collection) => {
              var collectionName = collection["name"];
              checkCollectionForHits(
                collectionName,
                query,
                projection,
                function (res) {
                  log(
                    `got request to find_one in ${collectionName} with` +
                    ` query ${JSON.stringify(
                      query
                    )} and projection ${JSON.stringify(projection)}`
                  );
                  doneCounter += 1;
                  results += res;
                  if (doneCounter === collectionList.length) {
                    evaluateTally(results);
                  }
                }
              );
            });
          })
          .catch(function (err) {
            console.log(err);
          });
      }

      function evaluateTally(hits) {
        console.log("hits: ", hits);
        response.json(hits > 0);
      }
      checkEach(
        collectionArrayPromise,
        checkCollectionForHits,
        query,
        projection,
        evaluateTally
      );

      // // Always let the requester test ;) // this is handled by blockResearchers flag in app.js
      // if(_.includes(['A1BOIDKD33QSDK', 'A4SSYO0HDVD4E', 'A1MMCS8S8CTWKU'],
      // query.workerId)) {
      //   response.json(false);
      // } else {
      //   checkEach(collectionList, checkCollectionForHits, query, projection, evaluateTally);
      // }
    });

    app.post("/db/insert", (request, response) => {
      if (!request.body) {
        return failure(response, "/db/insert needs post request body");
      }
      log(`got request to insert into ${request.body.colname}`);

      const databaseName = request.body.dbname;
      const collectionName = request.body.colname;
      if (!collectionName) {
        return failure(response, "/db/insert needs collection");
      }
      if (!databaseName) {
        return failure(response, "/db/insert needs database");
      }

      const database = connection.db(databaseName);

      // Add collection if it doesn't already exist
      if (!database.collection(collectionName)) {
        console.log("creating collection " + collectionName);
        database.createCollection(collectionName);
      }

      const collection = database.collection(collectionName);

      const data = _.omit(request.body, ["colname", "dbname"]);
      // log(`inserting data: ${JSON.stringify(data)}`);
      collection.insert(data, (err, result) => {
        if (err) {
          return failure(response, `error inserting data: ${err}`);
        } else {
          return success(
            response,
            `successfully inserted data. result: ${JSON.stringify(result)}`
          );
        }
      });
    });


    app.post('/db/getstims', (request, response) => {

      console.log(response);

      if (!request.body) {
        return failure(response, '/db/getstims needs post request body');
      }
      console.log(`got request to get stims from ${request.body.dbname}/${request.body.colname}`);

      const databaseName = request.body.dbname;
      const collectionName = request.body.colname;

      if (!collectionName) {
        return failure(response, '/db/getstims needs collection');
      }
      if (!databaseName) {
        return failure(response, '/db/getstims needs database');
      }

      const database = connection.db(databaseName);
      const collection = database.collection(collectionName);

      console.log(collection);
      // sort by number of times previously served up and take the first
      collection.aggregate([
        { $addFields: { numGames: { $size: '$games' } } },
        { $sort: { numGames: 1 } },
        { $limit: 1 }
      ]).toArray((err, results) => {
        console.log(results);
        if (err) {
          console.log(err);
        } else {
          if (results[0]){
            // Immediately mark as annotated so others won't get it too
            markAnnotation(collection, request.body.gameid, results[0]['_id']);
            response.send(results[0]); //TODO work this out
          } else {
              console.log('No records in"' + collectionName + '"');
              response.send(null);
          }
        }
      });




    });


    app.listen(port, () => {
      log(`running at http://localhost:${port}`);
    });
  });
}

serve();
