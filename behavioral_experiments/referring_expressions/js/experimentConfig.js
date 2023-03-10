expConfig = {
    "experimentName": "ca_referring_expressions",
    "dbname": "compositional_abstractions",
    "colname": "referring_expressions",
    "stimColName": "ca_ref_exp",
    "iterationName": "ca_ref_exp_dev",
    "completionCode": "CWRO95FQ", // TODO: UPDATE
    "devMode": false,
    "experimentParameters": { // parameters for the experiment.
      "setITISomewhere": 1000 // TODO: set somewhere?
    },
    "ProlificCompInfo":"<p>Thank you for participating in our study. It will take around <strong>6 minutes</strong> total to complete, including the time it takes to read these instructions. You will be paid $1.55 (around $15.50 per hour). You can perform this study as many times as you would like.</p><p>Note: We recommend maximizing your browser window to ensure everything is displayed correctly. Please do not refresh the page or press the back button.</p>",
    // "mainInstructions":['<p>In this study we are asking you to help us understand how people use language to talk about block towers like those below. In a previous study, participants sent instructions to each other describing how to build towers like these. They described 12 scenes of two block towers each. In this study you will see the sequence of instructions sent by one participant. Each set of instructions consists of several messages, which contain words that refer to blocks (e.g. "place a red block") and sometimes to larger tower structures (e.g. "build a big L shape"). On rare occasions, they may have even referred to an entire scene (e.g. "this time it\'s CL"). For each message, please identify these references, and determine how many entities of each type (block, tower, and scene) are referred to in the message. We will explain how to record these on the next page.</p><img src="../img/scene_demo.png" style="width:300px;">',
    // '<p>First you will list the phrases referring to blocks, towers, and scenes. Here we only want you to record the "noun phrases"- the words referring to things to be placed. This means you should omit verbs (e.g. "place", "put") as well as information about where to place them (e.g. "on top of the blue block"). To record these phrases, copy them into the box below the message, separated by commas. To make it easier for you, you can also copy a phrase by highlighting it with your cursor and pressing the Return key.</p><p>After recording these phrases, please record the quantity of each entity referred to in the boxes on the right.</p><p>Please note that some messages will contain references of multiple kinds e.g. "start building an L by placing two blue blocks on the ground" refers to two 2 blocks ("two blue blocks") and 1 tower ("an L"). They may also contain shorthand (e.g. "blk" for "block" or "rd" for "red block"). Please do your best to count all references to the block(s)/ tower(s) being placed. Please do not count previously placed blocks mentioned as a location (e.g. "place a red block on top of the left-most blue block").</p>',
    // '<p>Ready? Press Next to start on the first of 12 sets of messages.</p>'
    // ], // identify ref exps
    "mainInstructions":['<p>In this study we are asking you to help us understand how people use language to talk about block towers like those below. In a previous study, participants sent instructions to each other describing how to build towers like these. They described 12 scenes of two block towers each. In this study you will see the sequence of instructions sent by one participant. Each set of instructions consists of several messages, which contain words that refer to <b>blocks</b> (e.g. "place a red block") and sometimes to larger <b>tower</b> structures (e.g. "build a big L shape"). On rare occasions, they may have even referred to an entire <b>scene</b> (e.g. "this time it\'s CL"). Your task is to determine how many entities of each type (block, tower, and scene) are referred to in each message.</p><img src="../img/scene_demo.png" style="width:300px;">',
    '<p>Each message will be displayed with three boxes to the right- one for blocks, one for towers, and one for scenes. Please record the quantity of each entity referred to in these boxes.</p><p>Please note that some messages will contain references of multiple kinds e.g. "start building an L by placing two blue blocks on the ground" refers to two 2 blocks ("two blue blocks") and 1 tower ("an L"). They may also contain shorthand (e.g. "blk" for "block" or "rd" for "red block"). Please do your best to count all references to the block(s)/ tower(s) being placed.</p><p>Participants might sometimes talk about locations, including the red tick marks on the ground or previously placed blocks or towers. Please <em>do not count previously placed blocks or towers mentioned as a location</em> (e.g. "place a red block on top of the left-most blue block").</p>',
    '<p>Ready? Press Next to start on the first of 12 sets of messages.</p>'
    ],
    "phaseInstructions":[
    '<p></p>'],
    "taskParameters": { // parameters for specific types of trials. Majority of task parameters are set in metadata.
      "labelRefExp" : {
        },
    },
    "trialTypes":{ // list of plugins used in experiment
      "labelRefExp": "ca-label-ref-exp",
    }
  }
  