function setupLeafletMap() {
    var mymap = L.map('mapid').setView([33.47, 35.13], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	    maxZoom: 18,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

window.onload = setupPage;

