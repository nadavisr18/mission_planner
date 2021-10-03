var sessionId = "";
var fileUploaded = false;
var kneeboardFiles = [];
var kneeboardFilesIndex = 0;

function RESTerror(jqXHR, textStatus, errorThrown)
{
    if (fileUploaded == true)
    {
        document.getElementById("mission-file-label").innerHTML = "Download mission file";
    } 
    else 
    {
        document.getElementById("mission-file-label").innerHTML = "Upload mission file";
    }
    document.getElementById("kneeboard-files-label").innerHTML = "Upload kneeboard files";
    if (jqXHR.hasOwnProperty('responseJSON') && jqXHR.responseJSON.hasOwnProperty('detail')) 
        alert("An error occurred while performing the requested operation: " + jqXHR.responseJSON.detail);
    else 
        alert("An error occurred while performing the requested operation.")
}

function successMissionFile(data, textStatus, jqXHR)
{
    var groupNames = [];
    for (var i = 0; i < data.length; i++)
    {
        groupNames.push(data[i].name);
    }
    document.getElementById("mission-file-label").innerHTML = "Upload mission file";
    deactivateInputs("mission-upload-input");
    activateInputs('waypoint-input');
    groupNames.push("Everyone");
    setupSelection(document.getElementById("radio-aircraft"), groupNames);
    setupSelection(document.getElementById("kneeboard-aircraft"), groupNames);
    setupSelection(document.getElementById("waypoint-aircraft"), groupNames);
    unstyleSelections();
    styleSelections();

    fileUploaded = true;
    activateInputs('mission-download-input');
}

function uploadMissionFile()
{
    var file = document.getElementById("mission-file").files[0];
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var filename;

    var fullPath = document.getElementById("mission-file").value;
    if (fullPath && file) {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }
    }
    else 
    {
        // TODO Error
    }

    document.getElementById("mission-file-label").innerHTML = "Processing file...";
    
    var missionName = filename;
    var reader = new FileReader();
    
    reader.onload = function () {
        var base64EncodedStr = btoa(reader.result);
        var form = new FormData();
        form.append("name", missionName);
        form.append("session_id", sessionId);
        form.append("data", base64EncodedStr);

        $.ajax({
            url: serverAddress+"/mission",
            type: 'POST',
            data: JSON.stringify(Object.fromEntries(form)),
            processData: false,
            success: successMissionFile,
            error: RESTerror,
            contentType: 'application/json'
        });
    }
    try {
        reader.readAsBinaryString(file);
    }
    catch {
        document.getElementById("mission-file-label").innerHTML = "Upload mission file";
    }
}

function processMissionFile(){
    if (fileUploaded == true)
    {
        requestMissionProcess();
    }
}

function requestAircraftList()
{
    $.ajax({
        url: serverAddress+"/mission_details/client_aircraft/"+sessionId,
        type: 'GET',
        processData: false,
        success: readAircraftList,
        error: RESTerror
    });
}

function requestMissionProcess()
{
    document.getElementById("mission-file-download-label").innerHTML = "Processing file...";

    var waypointsString = "";
    for (i = 0; i < waypoints.length; i++)
    {
        waypointsString += waypoints[i].getJSON();
        if (i < waypoints.length - 1) waypointsString += ', ';
    }
    waypointsString = '['+waypointsString+']';

    $.ajax({
        url: serverAddress+"/waypoint/"+sessionId,
        type: 'POST',
        data: waypointsString,
        processData: false,
        success: downloadMissionFile,
        error: RESTerror,
        contentType: 'application/json'
    });
}

function downloadMissionFile()
{
    $.ajax({
        url: serverAddress+"/process_mission/" + sessionId,
        type: 'GET',
        processData: false,
        success: readProcessedMission,
        error: RESTerror
    });
}

function readAircraftList(data, textStatus, jqXHR)
{
    data = data[0]; // Get the aircraft list
    document.getElementById("mission-file-label").innerHTML = "Upload mission file";
    deactivateInputs("mission-upload-input");
    activateInputs('waypoint-input');
    data.push("Everyone");
    setupSelection(document.getElementById("radio-aircraft"), data);
    setupSelection(document.getElementById("kneeboard-aircraft"), data);
    setupSelection(document.getElementById("waypoint-aircraft"), data);
    unstyleSelections();
    styleSelections();

    fileUploaded = true;
    activateInputs('mission-download-input');
}

function readProcessedMission(data, textStatus, jqXHR)
{
    var a = document.createElement("a"); 
    a.href = "data:binary/miz;base64," + data.data;
    a.download = data.name;
    a.click(); 
    document.getElementById("mission-file-download-label").innerHTML = "Apply & download";
}

function processKneeboardFiles()
{
    kneeboardFiles = document.getElementById("kneeboard-files").files;
    if (kneeboardFiles.length > 0)
    {
        document.getElementById("kneeboard-files-label").innerHTML = "Processing files...";
        kneeboardFilesIndex = 0;
        uploadKneeboardFiles();
    }
}

function uploadKneeboardFiles()
{
    var file = kneeboardFiles[kneeboardFilesIndex];
    var reader = new FileReader();
    
    reader.onload = function () {
        var base64EncodedStr = btoa(reader.result);
        
        var obj = document.getElementById("kneeboard-aircraft");
        var kneeboard_aircraft = obj.options[obj.selectedIndex].text;

        var form = new FormData();
        form.append("data", base64EncodedStr);
        form.append("aircraft", kneeboard_aircraft);
        form.append("name", file.name);

        $.ajax({
            url: serverAddress+"/kneeboard/"+sessionId,
            type: 'POST',
            data: JSON.stringify(Object.fromEntries(form)),
            processData: false,
            success: successUploadFile,
            error: RESTerror,
            contentType: 'application/json'
        });
    }
    try {
        reader.readAsBinaryString(file);
    }
    catch {
        document.getElementById("kneeboard-files-label").innerHTML = "Upload kneeboard files";
    }
}

function deleteKneeboardFile(aircraft, filename){
    var form = new FormData();
    form.append("data", "");
    form.append("aircraft", aircraft);
    form.append("name", filename);
    document.getElementById("kneeboard-files-label").innerHTML = "Processing file...";
    $.ajax({
        url: serverAddress+"/kneeboard/"+sessionId,
        type: 'DELETE',
        data: JSON.stringify(Object.fromEntries(form)),
        processData: false,
        success: function(result) {successDeleteFile(aircraft, filename);},
        error: RESTerror,
        contentType: 'application/json'
    });
}

function successUploadFile(){
    addKneeboardFile(kneeboardFiles[kneeboardFilesIndex].name);
    kneeboardFilesIndex++;
    if (kneeboardFilesIndex < kneeboardFiles.length) uploadKneeboardFiles();
    else {document.getElementById("kneeboard-files-label").innerHTML = "Upload kneeboard files";}
}

function successDeleteFile(aircraft, name){
    for (i = 0; i < kneeboardVector[aircraft].length; i++)
    {
        if (kneeboardVector[aircraft][i] == name) {
            console.log("splicing");
            kneeboardVector[aircraft].splice(i, 1);
            hideKneeboardFiles();
            showKneeboardFiles(); 
            document.getElementById("kneeboard-files-label").innerHTML = "Upload kneeboard files";
            return;
        }
    }
}

function applyWeatherChange()
{
    var obj = document.getElementById("weather-location");
    var location = obj.value;

    console.log(location)

    var form = new FormData();
    form.append("city", obj);
    form.append("time", "0000");
    form.append("session_id", sessionId);

    $.ajax({
        url: serverAddress+"/weather/"+sessionId,
        type: 'POST',
        data: JSON.stringify(Object.fromEntries(form)),
        processData: false,
        success: successWeatherChange,
        error: RESTerror,
        contentType: 'application/json'
    });
}

function successWeatherChange(data)
{
    document.getElementById("wind-direction").style.transform = "rotate("+data.wind_dir+"deg)";
    console.log(data);
}