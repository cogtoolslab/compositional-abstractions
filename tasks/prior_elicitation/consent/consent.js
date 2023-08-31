//get radiobutton values for consent
const getCheckedRadioValue = (name) => {
	const radios = document.getElementsByName(name);
  try {
  	// calling .value without a "checked" property with throw an exception.
  	return Array.from(radios).find((r, i) => radios[i].checked).value
  } catch(e) { }
}

function form_ok() {
  return getCheckedRadioValue('age') == "eighteen" &&
  getCheckedRadioValue('understand') == "understood" &&  getCheckedRadioValue('give_consent') == "consent"
}

function disable(id){
  document.getElementById(id).disabled = 'disabled';
}

function enable(id){
  if(form_ok()) {
    document.getElementById(id).disabled = '';
  }
}
