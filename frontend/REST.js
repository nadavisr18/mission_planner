var sessionId = "";
var fileUploaded = false;
var kneeboardFiles = [];
var kneeboardFilesIndex = 0;

function RESTerror()
{
    if (fileUploaded == true)
    {
        document.getElementById("mission-file-label").innerHTML = "Download mission file";
        
    } 
    else 
    {
        document.getElementById("mission-file-label").innerHTML = "Upload mission file";
    }
    alert("An error occurred while performing the requested operation")
}

function successMissionFile(data, textStatus, jqXHR)
{
    if (data){
        alert("An error occured while parsing the file");
        document.getElementById("mission-file-label").innerHTML = "Upload mission file";
        // TODO: add red flash
    } else {
        requestAircraftList();
    }
}

function processMissionFile()
{
    if (fileUploaded == false)
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
    else 
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
    document.getElementById("mission-file-label").innerHTML = "Processing file...";

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
    document.getElementById("mission-file-label").innerHTML = "Download mission file";
    activateInputs('waypoint-input');
    activateInputs('kneeboard-input');
    setupSelection(document.getElementById("radio-aircraft"), data);
    data.push("Everyone");
    setupSelection(document.getElementById("waypoint-aircraft"), data);
    unstyleSelections();
    styleSelections();

    fileUploaded = true;
    document.getElementById("mission-file").disabled = true;
    document.getElementById("mission-file-label").onclick = processMissionFile;
}

function readProcessedMission(data, textStatus, jqXHR)
{
    var a = document.createElement("a"); 
    a.href = "data:binary/miz;base64," + data.data;
    a.download = data.name;
    a.click(); 
    document.getElementById("mission-file-label").innerHTML = "Download mission file";
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
    file = kneeboardFiles[kneeboardFilesIndex];

    var reader = new FileReader();
    
    reader.onload = function () {
        var base64EncodedStr = btoa(reader.result);
        var form = new FormData();
        form.append("aircraft", "test");
        form.append("data", base64EncodedStr);

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

function successUploadFile(){
    kneeboardFilesIndex++;
    if (kneeboardFilesIndex < kneeboardFiles.length) uploadKneeboardFiles();
    else {document.getElementById("kneeboard-files-label").innerHTML = "Upload kneeboard files";}
}


