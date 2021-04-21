/* Waypoint class */
class Waypoint {
    constructor(attributes) {

      this.latlng = attributes.latlng;
      this.type = attributes.type;
      this.aircraft = attributes.aircraft;
      this.name = attributes.name;
      this.altitude = attributes.altitude;
      this.baroRadio = attributes.baroRadio;
    }

    getAttributes()
    {
        return {latlng: this.latlng, type: this.type, aircraft: this.aircraft, name: this.name, altitude: this.altitude, baroRadio: this.baroRadio}
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
        var el = document.getElementById('waypoint-type-div-selected');
        el.classList.remove('select-selected-err');
        el.classList.add('select-selected-err');
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = null;
    }

     /* Check if the waypoint aircraft was selected, otherwise play the error animation */
    if (waypoint_aircraft == "...")
    {
        var el = document.getElementById('waypoint-aircraft-div-selected');
        el.classList.remove('select-selected-err');
        el.classList.add('select-selected-err');
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = null;
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
    if (selections["waypoint-aircraft"].length != selections["lines-aircraft-colors"].length)
    {
        console.log("Number of aircraft types is different from number of line colors.");
        return "#FFFFFF";
    }
    for (var i = 0; i < selections["waypoint-aircraft"].length; i++)
    {
        if (selections["waypoint-aircraft"][i] == aircraft_type)
        {
            return selections["lines-aircraft-colors"][i];
        }
    }
}

/* Draws the map adding markers, lines and polygons */
function drawMap()
{
    var marker, polyline, icon;
    for (var i = 0; i < waypoints.length; i++)
    {  
        /* Draw the marker and add the selected/unselected icon */
        if (waypoints[i].type == "Anchor"){if (waypoints[i] === selectedWaypoint){icon = AnchorIconSelected;} else {icon=AnchorIcon;}}
        if (waypoints[i].type == "Route"){if (waypoints[i] === selectedWaypoint){icon = RouteIconSelected;} else {icon=RouteIcon;}}
        if (waypoints[i].type == "IP"){if (waypoints[i] === selectedWaypoint){icon = IPIconSelected;} else {icon=IPIcon;}}
        if (waypoints[i].type == "Target"){if (waypoints[i] === selectedWaypoint){icon = TargetIconSelected;} else {icon=TargetIcon;}}
        if (waypoints[i].type == "FAC"){if (waypoints[i] === selectedWaypoint){icon = FACIconSelected;} else {icon=FACIcon;}}
        if (waypoints[i].type == "SAM"){if (waypoints[i] === selectedWaypoint){icon = SAMIconSelected;} else {icon=SAMIcon;}}
        if (waypoints[i].type == "Home Base"){if (waypoints[i] === selectedWaypoint){icon = HomeBaseIconSelected;} else {icon=HomeBaseIcon;}}
        if (waypoints[i].type == "Tanker"){if (waypoints[i] === selectedWaypoint){icon = TankerIconSelected;} else {icon=TankerIcon;}}
        if (waypoints[i].type == "Contested Area"){if (waypoints[i] === selectedWaypoint){icon = ContestedAreaIconSelected;} else {icon=ContestedAreaIcon;}}
        if (waypoints[i].type == "Bullseye"){if (waypoints[i] === selectedWaypoint){icon = BullseyeIconSelected;} else {icon=BullseyeIcon;}}
        if (waypoints[i].type == "Airport"){if (waypoints[i] === selectedWaypoint){icon = AirportIconSelected;} else {icon=AirportIcon;}}
        
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

    /* Draw the aircraft specific lines */
    for (k = 0; k < selections["waypoint-aircraft"].length - 1; k++)
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
                var check1 = waypoints[i].aircraft == selections["waypoint-aircraft"][k] && waypoints[j].aircraft == selections["waypoint-aircraft"][k];
                var check2 = waypoints[i].aircraft == selections["waypoint-aircraft"][k] && waypoints[j].aircraft == "Everyone";
                var check3 = waypoints[i].aircraft == "Everyone" && waypoints[j].aircraft == selections["waypoint-aircraft"][k];
                /* Draw the line */
                if (check1 || check2 || check3)
                {
                    polyline = L.polyline([waypoints[i].latlng, waypoints[j].latlng], {color: getLineColor(selections["waypoint-aircraft"][k])}).addTo(mymap);
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