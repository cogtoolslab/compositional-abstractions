const _ = require('lodash');

const _rawStimList = {
    L: [{ "x": 0, "y": 1, "width": 1, "height": 2 },
    { "x": 0, "y": 3, "width": 1, "height": 2 },
    { "x": 0, "y": 0, "width": 2, "height": 1 },
    { "x": 2, "y": 0, "width": 2, "height": 1 }],

    // T: [{ "x": 1, "y": 0, "width": 1, "height": 2 },
    // { "x": 2, "y": 0, "width": 1, "height": 2 },
    // { "x": 0, "y": 2, "width": 2, "height": 1 },
    // { "x": 2, "y": 2, "width": 2, "height": 1 }],

    C: [{ "x": 1, "y": 0, "width": 2, "height": 1 },
    { "x": 1, "y": 1, "width": 1, "height": 2 },
    { "x": 1, "y": 3, "width": 1, "height": 2 },
    { "x": 1, "y": 5, "width": 2, "height": 1 }],

    Pi: [{ "x": 0, "y": 0, "width": 1, "height": 2 },
    { "x": 3, "y": 0, "width": 1, "height": 2 },
    { "x": 0, "y": 2, "width": 2, "height": 1 },
    { "x": 2, "y": 2, "width": 2, "height": 1 }]
};
const _possibleStims = _.keys(_rawStimList);

// Protect this just in case someone mutates one of these objects down
// the line (e.g. in shiftStimulus())
// cloneDeep is required because otherwise will just clone the list
// but keep pointers to the same underlying {'x' : ...} objects
function getRawStimList () {
  return _.cloneDeep(_rawStimList);
}

function shiftStimulus(stimName, shift) {
  var stimulus = getRawStimList()[stimName];
  return _.map(stimulus, (block) => {
    return _.extend({}, block, {'x' : block.x + shift});
  });
};

function placeStimulus(stimName, direction) {
  var directions = {'left': 1, 'right': 7};
  return shiftStimulus(stimName, directions[direction]);
};

function makeScene(stimArray){
  if(stimArray.length != 2) {
    console.error('stimulus array must be of length 2; curent length:',
                  stimArray.length);
  }
  return _.concat(placeStimulus(stimArray[0], 'left'),
                  placeStimulus(stimArray[1], 'right'));
}

module.exports = {
  getRawStimList,
  shiftStimulus,
  placeStimulus,
  makeScene
};
