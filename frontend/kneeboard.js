var kneeboardVector = {};

function addKneeboardFile(filename)
{
    var obj = document.getElementById("kneeboard-aircraft");
    var kneeboard_aircraft = obj.options[obj.selectedIndex].text;
    if (true)
    {
        if (kneeboard_aircraft in kneeboardVector == false){
            kneeboardVector[kneeboard_aircraft] = [filename];
        } else {
            kneeboardVector[kneeboard_aircraft].push(filename);
        }
    }
    hideKneeboardFiles();
    showKneeboardFiles();
}

function hideKneeboardFiles()
{
    var obj = document.getElementById("kneeboard-aircraft");
    var kneeboard_aircraft = obj.options[obj.selectedIndex].text;
    var table = document.getElementById("kneeboard-table");
    var rows = table.getElementsByClassName("kneeboard-row");
    while (rows.length > 0)
    {   
        table.deleteRow(rows[0].rowIndex);
    }
}

function showKneeboardFiles()
{
    var obj = document.getElementById("kneeboard-aircraft");
    var kneeboard_aircraft = obj.options[obj.selectedIndex].text;
    if (kneeboard_aircraft in kneeboardVector == false) return;
    var table = document.getElementById("kneeboard-table");
    var rows = table.getElementsByTagName("tr");
    for (i = 0; i < kneeboardVector[kneeboard_aircraft].length; i++){
        var newRow = table.insertRow(rows.length-2);
        newRow.classList.add("kneeboard-row");
        var cell1 = newRow.insertCell(0);
        var cell2 = newRow.insertCell(1);
        cell1.classList.add("kneeboard-filename")
        cell1.innerHTML = kneeboardVector[kneeboard_aircraft][i];
        cell2.innerHTML = '<i class="fas fa-times-circle kneeboard-delete right-align" onclick="deleteKneeboardFile(\''+kneeboard_aircraft+'\',\''+kneeboardVector[kneeboard_aircraft][i]+'\')"></i>';
    }
}