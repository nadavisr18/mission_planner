function successMissionFile(data, textStatus, jqXHR)
{
    var el = document.getElementById("upload-mission-file");
    el.classList.remove('success');
    el.classList.add('success');
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
}

function uploadMissionFile()
{
    var file = document.getElementById("mission-filename").files[0];
    var sessionId = "0000";
    var missionName = "testMission";

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
            success: successMissionFile(),
            contentType: 'application/json'
        });
    }
    reader.readAsBinaryString(file);

}