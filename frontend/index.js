function setupLeafletMap() {
    mymap = L.map('mapid').setView([33.47, 35.13], 7);
    mymap.on('click', onMapClick);
    mymap.on('contextmenu', onMapRightClick)

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }).addTo(mymap);
}

function setupSelections(){
    var objs = document.getElementsByClassName("sel");
    for (i = 0; i < objs.length; i++)
    {
        var values = selections[objs[i].id]
        var c;
        c = document.createElement("option");
        c.text = "...";
        objs[i].options.add(c, 0);
        for (j = 0; j < values.length; j++)
        {
            c = document.createElement("option");
            c.text = values[j];
            objs[i].options.add(c, j+1);
        }
    }
    styleSelections();
}

function setupPage(){
    /* Set the page of the main content height */
    document.getElementById("rootTable").style.height = (window.innerHeight-20) + "px";

    /* Setup the leaflet map */
    setupLeafletMap();

    /* Setup the multiselection objects */
    setupSelections();
    
}

var mymap;
window.onload = setupPage;

