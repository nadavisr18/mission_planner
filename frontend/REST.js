var sessionId = "";

function successMissionFile(data, textStatus, jqXHR)
{
    if (data){
        alert("An error occured while parsing the file");
        document.getElementById("upload-mission-file").innerHTML = "Upload mission file";
        // TODO: add red flash
    } else {
        requestAircraftList();
    }
}

function RESTerror()
{
    document.getElementById("upload-mission-file").innerHTML = "Upload mission file";
    alert("An error occurred while performing the requested operation")
}

function uploadMissionFile()
{
    var file = document.getElementById("mission-filename").files[0];
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var filename;

    var fullPath = document.getElementById("mission-filename").value;
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

    document.getElementById("upload-mission-file").innerHTML = "Processing file...";
    
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
    reader.readAsBinaryString(file);
}

function requestAircraftList()
{
    $.ajax({
        url: serverAddress+"/mission_details/aircraft_types/" + sessionId,
        type: 'GET',
        processData: false,
        success: readAircraftList,
        error: RESTerror
    });
}

function readAircraftList(data, textStatus, jqXHR)
{
    var el = document.getElementById("upload-mission-file");
    el.classList.remove('success');
    el.classList.add('success');
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
    document.getElementById("upload-mission-file").innerHTML = "Upload mission file";

    data.push("Everyone");
    setupSelection(document.getElementById("waypoint-aircraft"), data);
    unstyleSelections();
    styleSelections();
}
