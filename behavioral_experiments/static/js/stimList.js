
var rawStimList = {
    L: [{ "x": 0, "y": 1, "width": 1, "height": 2 },
    { "x": 0, "y": 3, "width": 1, "height": 2 },
    { "x": 0, "y": 0, "width": 2, "height": 1 },
    { "x": 2, "y": 0, "width": 2, "height": 1 }],

    T: [{ "x": 1, "y": 0, "width": 1, "height": 2 },
    { "x": 2, "y": 0, "width": 1, "height": 2 },
    { "x": 0, "y": 2, "width": 2, "height": 1 },
    { "x": 2, "y": 2, "width": 2, "height": 1 }],

    C: [{ "x": 1, "y": 0, "width": 2, "height": 1 },
    { "x": 1, "y": 1, "width": 1, "height": 2 },
    { "x": 1, "y": 3, "width": 1, "height": 2 },
    { "x": 1, "y": 5, "width": 2, "height": 1 }],

    Pi: [{ "x": 0, "y": 0, "width": 1, "height": 2 },
    { "x": 3, "y": 0, "width": 1, "height": 2 },
    { "x": 0, "y": 2, "width": 2, "height": 1 },
    { "x": 2, "y": 2, "width": 2, "height": 1 }]
};

function shiftStimulus(stimulus, shift) {
    stimulus = _.map(stimulus, function (block) {
        block['x'] = block['x'] + shift;
        return block;
    });
    return stimulus;
};



module.exports = {
    rawStimList,
    shiftStimulus
}