/* Waypoint class */
function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

class Waypoint {
    constructor(attributes) {

      this.latlng = attributes.latlng;
      this.type = attributes.type;
      this.aircraft = attributes.aircraft;
      this.name = attributes.name;
      this.altitude = attributes.altitude;
      this.baroRadio = attributes.baroRadio;
      this.id = create_UUID();  // Random id
    }

    getAttributes()
    {
        return {latlng: this.latlng, type: this.type, aircraft: this.aircraft, name: this.name, altitude: this.altitude, baroRadio: this.baroRadio}
    }

    getJSON()
    {
        var string = "";
        string += '"lat":'+this.latlng.lat; string += ', ';
        string += '"lng":'+this.latlng.lng; string += ', ';
        string += '"altitude":'+this.altitude; string += ', ';
        string += '"aicraft": "'+this.aircraft+'"'; string += ', ';
        string += '"name":"'+this.name+'"'; string += ', ';
        if (this.baroRadio == true){ string += '"alt_type":"RADIO"'; string += ', ';}
        else {string += '"alt_type":"BARO"'; string += ', ';}
        string += '"wp_id":"'+this.id+'"';

        return '{'+string+'}';
    }
}

/* Global variables */
var waypointsHistory = [[]];
var activeWaypointHistory = 0;
var waypoints = [];
var markers = [];
var lines = [];
var selectedWaypoint = null;
var mymap;
var tileLayer = null;

/* Changle the tiles layer provider */
function setMapProvider(mapProvider)
{
    if (tileLayer != null) mymap.removeLayer(tileLayer);
    if (mapProvider == "OpenTopoMap"){
        tileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
    } else if (mapProvider == "OpenStreetMap")
    {
        tileLayer =  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
    }
    tileLayer.addTo(mymap);
}

/* Create the leaflet map, set the provider, and bind the click callbacks */
function setupLeafletMap() {
    mymap = L.map('mapid').setView([33.47, 35.13], 7);
    mymap.on('click', onMapClick);
    mymap.on('contextmenu', onMapRightClick)
    setMapProvider("OpenTopoMap");
}

/* Left click callback */
function onMapClick(e) 
{
    var obj;
    
    /* Get the current values of the waypoint control inputs */
    obj = document.getElementById("waypoint-name");
    var waypoint_name =  obj.value;
    obj = document.getElementById("waypoint-altitude");
    var waypoint_altitude =  obj.value;
    obj = document.getElementById("waypoint-type");
    var waypoint_type =  obj.options[obj.selectedIndex].text;
    obj = document.getElementById("waypoint-aircraft");
    var waypoint_aircraft =  obj.options[obj.selectedIndex].text;
    obj = document.getElementById("waypoint-baro-radio");
    var waypoint_baroRadio =  obj.checked;

    /* Check if the waypoint type was selected, otherwise play the error animation */
    if (waypoint_type == "...")
    {
        flashError(document.getElementById('waypoint-type-div-selected'));
    }

     /* Check if the waypoint aircraft was selected, otherwise play the error animation */
    if (waypoint_aircraft == "...")
    {
        flashError(document.getElementById('waypoint-aircraft-div-selected'));
    }

    if (waypoint_type != "..." && waypoint_aircraft != "...")
    {
        /* If no waypoint is currently selected, add a new waypoint */
        if (selectedWaypoint === null)
        {
            var attributes = {latlng: e.latlng, type: waypoint_type, aircraft: waypoint_aircraft, name: waypoint_name, altitude: waypoint_altitude, baroRadio: waypoint_baroRadio}
            var waypoint = new Waypoint(attributes);
            waypoints.push(waypoint);
        }
        /* If a waypoint is selected, update its properties */
        else 
        {
            selectedWaypoint.latlng = e.latlng;
            selectedWaypoint.type = waypoint_type;
            selectedWaypoint.aircraft = waypoint_aircraft;
            selectedWaypoint.name = waypoint_name;
            selectedWaypoint.altitude = waypoint_altitude;
            selectedWaypoint.baroRadio = waypoint_baroRadio;
        }

        applyMapChanges();
    }
}

/* Remove all objects from the map */
function cleanMap()
{
    for (i = 0; i < markers.length; i++)
    {
        mymap.removeLayer(markers[i]);
    }
    for (i = 0; i < lines.length; i++)
    {
        mymap.removeLayer(lines[i]);
    }
}

/* Retrieve the color of the line from the configuration file */
function getLineColor(aircraft_type)
{
    obj = document.getElementById("waypoint-aircraft");
    var waypoint_aircraft =  obj.options[obj.selectedIndex].text;
    if (aircraft_type == waypoint_aircraft)
        return "#537099";
    return "#212d3c";
}

/* Draws the map adding markers, lines and polygons */
function drawMap()
{
    var marker, polyline, icon;
    for (var i = 0; i < waypoints.length; i++)
    {  
        /* Draw the marker and add the selected/unselected icon */
        var html = `
        <table>
            <tr>
                <td class="icon-text">
                    $waypoint-type$
                <td>
            </tr>
            <tr>
                <td class="icon-symbol">
                    $icon$
                <td>
            </tr>
            <tr>    
                <td class="icon-text">
                    $waypoint-name$
                <td>
            </tr>
        </table>
        `;

        html = html.replace('$waypoint-type$', waypoints[i].aircraft);
        if (selectedWaypoint == waypoints[i])
        {
            html = html.replace('$icon$', iconSelectedHtmls[waypoints[i].type]);
        } 
        else 
        {
            html = html.replace('$icon$', iconHtmls[waypoints[i].type]);
        }
        
        html = html.replace('$waypoint-name$', waypoints[i].name);

        var icon = L.divIcon({
            html: html,
            iconSize: [80, 80],
            className: waypoints[i].type
        });

        /* Add the marker */
        marker = L.marker(waypoints[i].latlng, {icon: icon}).on('click', markerClick).addTo(mymap);
        markers.push(marker);
    }

    /* Draw all the lines for "Everyone" */
    for (var i = 0; i < waypoints.length; i++)
    {  
        for (var j = i + 1; j < waypoints.length; j++)
        {  
            if (waypoints[i].aircraft == "Everyone" && waypoints[j].aircraft == "Everyone")
            {
                polyline = L.polyline([waypoints[i].latlng, waypoints[j].latlng], {color: getLineColor(waypoints[i].aircraft)}).addTo(mymap);
                lines.push(polyline);
                break;
            }
        }    
    }

    /* Make a list of all the aircraft which have a waypoint */
    var activeAircraft = [];
    for (var i = 0; i < waypoints.length; i++){
        if (activeAircraft.indexOf(waypoints[i].aircraft) == -1) activeAircraft.push(waypoints[i].aircraft)
    }

    /* Draw the aircraft specific lines */
    for (k = 0; k < activeAircraft.length; k++)
    {
        /* Cycle on each "start" point */
        for (var i = 0; i < waypoints.length; i++)
        {  
            /* Search for an appropriate "end" point*/
            for (var j = i + 1; j < waypoints.length; j++)
            {  
                /* If both the start and end points are for "Everyone", we can directly skip to the next start point */
                if (waypoints[i].aircraft == "Everyone" && waypoints[j].aircraft == "Everyone") 
                {
                    break;
                }

                /* Check if we should draw an aircraft specifc line */
                var check1 = waypoints[i].aircraft == activeAircraft[k] && waypoints[j].aircraft == activeAircraft[k];
                var check2 = waypoints[i].aircraft == activeAircraft[k] && waypoints[j].aircraft == "Everyone";
                var check3 = waypoints[i].aircraft == "Everyone" && waypoints[j].aircraft == activeAircraft[k];
                /* Draw the line */
                if (check1 || check2 || check3)
                {
                    polyline = L.polyline([waypoints[i].latlng, waypoints[j].latlng], {color: getLineColor(activeAircraft[k])}).addTo(mymap);
                    lines.push(polyline);
                    i = j - 1; 
                    break;
                } 
            }    
        }
    }
}

/* Map right click callback */
function onMapRightClick(e)
{
    /* Unselect the selected waypoint */
    selectedWaypoint = null;
    cleanMap();
    drawMap();
}

/* Marker click callback */
function markerClick(e)
{
    var obj;
    for (var i = 0; i < waypoints.length; i++)
    {  
        if (waypoints[i].latlng == e.latlng)
        {
            /* Select the waypoint and update the inputs with its properties */
            selectedWaypoint = waypoints[i];
            document.getElementById("waypoint-name").value = selectedWaypoint.name;
            document.getElementById("waypoint-altitude").value = selectedWaypoint.altitude;
            document.getElementById("waypoint-type").value = selectedWaypoint.type;
            document.getElementById("waypoint-type-div-selected").innerHTML = selectedWaypoint.type;
            document.getElementById("waypoint-aircraft").value = selectedWaypoint.aircraft;
            document.getElementById("waypoint-aircraft-div-selected").innerHTML = selectedWaypoint.aircraft;
            document.getElementById("waypoint-baro-radio").checked = selectedWaypoint.baroRadio;
            break;
        }
    }
    cleanMap();
    drawMap();
}

function mapUndo()
{
    if (activeWaypointHistory > 0)
    { 
        /* Unselect the selected waypoint */
        selectedWaypoint = null;
        activeWaypointHistory--;
        waypoints = [...waypointsHistory[activeWaypointHistory]];
        cleanMap();
        drawMap();
    }
}

function mapRedo()
{
    if (activeWaypointHistory < waypointsHistory.length - 1)
    { 
        /* Unselect the selected waypoint */
        selectedWaypoint = null;
        activeWaypointHistory++;
        waypoints = [...waypointsHistory[activeWaypointHistory]];
        cleanMap();
        drawMap();
    }
}

function applyWaypointChange()
{
    /* If no waypoint is currently selected, do nothing */
    if (selectedWaypoint === null)
    {
        return
    }
    /* If a waypoint is selected, update its properties */
    else 
    {
        /* Get the current values of the waypoint control inputs */
        obj = document.getElementById("waypoint-name");
        var waypoint_name =  obj.value;
        obj = document.getElementById("waypoint-altitude");
        var waypoint_altitude =  obj.value;
        obj = document.getElementById("waypoint-type");
        var waypoint_type =  obj.options[obj.selectedIndex].text;
        obj = document.getElementById("waypoint-aircraft");
        var waypoint_aircraft =  obj.options[obj.selectedIndex].text;
        obj = document.getElementById("waypoint-baro-radio");
        var waypoint_baroRadio =  obj.checked;

        selectedWaypoint.type = waypoint_type;
        selectedWaypoint.aircraft = waypoint_aircraft;
        selectedWaypoint.name = waypoint_name;
        selectedWaypoint.altitude = waypoint_altitude;
        selectedWaypoint.baroRadio = waypoint_baroRadio;
    }

    applyMapChanges();
}

function applyMapChanges()
{
    /* Make a deep copy of the waypoints */
    var newWaypoints = [];
    for (i = 0; i < waypoints.length; i++)
    {
        newWaypoints.push(new Waypoint(waypoints[i].getAttributes()))
    }

    /* If we have undone some change, the new changes overwrite the old */
    while (waypointsHistory.length > activeWaypointHistory + 1){
        waypointsHistory.pop();
    }        

    waypointsHistory.push(newWaypoints);
    activeWaypointHistory++;

    var string = document.getElementById("waypoint-name").value;
    var num = string.match(/\d+/);
    document.getElementById("waypoint-name").value = string.replace(num, parseInt(num)+1);

    /* Clean and redraw the map */
    cleanMap();
    drawMap();
}

function mapClear()
{
    waypoints = [];
    applyMapChanges();
}

function deleteWaypoint()
{
    for (var i = 0; i < waypoints.length; i++)
    {  
        if (waypoints[i] === selectedWaypoint){
            selectedWaypoint = null;
            waypoints.splice(i, 1);
            applyMapChanges();
            return;
        }
    }
}