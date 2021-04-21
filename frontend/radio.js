var radioVector = {};

/* Add a row to the radio preset table */
function addRadioRow(){
    var obj = document.getElementById("waypoint-aircraft");
    var waypoint_aircraft = obj.options[obj.selectedIndex].text;
    if (waypoint_aircraft != "..." && waypoint_aircraft != "Everyone")
    {

        activateRadioInputs();
        addNewRow(true);
    }
}

/* Remove last row from the radio preset table */
function removeRadioRow(){
    var obj = document.getElementById("waypoint-aircraft");
    var waypoint_aircraft = obj.options[obj.selectedIndex].text;
    if (waypoint_aircraft != "..." && waypoint_aircraft != "Everyone")
    {
        var table = document.getElementById("radio-table");
        var tableLength = table.getElementsByTagName('tr').length;
        if (tableLength == 2) return;
        else if (tableLength == 3) deactivateRadioInputs();
        else table.deleteRow(tableLength-2);
    }
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

function checkChannelRanges(i){
    var obj = document.getElementById("radio-channel-"+i);
    if (obj.value > 20) obj.value = 20;
    else if (obj.value < 1) obj.value = 1;
}

function checkFrequencyRanges(i){
    var obj = document.getElementById("radio-frequency-"+i);
    if (obj.value > 999) obj.value = 999;
    else if (obj.value < 1) obj.value = 1;
}

function cleanRadioTable()
{
    console.log("Cleaning")
    var table = document.getElementById("radio-table");
    var tableLength = table.getElementsByTagName('tr').length;
    var originalLength = tableLength;
    while (tableLength > 2){
        table.deleteRow(tableLength-2);
        tableLength = table.getElementsByTagName('tr').length;
    }
    return originalLength;
}

function activateRadioInputs()
{
    var originalLength = cleanRadioTable();
    var table = document.getElementById("radio-table");
    var tableLength = table.getElementsByTagName('tr').length;
    for (i = 0; i < originalLength - tableLength; i++) addNewRow(true);

    document.getElementById("add-radio-button").classList.remove("greyed");
    document.getElementById("remove-radio-button").classList.remove("greyed");
}

function deactivateRadioInputs(){
    var originalLength = cleanRadioTable();
    var table = document.getElementById("radio-table");
    var tableLength = table.getElementsByTagName('tr').length;
    for (i = 0; i < originalLength - tableLength; i++) addNewRow(false);

    document.getElementById("add-radio-button").classList.add("greyed");
    document.getElementById("remove-radio-button").classList.add("greyed");
}

function addNewRow(active){
    var table = document.getElementById("radio-table");
    var rowIndex = table.getElementsByTagName('tr').length - 3;
    var row = table.insertRow(rowIndex + 2);

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    rowIndex ++;

    if (active == true)
    {
        cell1.innerHTML = '<input class="input" type="number" id="radio-channel-'+ rowIndex +'" value="'+ (rowIndex+1) +'" oninput="checkChannelRanges(0)" onfocusout="applyRadioChange()">';
        cell2.innerHTML = '<input class="input" type="number" id="radio-frequency-'+ rowIndex +'" value="123.50" oninput="checkFrequencyRanges(0)" onfocusout="applyRadioChange()">';
        cell3.innerHTML = '<input class="input" type="text" id="radio-label-'+ rowIndex +'" value="No label" onfocusout="applyRadioChange()">'
    } else 
    {
        cell1.innerHTML = '<input class="input greyed" type="number" id="radio-channel-'+ rowIndex +'" value="'+ (rowIndex+1) +'" oninput="checkChannelRanges(0)" onfocusout="applyRadioChange() disabled">';
        cell2.innerHTML = '<input class="input greyed" type="number" id="radio-frequency-'+ rowIndex +'" value="123.50" oninput="checkFrequencyRanges(0)" onfocusout="applyRadioChange() disabled">';
        cell3.innerHTML = '<input class="input greyed" type="text" id="radio-label-'+ rowIndex +'" value="No label" onfocusout="applyRadioChange() disabled">'
    }
}