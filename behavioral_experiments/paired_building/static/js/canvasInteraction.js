// Handles interaction between html elements and the experiment canvas


function checkPressed(){
    startBlocks = Matter.Query.region(blocks.map(bl => bl.body), world.bodies[1].bounds)
    finishBlocks = Matter.Query.region(blocks.map(bl => bl.body), world.bodies[2].bounds)
    if (startBlocks === undefined){
        startBlocks = [];
    }
    if (finishBlocks === undefined){
        finishBlocks = [];
    }
    /*
    console.log("Start Bodies: ");
    console.log(startBlocks);
    console.log("End Bodies: ")
    console.log(finishBlocks);
    */
    console.log(checkListConnected(startBlocks.map(bo => bo.id),finishBlocks.map(bo => bo.id)));
    
}

function makeAdjacencyList(){
    // creates adjacency list corresponding to touching blocks
    connections = engine.pairs.table;
    var adjList = {};
    for (var key in connections) {
        if (connections.hasOwnProperty(key)) { //iterates through touching blocks, which are stored by smallest body number first
            contact = connections[key];
            aid = contact.bodyA.id;
            bid = contact.bodyB.id;
            if (adjList[aid]) {
                adjList[aid].push(bid);
              } else {
                adjList[aid] = [bid];
              }
              if (adjList[bid]) {
                adjList[bid].push(aid);
              } else {
                adjList[bid] = [aid];
              }
        }
      }
    //console.log(adjList);
    return adjList;
}

function checkListConnected(startBlocks, targetBlocks){
    if (startBlocks.length == 0 || targetBlocks.length == 0){
        return false
    } else {
        return(checkConnected(startBlocks, targetBlocks));
        // NEED TO DEBUG- DOESN'T SAY CONNECTED IN SOME SCENARIOS (MULTIPLE BLOCKS OVERLAPPING TARGETS)
        /*return (targetBlocks.forEach(start => {
            startBlocks.forEach(target => {
                checkConnected(start, target)
            })
        }))*/
    }
}

function checkConnected(startBlocks, targetBlocks){
    

    adjList = makeAdjacencyList();
    // checks whether two blocks are connected using a Breadth First Search
    
    var q = [];
    var visited = {};
    
    startBlocks.forEach(startBlock => {
        q.push(startBlock);
        visited[startBlock] = true;
        if (targetBlocks.includes(startBlock)){
            return true;
        }
    });
    
    while (q.length > 0) {
        b = q.shift();
        adjB = adjList[b];
        for (let i = 0; i < adjB.length; i++) {
            nextB = adjB[i];
            if(nextB != 2){ //check to see if floor
                if (targetBlocks.includes(nextB)){
                    return true
                }
                if (!visited[nextB]){ // check for backtracking
                    q.push(nextB); // could save path as well if wanted to know blocks that are being used
                    visited[nextB] = true;
                }
            }

        }
    }

    return false;
    
}

