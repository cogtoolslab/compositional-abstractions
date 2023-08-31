var urlParams;
var match,
    pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) {
      return decodeURIComponent(s.replace(pl, " "));
    },
    query = location.search.substring(1);
urlParams = {};
while ((match = search.exec(query)))
  urlParams[decode(match[1])] = decode(match[2]);

// these are currently not sent from practice_building, so it won't work
// var workerId = urlParams.workerId;
// var assignmentId = urlParams.assignmentId;
// var hitId = urlParams.hitId;
// var turkSubmitTo = urlParams.turkSubmitTo;
// var nAttempts = urlParams.nAttempts;
