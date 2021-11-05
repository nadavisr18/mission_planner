class RadioPreset {
    constructor(attributes) {
        this.radio = attributes.radio;
        this.channel = attributes.channel;
        this.frequency = attributes.frequency;
    }

    getJSON()
    {
        var string = "";
        string += '"radio":'+(this.radio+1); string += ', ';
        string += '"preset":'+this.channel; string += ', ';
        string += '"frequency":'+this.frequency + '';
        return '{'+string+'}';
    }
}

var radioVector = [{}, {}];
var radioTables = [null, null];

/* Create the radio rows */
function setupRadio(radioNumber){
    radioTables[radioNumber-1] = document.getElementById("radio-table-"+radioNumber);
    for (i = 0; i < 20; i++) addNewRow(radioNumber);
}

/* Add a row to the radio preset table */
function addRadioRow(radioNumber){
    var obj = document.getElementById("radio-group");
    var radio_group = obj.options[obj.selectedIndex].text;
    if (radio_group != "...")
    {
        var channels = radioVector[radioNumber-1][radio_group];
        var newChannelNumber = findChannelFree(radioNumber);
        if (channels.length == 20) return;
        radioVector[radioNumber-1][radio_group].push({"channel": newChannelNumber, "frequency": 123.45, "label": "No label", "radio": radioNumber-1, "saved": false});
        deactivateRadio(radioNumber);
        activateRadio(radioNumber);
    }
}

/* Remove last row from the radio preset table */
function removeRadioRow(radioNumber){
    var obj = document.getElementById("radio-group");
    var radio_group = obj.options[obj.selectedIndex].text;
    if (radio_group != "...")
    {
        radioVector[radioNumber-1][radio_group].pop();
        deactivateRadio(radioNumber);
        activateRadio(radioNumber);
    }
}

/* Save the change to the radio vector */
function applyRadioChange(radioNumber){
    var obj = document.getElementById("radio-group");
    var radio_group = obj.options[obj.selectedIndex].text;
    if (radio_group != "...")
    {
        var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
        for (i = 0; i < radioVector[radioNumber-1][radio_group].length; i++)
        {
            var cells = radioRows[i].cells;
            radioVector[radioNumber-1][radio_group][i]["channel"] = parseInt(cells[0].getElementsByTagName("input")[0].value);
            radioVector[radioNumber-1][radio_group][i]["frequency"] = parseFloat(cells[1].getElementsByTagName("input")[0].value);
            radioVector[radioNumber-1][radio_group][i]["label"] = cells[2].getElementsByTagName("input")[0].value;
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
    if (obj.value > 999) {obj.value = 999; flashError(obj);}
    else if (obj.value < 0) {obj.value = 0; flashError(obj);}
}

/* Show the correct number of rows and set them to the value saved in the vector */
function activateRadio(radioNumber)
{
    var obj = document.getElementById("radio-group");
    var radio_group =  obj.options[obj.selectedIndex].text;
    if ((radio_group in radioVector[radioNumber-1]) == false) {
        radioVector[radioNumber-1][radio_group] = [];
    }

    var buttons = document.getElementsByClassName("radio-button");
    for (i = 0; i < buttons.length; i++)
    {
        buttons[i].classList.remove("greyed");
    }

    var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
    for (i = 0; i < radioVector[radioNumber-1][radio_group].length; i++)
    {
        radioRows[i].classList.remove("hidden");
        var cells = radioRows[i].cells;
        var el = radioRows[i].getElementsByTagName("input");
        for (j = 0; j < el.length; j++) {
            el[j].classList.remove("greyed");
            el[j].disabled = false;
        }
        cells[0].getElementsByTagName("input")[0].value = radioVector[radioNumber-1][radio_group][i]["channel"];
        cells[1].getElementsByTagName("input")[0].value = radioVector[radioNumber-1][radio_group][i]["frequency"];
        cells[2].getElementsByTagName("input")[0].value = radioVector[radioNumber-1][radio_group][i]["label"];
        if (radioVector[radioNumber-1][radio_group][i]["saved"])
            cells[3].innerHTML = '<div class="radio-saved-check"></div>';
        else
            cells[3].innerHTML = '<div class="radio-saved-check"><i class="fas fa-exclamation"></i></div>';
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

    var cells = radioRows[0].cells;
    cells[0].getElementsByTagName("input")[0].value = 1;
    cells[1].getElementsByTagName("input")[0].value = 123.45;
    cells[2].getElementsByTagName("input")[0].value = "No label";
    cells[3].innerHTML = '<div class="radio-saved-check"></div>';

    for (i = 0; i < el.length; i++) {

        el[i].classList.add("greyed");
        //el[i].disabled = true;
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
    var cell4 = newRow.insertCell(3);

    cell1.innerHTML = '<div class="tooltip"><input class="input" type="number" value='+(radiorowsLength+1)+' oninput="checkChannelRanges('+radiorowsLength+', '+radioNumber+')" onblur="applyRadioChange('+radioNumber+'); checkChannelFree('+radioNumber+', '+radiorowsLength+');"><span class="tooltiptext">Tooltip text</span></div>';
    cell2.innerHTML = '<input class="input" type="number" value="123.45" oninput="checkFrequencyRanges('+radiorowsLength+', '+radioNumber+')" onblur="applyRadioChange('+radioNumber+')">';
    cell3.innerHTML = '<input class="input" type="text" value="No label" onfocus="removePlacehoder('+radiorowsLength+', '+radioNumber+')" onblur="setPlacehoder('+radiorowsLength+', '+radioNumber+'); applyRadioChange('+radioNumber+')">'
    cell4.innerHTML = '<div class="radio-saved-check"></div>'
}

function removePlacehoder(rowIndex, radioNumber)
{
    var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
    var cells = radioRows[rowIndex].cells;
    obj = cells[2].getElementsByTagName("input")[0];
    if (obj.value == "No label") {obj.value = ""}
}

function setPlacehoder(rowIndex, radioNumber)
{
    var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
    var cells = radioRows[rowIndex].cells;
    obj = cells[2].getElementsByTagName("input")[0];
    if (obj.value == "") {obj.value = "No label"}
}

function checkChannelFree(radioNumber, rowIndex)
{
    var obj = document.getElementById("radio-group");
    var radio_group = obj.options[obj.selectedIndex].text;
    if (radio_group != "...")
    {
        for (j = 0; j < obj.options.length; j++)
        {
            var temp_radio_group = obj.options[j].text;
            if ((temp_radio_group in radioVector[radioNumber-1]))
            {
                for (k = 0; k < radioVector[radioNumber-1][temp_radio_group].length; k++){
                    if (temp_radio_group == radio_group && rowIndex == k) continue;
                    if (radioVector[radioNumber-1][temp_radio_group][k]["channel"] == radioVector[radioNumber-1][radio_group][rowIndex]["channel"] && radioVector[radioNumber-1][radio_group][rowIndex]["channel"] != 0){
                        var radioRows = radioTables[radioNumber-1].getElementsByClassName('radio-row');
                        var cells = radioRows[rowIndex].cells;
                        tooltip = cells[0].getElementsByClassName("tooltiptext")[0];
                        if (temp_radio_group == radio_group) {
                            tooltip.innerHTML = "channel already set <i class='fas fa-times-circle right-align tooltip-delete' onclick='closeTooltip(this.parentElement)'></i>";
                            tooltip.style.visibility = 'visible';
                            tooltip.style.opacity = 1;
                            flashError(cells[0].getElementsByClassName("input")[0]);
                        }
                        else {
                            if (radio_group == "Everyone"){
                                tooltip.innerHTML = "Overwriting setting for: " + temp_radio_group + "<i class='fas fa-times-circle right-align tooltip-delete' onclick='closeTooltip(this.parentElement)'></i>";
                                tooltip.style.visibility = 'visible';
                                tooltip.style.opacity = 1;
                                flashError(cells[0].getElementsByClassName("input")[0]);
                            } 
                            else if (temp_radio_group == "Everyone") {
                                tooltip.innerHTML = "channel already set for Everyone <i class='fas fa-times-circle right-align tooltip-delete' onclick='closeTooltip(this.parentElement)'></i>";
                                tooltip.style.visibility = 'visible';
                                tooltip.style.opacity = 1;
                                flashError(cells[0].getElementsByClassName("input")[0]);
                            }
                        }
                    }
                }
            }
        }
    } 
}

function findChannelFree(radioNumber)
{
    var obj = document.getElementById("radio-group");
    var radio_group = obj.options[obj.selectedIndex].text;
    if (radio_group != "...")
    {
        for (channel = 1; channel <= 20; channel++){
            var isFree = true;
            for (j = 0; j < obj.options.length; j++)
            {
                var temp_radio_group = obj.options[j].text;
                if ((temp_radio_group in radioVector[radioNumber-1]))
                {
                    for (k = 0; k < radioVector[radioNumber-1][temp_radio_group].length; k++){
                        if (radioVector[radioNumber-1][temp_radio_group][k]["channel"] == channel){
                            if (radio_group == "Everyone" || temp_radio_group == "Everyone" || radio_group == temp_radio_group) isFree = false;
                        }
                    }
                }
            }
            if (isFree == true) return channel; 
        }
    }
}