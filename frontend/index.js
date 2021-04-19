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

/* Main loop */
window.onload = setupPage;

