/* Create the leaflet map, set the provider, and bind the click callbacks */
function setupLeafletMap() {
    mymap = L.map('mapid').setView([33.47, 35.13], 7);
    mymap.on('click', onMapClick);
    mymap.on('contextmenu', onMapRightClick)

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }).addTo(mymap);
}

/* Read the configuration file and set the values of the dropdown selections */
function setupSelections(){
    var objs = document.getElementsByClassName("selection");
    for (i = 0; i < objs.length; i++)
    {
        var values = selections[objs[i].id]
        var c;
        c = document.createElement("option");
        c.text = "..."; /* The default value, to force the user to make sure he selected the right value */
        objs[i].options.add(c, 0);
        for (j = 0; j < values.length; j++)
        {
            c = document.createElement("option");
            c.text = values[j];
            objs[i].options.add(c, j+1);
        }
    }
    styleSelections();  /* Set the style of our custom selections */
}

/* Setup the page */
function setupPage(){
    /* Set the page of the main content height */
    document.getElementById("root-table").style.height = (window.innerHeight-20) + "px";

    /* Setup the leaflet map */
    setupLeafletMap();

    /* Setup the multiselection objects */
    setupSelections();
}

/* Resize the table to vertically fill the page */
function resizePage(){
    /* Set the page of the main content height */
    document.getElementById("root-table").style.height = (window.innerHeight-20) + "px";
}

function selectionCallback(id, i)
{
    var obj;
    if (id == "waypoint-type-div")
    {
        obj = document.getElementById("waypoint-type");
        var waypoint_type = obj.options[obj.selectedIndex].text;
        if (waypoint_type == "Target" || waypoint_type == "SAM" || waypoint_type == "Airport" || waypoint_type == "Contested Area" || waypoint_type == "Home Base")
        {
            var input = document.getElementById("waypoint-altitude")
            input.classList.add("greyed");
            input.value = "0";
            input.disabled = true;
            document.getElementById("waypoint-baro-radio").checked = false;
            
        }
        else 
        {
            var input = document.getElementById("waypoint-altitude")
            input.classList.remove("greyed");
            input.disabled = false;
        }
    }
    else if (id == "waypoint-aircraft-div"){
        obj = document.getElementById("waypoint-aircraft");
        var waypoint_aircraft =  obj.options[obj.selectedIndex].text;
        if (waypoint_aircraft != "..." && waypoint_aircraft != "Everyone") activateRadioInputs();
        else deactivateRadioInputs();
    }
}

/* Main loop */
window.onload = setupPage;
window.onresize = resizePage;

