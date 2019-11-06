# refgameserver

`refgameserver` aims to be a simple, extendable backend for running real-time, interactive web experiments. It abstracts away the generic server-side 'networking' logic of pairing participants and synchronizing their data so that researchers can focus on custom aspects of their experiment. 

# Getting Started

1. Clone the repo and run `npm install` to pull in node dependencies.

2. Launch an experiment by calling `npm run build`.

# Demo

The color reference game from [Monroe, Hawkins, Goodman, & Potts, 2017](http://www.aclweb.org/anthology/Q17-1023) is implemented in `demo`. An experiment is defined by an `index.html` file containing the html backbone, and two main entry-points specifying a handful of functions that are exported.

* `customGame.js`: containing server-side logic 
  * `makeTrialList()` : contructing array that contains the metadata that will be sent to clients on each trial
  * `customEvents()`: setting all the server-side callbacks handling any socket client-sent events
  * `onMessage()`: handling client-sent 'messages' (TODO: this should be rolled into `customEvents()`)
  * `dataOutput()`: specifying what data to be saved upon each event 
* `customClient.js`: containing client-side logic 
  * `customEvents()`: setting all client-side callbacks from server (one of these must handle `newroundupdate` where the server sends the metadata for the new round)
  
In the demo, all of the jQuery & rendering for the user interface is handled in a UI module called `drawing.js`. Because we use `webpack` to bundle up client-side code, however, you can organize it into modules however you want.


