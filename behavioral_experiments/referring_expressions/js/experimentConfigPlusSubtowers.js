expConfig = {
    "experimentName": "ca_referring_expressions",
    "dbname": "compositional_abstractions",
    "colname": "referring_expressions",
    "stimColName": "ca_ref_exp",
    "iterationName": "ca_ref_exp_prolific",
    "completionCode": "C3CFSKP0",
    "devMode": false,
    "experimentParameters": { // parameters for the experiment.
      "setITISomewhere": 1000
    },
    "ProlificCompInfo":"<p>Thank you for participating in our study. It will take around <strong>8 minutes</strong> total to complete, including the time it takes to read these instructions. You will be paid $2 (around $15 per hour). You can perform this study as many times as you would like.</p><p>Note: We recommend maximizing your browser window to ensure everything is displayed correctly. Please do not refresh the page or press the back button.</p>",
    "mainInstructions":['<p>In this study we are asking you to help us understand how people use language to talk about block towers like these:</p><img src="../img/scene_demo.png" style="width:300px;"><p></br></p>',
    '<p>In a previous study, participants sent messages to each other explaining how to build <b>scenes of two block towers</b> using the red and blue blocks shown below. Here is an example of the messages sent by one participant for this pair of towers:</p><img src="../img/message.png" style="width:600px;"><p></br>In general, these messages contain information about where to place <i>things</i>. We are interested in <i>which things</i> people mentioned in their instructions. In particular, we want to know when each of the following were mentioned in each message: <ul class="ref-kinds"><li><b>Blocks</b>: words/phrases referring to blocks (e.g. “place the <b>red block</b>”, “place <b>two vertical blocks</b>”).</li><li><b>Subtowers</b>: words/phrases referring to a part of a tower, larger than one block but not a whole tower (the person above did not mention any subtowers, but could have done had they said e.g. "now build <b>a bridge</b> connecting the two”).</li><li><b>Towers</b>: words/phrases referring to an entire tower (e.g. “make <b>an L</b>”, “like <b>an n</b>”).</li><li><b>Pairs of towers</b>: words/phrases referring to both towers (again, there are none in this example. But someone could say e.g. “looks like <b>Ln</b>”).</li></ul></p>',
    '<p>For each message, please record the <i>number</i> of blocks (<img src = "../img/icons/block.png" class="ref-icon ref-icon-inline ref-icon-block">), subtowers (<img src = "../img/icons/subtower.png" class="ref-icon ref-icon-inline ref-icon-subtower">), towers (<img src = "../img/icons/tower.png" class="ref-icon ref-icon-inline">), and tower pairs (<img src = "../img/icons/pair.png" class="ref-icon ref-icon-inline">) mentioned in the boxes on to the right.</p><img src="../img/ref_exp_demo.png" style="width:600px;"><p></br>Please note that messages may contain multiple kinds of references, for example  “2 blocks going up, to make an L” mentions 2 <b>blocks</b> and 1 <b>tower</b>. Some messages may also contain shorthand (e.g. "blk" for "block" or "rd" for "red block") or made up words. Please do your best to find all of the references of each type, but <b>do not count previously placed blocks or towers mentioned as a location</b> (e.g. "to the right of that L").</p>',
    '<p>In this study you will see 12 sets of instructions sent by a single participant. There is a small chance that your participant did not follow the study instructions or wrote things that do not make sense. If so, please still do your best to fill in the boxes for every set of instructions, but also press the "Flag" button to let us know to take a second look.</p><p>That\'s all you need to know! When you are ready, press Next to start on the first set of instructions.</p>'
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
  