var generateConditionSequence = function (structureList, conditions = ['mental', 'physical'], miniblock_size = 4) {
    
    var numStims = structureList.length;
    
    var miniBlockTemplate = repeatArray(conditions, miniblock_size/(conditions.length));
    var num_miniblocks = numStims/miniblock_size;
    var nAttempts = 0;
    
    var found_good_sequence = false;
    while (!found_good_sequence){
        nAttempts ++;
        var candidateSequence = [];
        for (i = 0; i < num_miniblocks; i++) {
            shuffle(miniBlockTemplate)
            miniBlockTemplate.forEach(condition => {
                candidateSequence.push(condition);
            })
        }
        // test candidate sequence
        comsEqual = centerOfMass(candidateSequence, conditions[0]) == centerOfMass(candidateSequence, conditions[1]);
        
        if(!hasStreakOfLength(candidateSequence, 3) && comsEqual){
            found_good_sequence = true;
            //console.log('number of attempts:', nAttempts);
            return candidateSequence;            
        }
    }
}

var generateStructureSequence = function (structureList) {
    shuffle(structureList);
    return(structureList);
}


var setupRandomTrialList = function (trialTemplates, conditions = ['mental', 'physical'], miniblock_size = 4) {

    conditions = generateConditionSequence(trialTemplates, conditions = ['mental', 'physical'], miniblock_size = 4);
    structures = generateStructureSequence(trialTemplates);

    trialList = [];
    for (i=0; i<trialTemplates.length; i++) {

        _.extend(trialTemplates[i], {
            condition: conditions[i],
            trialNum: i
        });

    }

}

var shuffle = function (listToShuffle) {
    listToShuffle.sort(function(a, b){return 0.5 - Math.random()});
}

var repeatArray = function(inputArray, ntimes) {
    var outputArray = [];
    for (i = 0; i < ntimes; i++){
        inputArray.forEach(e => {
            outputArray.push(e)
        })
    }
    return (outputArray)
}

var hasStreakOfLength = function(inputArray, streakTarget) {
    // Returns true if a streak greater than or equal to streakLength exists
    var longestRun = 0;
    var streakItem = inputArray[0];
    var streakLength = 1;
    var i = 1;
    while (i < inputArray.length && longestRun < streakTarget){
        nextItem = inputArray[i];
        if (streakItem == nextItem) {
            streakLength++;
            if (streakLength == streakTarget){
                return true;
            }
        } else {
            streakLength = 1;
            streakItem = nextItem
        }
        i++;
    }
    return false;
}

var centerOfMass = function (inputArray, e) {
    indices = inputArray.map((x, i) => x == e ? i : 0);
    com = indices.reduce(function(a,b){
        return a + b
      }, 0); //sum of indices
    return com;
}


// var structureList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]

// var trialList = generateTrialList(structureList);
// console.log(trialList);

var prePostStimList = function(structureList, numTargets = 8, setSize = 4, numReps = 1) {
    // UNIMPLEMENTED- CODE ADAPTED FROM GRAPHICAL CONVENTIONS

    var shuffledTargets = _.shuffle(_.range(0,numTargets));
    var repeatedTargets = shuffledTargets.slice(0,setSize);
    var controlTargets = shuffledTargets.slice(setSize,setSize*2);
    
    /* 
    // define repeatedTarget on basis of hard subsetting within cluster into contexts
    // independent random sampling to decide whether to use subset "A" or subset "B" within each cluster
    var sampledSubsetRepeated = _.sample(["A","A"]);
    var sampledSubsetControl = _.sample(["B","B"]);
    _r = _.filter(structureList, ({subset,basic}) => subset == sampledSubsetRepeated && basic == repeatedCat);
    var repeatedTargets = _.values(_.mapValues(_r, ({target}) => target));
    _c = _.filter(structureList, ({subset,basic}) => subset == sampledSubsetControl && basic == controlCat);
    var controlTargets = _.values(_.mapValues(_c, ({target}) => target)); 
    */   
    
    
      // define common trialInfo for each condition (omits: targetID, phase, repetition -- these are 
      // added iteratively)
      commonRepeatedTrialInfo = {'targetIDs': repeatedTargets,
                                'condition':'repeated'
                                }
    
      commonControlTrialInfo = {'targetIDs': controlTargets,   
                                'condition':'control'
                                }
    
      // pre phase 
      var pre = _.shuffle(_.concat(_.map(repeatedTargets, curTarget => {
                        return _.extend({}, commonRepeatedTrialInfo, structureList[curTarget], {'phase':'pre','repetition':0, 'targetID': curTarget});
                        }), 
                                   _.map(controlTargets, curTarget => {
                        return _.extend({}, commonControlTrialInfo, structureList[curTarget], {'phase':'pre','repetition':0, 'targetID': curTarget});
                        })));
    
      // repeated phase
      var repeated = _.flatMap(_.range(1,numReps+1), curRep => {
                      return _.map(_.shuffle(repeatedTargets), curTarget => {
                        return _.extend({}, commonRepeatedTrialInfo, structureList[curTarget], {'phase':'repeated','repetition':curRep, 'targetID': curTarget});
                      })
                     });
    
      // post phase
      var post = _.shuffle(_.concat(_.map(repeatedTargets, curTarget => {
                        return _.extend({}, commonRepeatedTrialInfo, structureList[curTarget], {'phase':'post','repetition':numReps+1, 'targetID': curTarget});
                        }), 
                                   _.map(controlTargets, curTarget => {
                        return _.extend({}, commonControlTrialInfo, structureList[curTarget], {'phase':'post','repetition':1, 'targetID': curTarget});
                        })));  
    
      // build session by concatenating pre, repeated, and post phases
      var session = _.concat(pre, repeated, post);

      //console.log(session);
    
      // this is the design dictionary
      return session;
    
}

var setRandomColors = function (trialList, blockColors, numTargets = 8) {
   

    //var numTargets = trialList.length; NOT CURRENTLY TRUE
    var colorIDs = _.shuffle(_.range(0,numTargets));
    
    for (i=0; i<trialList.length; i++) {
        var blockcolorID = colorIDs[i];
        var blockColor = blockColors[blockcolorID];
        
        _.extend(trialList[i], {
            blockColorID: blockcolorID,
            blockColor: blockColor
        });
    }

}

