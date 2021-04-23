var radioVector = [{}, {}];
var radioTables = [null, null];

/* Create the radio rows */
function setupRadio(radioNumber){
    radioTables[radioNumber-1] = document.getElementById("radio-table-"+radioNumber);
    for (i = 0; i < 20; i++) addNewRow(radioNumber);
}

/* Add a row to the radio preset table */
function addRadioRow(radioNumber){
    var obj = document.getElementById("radio-aircraft");
    var radio_aircraft = obj.options[obj.selectedIndex].text;
    if (radio_aircraft != "...")
    {
        var channels = radioVector[radioNumber-1][radio_aircraft];
        var newChannelNumber = 1;
        if (channels.length > 0) newChannelNumber = channels[channels.length-1]["Channel"]+1;
        if (channels.length == 20) return;
        radioVector[radioNumber-1][radio_aircraft].push({"Channel": newChannelNumber, "Frequency": 123.50, "Label": "No label"});
        deactivateRadio(radioNumber);
        activateRadio(radioNumber);
    }
}

/* Remove last row from the radio preset table */
function removeRadioRow(radioNumber){
    var obj = document.getElementById("radio-aircraft");
    var radio_aircraft = obj.options[obj.selectedIndex].text;
    if (radio_aircraft != "...")
    {
        radioVector[radioNumber-1][radio_aircraft].pop();
        deactivateRadio(radioNumber);
        activateRadio(radioNumber);
    }
}

/* Save the change to the radio vector */
function applyRadioChange(radioNumber){
    var obj = document.getElementById("radio-aircraft");
    var radio_aircraft = obj.options[obj.selectedIndex].text;
    if (radio_aircraft != "...")
    {
        var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
        for (i = 0; i < radioVector[radioNumber-1][radio_aircraft].length; i++)
        {
            var cells = radioRows[i].cells;
            radioVector[radioNumber-1][radio_aircraft][i]["Channel"] = parseInt(cells[0].getElementsByTagName("input")[0].value);
            radioVector[radioNumber-1][radio_aircraft][i]["Frequency"] = parseFloat(cells[1].getElementsByTagName("input")[0].value);
            radioVector[radioNumber-1][radio_aircraft][i]["Label"] = cells[2].getElementsByTagName("input")[0].value;
        }
    }
}

/* Check that the inputs are in the correct range */
function checkChannelRanges(rowIndex, radioNumber){
    var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
    var cells = radioRows[rowIndex].cells;
    obj = cells[0].getElementsByTagName("input")[0];
    if (obj.value > 20) {obj.value = 20; flashError(obj);}
    else if (obj.value < 0) {obj.value = 0; flashError(obj);}
}

function checkFrequencyRanges(rowIndex, radioNumber){
    var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
    var cells = radioRows[rowIndex].cells;
    var obj = cells[1].getElementsByTagName("input")[0];
    console.log(obj.value);
    if (obj.value > 999) {obj.value = 999; flashError(obj);}
    else if (obj.value < 0) {obj.value = 0; flashError(obj);}
}

/* Show the correct number of rows and set them to the value saved in the vector */
function activateRadio(radioNumber)
{
    var obj = document.getElementById("radio-aircraft");
    var radio_aircraft =  obj.options[obj.selectedIndex].text;
    if ((radio_aircraft in radioVector[radioNumber-1]) == false) {
        radioVector[radioNumber-1][radio_aircraft] = [];
    }

    var buttons = document.getElementsByClassName("radio-button");
    for (i = 0; i < buttons.length; i++)
    {
        buttons[i].classList.remove("greyed");
    }

    var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
    for (i = 0; i < radioVector[radioNumber-1][radio_aircraft].length; i++)
    {
        radioRows[i].classList.remove("hidden");
        var cells = radioRows[i].cells;
        var el = radioRows[i].getElementsByTagName("input");
        for (j = 0; j < el.length; j++) {
            el[j].classList.remove("greyed");
            el[j].disabled = false;
        }
        cells[0].getElementsByTagName("input")[0].value = radioVector[radioNumber-1][radio_aircraft][i]["Channel"];
        cells[1].getElementsByTagName("input")[0].value = radioVector[radioNumber-1][radio_aircraft][i]["Frequency"];
        cells[2].getElementsByTagName("input")[0].value = radioVector[radioNumber-1][radio_aircraft][i]["Label"];
        resetError(cells[0].getElementsByTagName("input")[0]);
        resetError(cells[1].getElementsByTagName("input")[0]);
    }
}

/* Hide all the radio rows */
function deactivateRadio(radioNumber)
{
    var buttons = document.getElementsByClassName("radio-button");
    for (i = 0; i < buttons.length; i++)
    {
        buttons[i].classList.add("greyed");
    }

    var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
    var el = radioRows[0].getElementsByTagName("input");
    for (i = 0; i < el.length; i++) {
        el[i].classList.add("greyed");
        el[i].disabled = true;
    }
    for (i = 1; i < radioRows.length; i++)
    {
        radioRows[i].classList.add("hidden");
    }
}

/* Add a new row to the radio table */
function addNewRow(radioNumber){
    var rowsLength = radioTables[radioNumber-1].getElementsByTagName('tr').length;
    var radiorowsLength = radioTables[radioNumber-1].getElementsByClassName('radio-row').length;
    var rowIndex = rowsLength- radioTables[radioNumber-1].getElementsByClassName('radio-not-row').length+1;
    var newRow = radioTables[radioNumber-1].insertRow(rowIndex);
    newRow.classList.add("radio-row");

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);

    cell1.innerHTML = '<input class="input" type="number" value="'+ (radiorowsLength+1) +'" oninput="checkChannelRanges('+radiorowsLength+', '+radioNumber+')" onfocusout="applyRadioChange('+radioNumber+')">';
    cell2.innerHTML = '<input class="input" type="number" value="123.50" oninput="checkFrequencyRanges('+radiorowsLength+', '+radioNumber+')" onfocusout="applyRadioChange('+radioNumber+')">';
    cell3.innerHTML = '<input class="input" type="text" value="No label" onfocusout="applyRadioChange('+radioNumber+')">'
}