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
    clearInterval(progressInterval);
    clearInterval(animationInterval);
    progressBar = 0;
    progressBarTarget = 0;
    document.getElementById("bar").style.width = "0%";

    var groupNames = [];
    for (var i = 0; i < data.length; i++)
    {
        group = data[i];
        if ((group.group_type == 'plane' || group.group_type == 'helicopter') && group.client == true)
            groupNames.push(group.name);
        latlng = {lat: group.lat, lng: group.lon}
        var attributes = {latlng: latlng, type: group.group_type, name: group.name, unit: group.unit_type, country: group.country, coalition: group.coalition, range: group.range, client: group.client}
        groups.push(new Group(attributes));

        for (var j = 0; j < group.waypoints.length; j++)
        {
            waypoints.push(new Waypoint({latlng: {lat: group.waypoints[j].lat, lng: group.waypoints[j].lon}, type: 'route', group: group.waypoints[j].group, name: group.waypoints[j].name, altitude: group.waypoints[j].altitude, baroRadio: group.waypoints[j] == 'RADIO', id: group.waypoints[j].wp_id}))
        }
    }
    applyMapChanges();
    document.getElementById("mission-file-label").innerHTML = "Upload mission file";
    deactivateInputs("mission-upload-input");
    activateInputs('waypoint-input');
    groupNames.push("Everyone");
    setupSelection(document.getElementById("radio-group"), groupNames);
    setupSelection(document.getElementById("kneeboard-group"), groupNames);
    setupSelection(document.getElementById("waypoint-group"), groupNames);
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

        progressInterval = setInterval(function() {
            requestProgress()
        }, 1000);
        
        animationInterval = setInterval(function() {
            if (progressBar < progressBarTarget)
            {
                progressBar += (progressBarTarget - progressBar) / 10.0;
                document.getElementById("bar").style.width = progressBar + "%";
            }  
        }, 50);

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

function requestProgress()
{
    $.ajax({
        url: serverAddress+"/progress",
        type: 'GET',
        processData: false,
        success: drawProgressBar,
        error: RESTerror
    });
}

function drawProgressBar(data, textStatus, jqXHR)
{
    progressBarTarget = data*100;
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
    setupSelection(document.getElementById("radio-group"), data);
    setupSelection(document.getElementById("kneeboard-group"), data);
    setupSelection(document.getElementById("waypoint-group"), data);
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
        
        var obj = document.getElementById("kneeboard-group");
        var kneeboard_group = obj.options[obj.selectedIndex].text;

        var form = new FormData();
        form.append("data", base64EncodedStr);
        form.append("group", kneeboard_group);
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

function deleteKneeboardFile(group, filename){
    var form = new FormData();
    form.append("data", "");
    form.append("group", group);
    form.append("name", filename);
    document.getElementById("kneeboard-files-label").innerHTML = "Processing file...";
    $.ajax({
        url: serverAddress+"/kneeboard/"+sessionId,
        type: 'DELETE',
        data: JSON.stringify(Object.fromEntries(form)),
        processData: false,
        success: function(result) {successDeleteFile(group, filename);},
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

function successDeleteFile(group, name){
    for (i = 0; i < kneeboardVector[group].length; i++)
    {
        if (kneeboardVector[group][i] == name) {
            kneeboardVector[group].splice(i, 1);
            hideKneeboardFiles();
            showKneeboardFiles(); 
            document.getElementById("kneeboard-files-label").innerHTML = "Upload kneeboard files";
            return;
        }
    }
}

function randomizeWeather()
{
    document.getElementById("weather-location").value = "Random";
    applyWeatherChange();
}

function applyWeatherChange()
{
    var obj = document.getElementById("weather-location");
    var location = obj.value;

    var form = new FormData();
    form.append("city", location);
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
    document.getElementById("weather-logo").src = 'http:\\'+data.icon;
}