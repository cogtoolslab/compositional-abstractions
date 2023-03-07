function validateForm() {
    
    var completed = document.forms["quiz"]["completed"].value;
    if (completed == "yes") {
        location.replace("./notwice.html");
    } else {
	var count = 0
	var qs = Array('move', 'occ', 'mgoal', 'dgoal', 'comp');
	var as = Array(qs.length);
	for (i = 0; i < qs.length; i++) { 
	    as[i] = document.forms["quiz"][qs[i]].value;
	    if(as[i] != "yes" && as[i] != "no") {
		alert("Please enter responses to all questions to continue.");
		return false
	    }
	    if(as[i] == "yes") {
		count += 1
	    }
	}
	if (count == qs.length) {
	    location.replace("./pass.html");
	} else {
	    location.replace("./fail.html");
	}
    }
    return false
}