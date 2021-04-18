class Waypoint {
    constructor(latlng, type, aircraft, name, altitude, baroRadio) {
      this.latlng = latlng;
      this.type = type;
      this.aircraft = aircraft;
      this.name = name;
      this.altitude = altitude;
      this.baroRadio = baroRadio;
    }
}

var waypoints = [];
var markers = [];
var lines = [];
var selectedWaypoint = null;

function onMapClick(e) 
{
    var obj;
    
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

    var waypoint_type_good = false;
    for (i = 0; i < selections["waypoint-type"].length; i++)
    {
        if (selections["waypoint-type"][i] == waypoint_type)
        {
            waypoint_type_good = true;
        }
    }

    if (waypoint_type_good == false)
    {
        var el = document.getElementById('waypoint-type-div-selected');
        el.classList.remove('select-selected-err');
        el.classList.add('select-selected-err');
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = null;
    }

    var waypoint_aircraft_good = false;
    for (i = 0; i < selections["waypoint-aircraft"].length; i++)
    {
        if (selections["waypoint-aircraft"][i] == waypoint_aircraft)
        {
            waypoint_aircraft_good = true;
        }
    }

    if (waypoint_aircraft_good == false)
    {
        var el = document.getElementById('waypoint-aircraft-div-selected');
        el.classList.remove('select-selected-err');
        el.classList.add('select-selected-err');
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = null;
    }

    if (waypoint_type_good == true && waypoint_aircraft_good == true)
    {
        if (selectedWaypoint === null)
        {
            var waypoint = new Waypoint(e.latlng, waypoint_type, waypoint_aircraft, waypoint_name, waypoint_altitude, waypoint_baroRadio);
            waypoints.push(waypoint);
        }
        else 
        {
            selectedWaypoint.latlng = e.latlng;
            selectedWaypoint.type = waypoint_type;
            selectedWaypoint.aircraft = waypoint_aircraft;
            selectedWaypoint.name = waypoint_name;
            selectedWaypoint.altitude = waypoint_altitude;
            selectedWaypoint.baroRadio = waypoint_baroRadio;
        }
        cleanMap();
        drawMap();
    }
}

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

function drawMap()
{
    var marker, polyline, icon;
    for (var i = 0; i < waypoints.length; i++)
    {  
        if (waypoints[i].type == "Anchor"){if (waypoints[i] === selectedWaypoint){icon = AnchorIconSelected;}else{icon=AnchorIcon;}}
        if (waypoints[i].type == "Route"){if (waypoints[i] === selectedWaypoint){icon = RouteIconSelected;}else{icon=RouteIcon;}}
        if (waypoints[i].type == "IP"){if (waypoints[i] === selectedWaypoint){icon = IPIconSelected;}else{icon=IPIcon;}}
        if (waypoints[i].type == "Target"){if (waypoints[i] === selectedWaypoint){icon = TargetIconSelected;}else{icon=TargetIcon;}}
        if (waypoints[i].type == "FAC"){if (waypoints[i] === selectedWaypoint){icon = FACIconSelected;}else{icon=FACIcon;}}
        if (waypoints[i].type == "SAM"){if (waypoints[i] === selectedWaypoint){icon = SAMIconSelected;}else{icon=SAMIcon;}}
        if (waypoints[i].type == "Home Base"){if (waypoints[i] === selectedWaypoint){icon = HomeBaseIconSelected;}else{icon=HomeBaseIcon;}}
        if (waypoints[i].type == "Tanker"){if (waypoints[i] === selectedWaypoint){icon = TankerIconSelected;}else{icon=TankerIcon;}}
        if (waypoints[i].type == "Contested Area"){if (waypoints[i] === selectedWaypoint){icon = ContestedAreaIconSelected;}else{icon=ContestedAreaIcon;}}
        if (waypoints[i].type == "Bullseye"){if (waypoints[i] === selectedWaypoint){icon = BullseyeIconSelected;}else{icon=BullseyeIcon;}}
        if (waypoints[i].type == "Airport"){if (waypoints[i] === selectedWaypoint){icon = AirportIconSelected;}else{icon=AirportIcon;}}
        
        marker = L.marker(waypoints[i].latlng, {icon: icon}).on('click', markerClick).addTo(mymap);
        markers.push(marker);
    }

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

    for (k = 0; k < selections["waypoint-aircraft"].length - 1; k++)
    {
        for (var i = 0; i < waypoints.length; i++)
        {  
            for (var j = i + 1; j < waypoints.length; j++)
            {  
                if (waypoints[i].aircraft == "Everyone" && waypoints[j].aircraft == "Everyone") 
                {
                    break;
                }
                var check1 = waypoints[i].aircraft == selections["waypoint-aircraft"][k] && waypoints[j].aircraft == selections["waypoint-aircraft"][k];
                var check2 = waypoints[i].aircraft == selections["waypoint-aircraft"][k] && waypoints[j].aircraft == "Everyone";
                var check3 = waypoints[i].aircraft == "Everyone" && waypoints[j].aircraft == selections["waypoint-aircraft"][k];
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

function markerClick(e)
{
    var obj;
    for (var i = 0; i < waypoints.length; i++)
    {  
        if (waypoints[i].latlng == e.latlng)
        {
            selectedWaypoint = waypoints[i];
            document.getElementById("waypoint-name").value = selectedWaypoint.name;
            document.getElementById("waypoint-altitude").value = selectedWaypoint.altitude;
            document.getElementById("waypoint-type").value = selectedWaypoint.type;
            document.getElementById("waypoint-type-div-selected").innerHTML = selectedWaypoint.type;
            document.getElementById("waypoint-aircraft").value = selectedWaypoint.aircraft;
            document.getElementById("waypoint-aircraft-div-selected").innerHTML = selectedWaypoint.aircraft;
            document.getElementById("waypoint-baro-radio").checked = selectedWaypoint.baroRadio;
        }
    }
    cleanMap();
    drawMap();
}

function onMapRightClick(e)
{
    selectedWaypoint = null;
    cleanMap();
    drawMap();
}