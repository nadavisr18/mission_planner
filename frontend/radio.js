var activeRadioRows = 1;
var radioVector = {};

/* Add a row to the radio preset table */
function addRadioRow(){
    var table = document.getElementById("radio-table");

    activeRadioRows++;
    var row = table.insertRow(activeRadioRows);

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    cell1.innerHTML = '<input class="input" type="number" id="radio-channel-0" value = "0">';
    cell2.innerHTML = '<input class="input" type="number" id="radio-frequency-0" value = "0">';
}

/* Remove last row from the radio preset table */
function removeRadioRow(){
    if (activeRadioRows == 1) return;
    var table = document.getElementById("radio-table");
    table.deleteRow(activeRadioRows);
    activeRadioRows--;
}

function applyRadioChange(){
    var obj = document.getElementById("waypoint-aircraft");
    var waypoint_aircraft = obj.options[obj.selectedIndex].text;

    if (waypoint_aircraft != "..." && waypoint_aircraft != "Everyone")
    {
        var presets = {};
        for (i = 0; i < activeRadioRows; i++)
        {
            presets[i] = [document.getElementById("radio-channel-"+i).value, document.getElementById("radio-frequency-"+i).value];
        }
        radioVector[waypoint_aircraft] = presets;
    }
}