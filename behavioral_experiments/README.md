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


# Project Overview

The goal of this study is to examine the language people use to instruct others in a collaborative assembly task, and how this language evolves over time as they continue making the same things with the same collaborator. We are particularly interested in the ability to gradually abstract from exhaustive, fine-grained procedures to more concise, structured representations. 

Participants will be paired in an online environment to perform a collaborative physical assembly task, in which one participant will act as the Architect and the other as the Builder. On each trial, the Architect will view two block towers and issue instructions to the Builder, who is able to place blocks, but unable to see the target structure. The trial ends when all blocks have been placed, and feedback is given on the accuracy of the construction. Importantly, each tower is built multiple times to test how the Architect’s utterances and the Builder’s behavior change as they accumulate shared history.

## Stimuli 

Iteration 0 (Pilot): All towers will be constructed from two primitive blocks: a 2x1 (horizontal) domino, and a 1 x 2 (vertical) domino. Specifically, we use three particular towers consisting of four dominoes each: (1) an arch; (2) a tower resembling the letter “C,” and (3) one resembling the letter “L.” On each trial, we will show the Architect a pair of these towers in an 8x12 grid environment, placing one on the left side of the environment, and one on the right side.


### Experiment log

#### MongoDB params

`dbname` : `compositional-abstractions`

`colname` : `two-towers`

`iterationName` : see below

#### `livetest0`:
* 3 towers (C, arch, L), 12 trials and practice trial, each scene repeated twice
* two dominoes (1 vertical, 1 horizontal)
* must get perfect practice trial to proceed
* n=1 on 6/24/2020

* Bugs: 
  * bonus needs to be doubled
  * practice trials should not be added to cumulative score 

#### `livetest1` 
* remove practice trials from cumulative score
* bonus changed to reflect advertised amount (10, 6, 2 cents)
* sending cumulative score to MTurk
* n = 0 -- two broken trials, crashed sending Cumulative Bonus on 6/26/2020)
* Bugs:
  * Need to parseInt cumulative Bonus when sending to server 
  * Score returning "null" when getting 0 points
  * tower combinations not swapping order (i.e. L (left), Pi (right), but never Pi(left),L(right))
  
#### `livetest2`:
* fix parseInt issue when sending cumulative score
* F1 score, cumulative Score return 0 (not null) when getting 0 points
* Swapping order of tower pairings
* n = 1 on 6/26/20
* Bugs:
  * Score being sent to MTurk has decimal points in it. Multiplying by 100 & making an integer
  
#### `livetest3`:
* Appears to run smoothly
* n = 2 on 6/27/20

#### `pilot0`:
* First "production" run
* n = 8 dyads on 6/27/20

#### `pilot1`:
* session durations form `pilot0` longer than initially expected. Increased base compensation to $5 (from $4) and bonus amounts per trial (max = $0.15).
* n = 2 dyads on 6/27/20

#### `pilot2`:
* Base comp vs. bonus balance not quite right (does not incentivize strong performance enough): reverting base to $4 and increasing max bonus (up to $2.40)
* n = 2 dyads so far 6/28/20


