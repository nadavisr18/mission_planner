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
    var aircraftNames = [];
    for (var i = 0; i < data.length; i++)
    {
        group = data[i];
        if ((group.group_type == 'plane' || group.group_type == 'helicopter') && group.client == true)
        {
            groupNames.push(group.name);
            if (!aircraftNames.includes(group.unit_type))
                aircraftNames.push(group.unit_type)
        }
        latlng = {lat: group.lat, lng: group.lon}
        var attributes = {latlng: latlng, type: group.group_type, name: group.name, unit: group.unit_type, country: group.country, coalition: group.coalition, range: group.range, client: group.client}
        groups.push(new Group(attributes));

        for (var j = 0; j < group.waypoints.length; j++)
        {
            waypoints.push(new Waypoint({latlng: {lat: group.waypoints[j].lat, lng: group.waypoints[j].lon}, type: 'route', group: group.waypoints[j].group, name: group.waypoints[j].name, altitude: Math.round(group.waypoints[j].altitude), baroRadio: group.waypoints[j] == 'RADIO', id: group.waypoints[j].wp_id}))
        }
    }
    applyMapChanges();

    var fieldset = document.getElementById("flight-select-fieldset")
    for (var i = 0; i < groupNames.length; i++)
    {
        var row = fieldset.insertRow(0);
        var cell = row.insertCell(0)
        var newFieldSet = document.createElement('input');
        newFieldSet.type = "checkbox";
        newFieldSet.id = "select-flight-"+groupNames[i]
        newFieldSet.onclick = updateGroupVisibility
        newFieldSet.checked = true
        cell.appendChild(newFieldSet);

        var newlabel = document.createElement('label');
        newlabel.innerHTML = '<label for="select-flight-'+groupNames[i]+'">'+truncateToLen(groupNames[i], 50)+'</label>';
        cell.appendChild(newlabel);
    }

    document.getElementById("mission-file-label").innerHTML = "Upload mission file";
    deactivateInputs("mission-upload-input");
    activateInputs('waypoint-input');
    groupNames.unshift("Everyone");
    setupSelection(document.getElementById("radio-group"), groupNames);
    setupSelection(document.getElementById("kneeboard-group"), aircraftNames);
    setupSelection(document.getElementById("waypoint-group"), groupNames);
    unstyleSelections();
    styleSelections();

    fileUploaded = true;
    activateInputs('mission-download-input');
    activateInputs('weather-input');

    requestCurrentWeather();
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
        }, 333);
        
        animationInterval = setInterval(function() {
            if (progressBar < progressBarTarget)
            {
                progressBar += (progressBarTarget - progressBar) / 10.0;
                document.getElementById("bar").style.width = progressBar + "%";
            }  
        }, 33);

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
        form.append("aircraft", kneeboard_group);
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
    form.append("aircraft", group);
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
    var H = Math.floor(Math.random() * 24).toString()
    if (H.length == 1) H = "0"+H
    var M = Math.floor(Math.random() * 60).toString()
    if (M.length == 1) M = "0"+M
    var template = H + ":" + M 
    document.getElementById("weather-time").value = template;
    applyWeatherChange();
}

function requestCurrentWeather()
{
    var form = new FormData();
    form.append("session_id", sessionId);

    $.ajax({
        url: serverAddress+"/current_weather/"+sessionId,
        type: 'GET',
        data: JSON.stringify(Object.fromEntries(form)),
        processData: false,
        success: successWeatherChange,
        error: RESTerror,
        contentType: 'application/json'
    });
}

function applyWeatherChange()
{
    var obj = document.getElementById("weather-location");
    var location = obj.value;
    obj = document.getElementById("weather-time")
    var time = obj.value.replace(":", "")

    var form = new FormData();
    form.append("city", location);
    form.append("time", time);
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


function requestRadioChange()
{
    var obj = document.getElementById("radio-group");
    var group = obj.value;

    var list = [];
    var radioString = ''
    for (var i = 0; i <= 1; i++)
    {
        var channels = radioVector[i][group];
        for (var j = 0; j < channels.length; j++)
        {
            var radioPreset = new RadioPreset(channels[j]);
            list.push(radioPreset);
        }
    }

    for (var i = 0; i < list.length; i++) {
        radioString += list[i].getJSON();
        if (i < list.length - 1) radioString += ', ';
    }
    radioString = '['+radioString+']';

    var form = new FormData();
    form.append("group", group);
    form.append("radio_presets", radioString);

    var reqString = '{"group": "' + group + '", "channels_presets": ' + radioString + '}';

    $.ajax({
        url: serverAddress+"/radios/"+sessionId,
        type: 'POST',
        data: reqString,
        processData: false,
        success: successRadioChange,
        error: RESTerror,
        contentType: 'application/json'
    });

}

function successRadioChange(data)
{
    var obj = document.getElementById("radio-group");
    var group = obj.value;

    for (var i = 0; i <= 1; i++)
    {
        var channels = radioVector[i][group];
        for (var j = 0; j < channels.length; j++)
        {
            channels[j].saved = true;
        }
    }
    deactivateRadio(1);
    activateRadio(1);
    deactivateRadio(2);
    activateRadio(2);
}

function successWeatherChange(data)
{
    document.getElementById("wind-direction").style.transform = "rotate("+data.wind_dir+"deg)";
    document.getElementById("weather-logo").src = 'http:\\'+data.icon;
}