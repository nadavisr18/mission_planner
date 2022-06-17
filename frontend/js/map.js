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
        this.group = attributes.group;
        this.name = attributes.name;
        this.altitude = attributes.altitude;
        this.baroRadio = attributes.baroRadio;
        if ("id" in attributes)
            this.id = attributes.id;
        else
            this.id = create_UUID();  // Random id
    }

    getAttributes()
    {
        return {latlng: this.latlng, type: this.type, group: this.group, name: this.name, altitude: this.altitude, baroRadio: this.baroRadio, id: this.id}
    }

    getJSON()
    {
        var string = "";
        string += '"lat":'+this.latlng.lat; string += ', ';
        string += '"lon":'+this.latlng.lng; string += ', ';
        string += '"altitude":'+this.altitude; string += ', ';
        string += '"group": "'+this.group+'"'; string += ', ';
        string += '"name":"'+this.name+'"'; string += ', ';
        if (this.baroRadio == true){ string += '"alt_type":"RADIO"'; string += ', ';}
        else {string += '"alt_type":"BARO"'; string += ', ';}
        string += '"wp_id":"'+this.id+'"';
        return '{'+string+'}';
    }
}

class Group {
    constructor(attributes) {
      this.latlng = attributes.latlng;
      this.type = attributes.type;
      this.name = attributes.name;
      this.unit = attributes.unit;
      this.country = attributes.country;
      this.coalition = attributes.coalition;
      this.range = attributes.range;
      this.client = attributes.client;
      this.visible = true;
      this.enabled = true;
    }

    getAttributes()
    {
        return {latlng: this.latlng, type: this.type, name: this.name, aircraft: this.unit, country: this.country, coalition: this.coalition, range: this.range, client: this.client}
    }
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/* Global variables */
var waypointsHistory = [[]];
var activeWaypointHistory = 0;
var waypoints = [];
var groups = [];
var markers = [];
var lines = [];
var selectedWaypoint = null;
var selectedGroup = null;
var mymap;
var tileLayer = null;
var visibility;
var waypoint_tab_open = false;
var radios_tab_open = false;

//if (getCookie('visibility') == null)
//{
// TODO fixing, needs more testing. Not reproducible on local machine because cookies don't work locally (by design)
visibility = ['user', 'non-user', 'SAM', 'vehicle', 'static', 'ship', 'flag']
//} else 
//{
//    visibility = getCookie('visibility');
//}

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
    else if (mapProvider == "Mapbox Satellite")
    {
        tileLayer =  L.tileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.pngraw?access_token=pk.eyJ1IjoibmFkYXZmciIsImEiOiJja3ZtYXpzZDE1N3hmMnFvazZsbDk0OWh3In0.lMcppAAJbflwlwman-AQhg', {
                maxZoom: 19,
                attribution: 'MapBox'
            });
    }
    else if (mapProvider == "TPC")
    {
        tileLayer =  L.tileLayer('./maps/{z}/{x}/{y}.png', {
                maxZoom: 11,
                attribution: 'MapBox'
            });
    }
    tileLayer.addTo(mymap);
}

/* Create the leaflet map, set the provider, and bind the click callbacks */
function setupLeafletMap() {
    mymap = L.map('mapid').setView([33.47, 35.13], 7);
    mymap.on('click', onMapClick);
    mymap.on('contextmenu', onMapRightClick)
    setMapProvider(selections["map-provider"][0]);
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
    obj = document.getElementById("waypoint-group");
    var waypoint_group =  obj.options[obj.selectedIndex].text;
    obj = document.getElementById("waypoint-baro-radio");
    var waypoint_baroRadio =  obj.checked;

    /* Check if the waypoint type was selected, otherwise play the error animation */
    if (waypoint_type == "...")
    {
        flashError(document.getElementById('waypoint-type-div-selected'));
    }

     /* Check if the waypoint group was selected, otherwise play the error animation */
    if (waypoint_group == "...")
    {
        flashError(document.getElementById('waypoint-group-div-selected'));
    }

    if (waypoint_type != "..." && waypoint_group != "..." && waypoint_tab_open)
    {
        /* If no waypoint is currently selected, add a new waypoint */
        if (selectedWaypoint === null)
        {
            if (waypoint_group === "Everyone" || (selectedGroup !== null && findWaypointsByGroup(selectedGroup).length == 0)) 
            {
                var attributes = {latlng: e.latlng, type: waypoint_type, group: waypoint_group, name: waypoint_name, altitude: waypoint_altitude, baroRadio: waypoint_baroRadio}
                var waypoint = new Waypoint(attributes);
                waypoints.push(waypoint);
                selectedWaypoint = waypoint;
                autoIncreaseWaypoint();
            } 
        }
        /* If a waypoint is selected, update its properties */
        else 
        {
            if (!e.originalEvent.ctrlKey) 
            {
                var attributes = {latlng: e.latlng, type: waypoint_type, group: waypoint_group, name: waypoint_name, altitude: waypoint_altitude, baroRadio: waypoint_baroRadio}
                var waypoint = new Waypoint(attributes);
                index = waypoints.findIndex(element => element == selectedWaypoint);
                if (waypoint_group === "Everyone")
                {
                    waypoints.push(waypoint);
                }
                else 
                {
                    waypoints.splice(index+1, 0, waypoint);
                }
                selectedWaypoint = waypoint;
                autoIncreaseWaypoint();
            }
            else
            {
                selectedWaypoint.latlng = e.latlng;
                selectedWaypoint.type = waypoint_type;
                selectedWaypoint.group = waypoint_group;
                selectedWaypoint.name = waypoint_name;
                selectedWaypoint.altitude = waypoint_altitude;
                selectedWaypoint.baroRadio = waypoint_baroRadio;
            }
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
function getLineColor(group_type)
{
    obj = document.getElementById("waypoint-group");
    var waypoint_group = obj.options[obj.selectedIndex].text;
    if (group_type == waypoint_group)
        return "#212d3c";
    else {
        var color = getGroupByName(group_type).coalition;
        if (!getGroupByName(group_type).client){
            if (color == "red") color = "#ba6c57";
            else color = "#576cba";
        }
    }
    return color;
}

function truncateToLen(string, length)
{
    if (string.length > length)
    {
        return string.substring(0, length-3) + "...";
    }
    if (string.length == 0)
    {
        return "&nbsp";
    }

    return string
}

function toggleVisibility(object)
{
    if (visibility.includes(object))
    {
        document.getElementById("visibility-"+object).classList.remove("selected");
        var index = visibility.indexOf(object);
        if (index !== -1) {
            visibility.splice(index, 1);
        }
    }
    else
    {
        document.getElementById("visibility-"+object).classList.add("selected");
        visibility.push(object);
    }
    cleanMap();
    drawMap();

    setCookie('visibility', visibility.toString(), null);
}

function updateGroupVisibility()
{
    for (var i = 0; i < groups.length; i++)
    {
        if (groups[i].client)
        {
            var input = document.getElementById("select-flight-"+(groups[i].name));
            groups[i].enabled = input.checked;
        }
    }
    applyMapChanges();
}

function setGroupsVisibility(visibility)
{
    for (var i = 0; i < groups.length; i++)
    {
        if (groups[i].client)
        {
            var input = document.getElementById("select-flight-"+(groups[i].name));
            input.checked = visibility;
        }
    }
    updateGroupVisibility();
}

function getGroupByName(groupName)
{
    for (var i = 0; i < groups.length; i++)
    {
        if (groups[i].name == groupName) 
            return groups[i] 
    }
    if (groupName === "Everyone")
    {
        return new Group( {latlng: [0, 0], type: null, name: null, unit: null, country: null, coalition: "blue", range: null, client: true})
    }
    return null
}

function findWaypointsByGroup(group)
{
    var foundWaypoints = [];
    for (let i = 0; i < waypoints.length; i++)
    {
        if (waypoints[i].group === group.name || waypoints[i].group === "Everyone")
        {
            foundWaypoints.push(waypoints[i]);
        }
    }
    
    return foundWaypoints;
}

/* Draws the map adding markers, lines and polygons */
function drawMap()
{
    var marker, polyline, icon, tempWaypoints, flyable;
    tempWaypoints = waypoints.slice();

    for (var i = 0; i < groups.length; i++)
    {  
        flyable = false;
        /* Draw the marker and add the selected/unselected icon */
        var html = grouphtml;
        if (selectedGroup !== null && groups[i].name == selectedGroup.name && findWaypointsByGroup(groups[i]).length == 0)
        {
            html = groupSelectedHtml;
        }

        for (var key in isoCountries)
        {
            if(isoCountries[key] == groups[i].country)
            {
                if (visibility.includes('flag'))
                {
                    html = html.replace('$icon$', `<div class="image-cropper-$color$">
                    <img class="country-flag" src="https://flagcdn.com/w80/`+key.toLowerCase()+`.png"></div>
                    <img class="aircraft-icon-blurred" src="$aircraft-logo$.png">
                    <img class="aircraft-icon-$color$" src="$aircraft-logo$.png">`);
                } else 
                {
                    html = html.replace('$icon$', `
                    <img class="aircraft-icon-blurred" src="$aircraft-logo$.png">
                    <img class="aircraft-icon-$color$" src="$aircraft-logo$.png">`);
                }
                html = html.replaceAll('$color$', groups[i].coalition);
                if (groups[i].type == 'plane' || groups[i].type == 'helicopter')
                {
                    var attributes = {latlng: groups[i].latlng, type: "spawn", group: groups[i].name, name: "spawn", altitude: 0, baroRadio: "radio"}
                    var waypoint = new Waypoint(attributes);
                    tempWaypoints.unshift(waypoint);
                    html = html.replaceAll('$aircraft-logo$', './Aircrafts/'+groups[i].unit);
                    html = html.replace('$waypoint-type$', truncateToLen(groups[i].name, 12));
                    if (groups[i].client == true)
                        flyable = true;
                }
                else if (groups[i].type == 'ship')
                {
                    var attributes = {latlng: groups[i].latlng, type: "spawn", group: groups[i].name, name: "spawn", altitude: 0, baroRadio: "radio"}
                    var waypoint = new Waypoint(attributes);
                    tempWaypoints.unshift(waypoint);
                    if (groups[i].unit.includes("CV"))
                        html = html.replaceAll('$aircraft-logo$', './Naval/CVN');
                    else
                        html = html.replaceAll('$aircraft-logo$', './Naval/naval');
                }
                else if (groups[i].type == 'vehicle')
                        if (groups[i].range > 0){
                            if (visibility.includes('vehicle') && visibility.includes('SAM'))
                            {
                                marker = L.circle(groups[i].latlng, {radius: groups[i].range, color: groups[i].coalition}).addTo(mymap);
                                markers.push(marker);
                            }
                            html = html.replaceAll('$aircraft-logo$', './Ground/SAM');
                        }
                    else 
                        html = html.replaceAll('$aircraft-logo$', './Ground/tank');
                else if (groups[i].unit == 'Base')
                    html = html.replaceAll('$aircraft-logo$', './Ground/base');
                else if (groups[i].unit == 'FARP')
                    html = html.replaceAll('$aircraft-logo$', './Ground/farp');
               
                html = html.replaceAll('$aircraft$', truncateToLen(groups[i].unit, 12));
            }
        }
        
        html = html.replace('$waypoint-type$', "&nbsp");

        if (((groups[i].type == 'plane' || groups[i].type == 'helicopter') && (groups[i].client == true) && (visibility.includes('user'))) ||
            ((groups[i].type == 'plane' || groups[i].type == 'helicopter') && (groups[i].client == false) && (visibility.includes('non-user'))) ||
            ((groups[i].type == 'vehicle') && (visibility.includes('vehicle'))) || 
            ((groups[i].type == 'ship') && (visibility.includes('ship'))) || 
            ((groups[i].type == 'static') && (visibility.includes('static'))) 
        )
        {
            var icon = L.divIcon({
                html: html,
                iconSize: [100, 150],
                className: groups[i].type
            });

            groups[i].visible = true;

            /* Add the marker */
            marker = L.marker(groups[i].latlng, {icon: icon, group: groups[i]}).on('click', function(e) {markerClickGroup(e.sourceTarget.options.group)}).addTo(mymap);
            marker.bindTooltip(groups[i].name + " " + groups[i].unit);
            markers.push(marker);
        } else 
        {
            groups[i].visible = false;
        }
    }

    for (var i = 0; i < waypoints.length; i++)
    {  
        if (getGroupByName(waypoints[i].group).visible && getGroupByName(waypoints[i].group).enabled)
        {
            /* Draw the marker and add the selected/unselected icon */
            var html = iconhtml.replace('$waypoint-type$', truncateToLen(waypoints[i].group, 12));
            if (selectedWaypoint == waypoints[i])
            {
                html = html.replace('$icon$', iconSelectedHtmls[waypoints[i].type]);
            } 
            else 
            {
                html = html.replace('$icon$', iconHtmls[waypoints[i].type]);
            }
            var color = getGroupByName(waypoints[i].group).coalition;
            if (!getGroupByName(waypoints[i].group).client){
                if (color == "red") color = "#ba6c57";
                else color = "#576cba";
            }
            html = html.replaceAll('$color$', color);
            html = html.replace('$icon$', iconHtmls['route']);
            html = html.replace('$waypoint-name$', truncateToLen(waypoints[i].name, 12));
            
            var icon = L.divIcon({
                html: html,
                iconSize: [100, 80],
                className: waypoints[i].type
            });

            /* Add the marker */
            if (getGroupByName(waypoints[i].group).client == true)
                marker = L.marker(waypoints[i].latlng, {icon: icon, waypoint: waypoints[i]}).on('click', function(e) {markerClickWaypoint(e.sourceTarget.options.waypoint)}).addTo(mymap);
            else
                marker = L.marker(waypoints[i].latlng, {icon: icon}).addTo(mymap);
            markers.push(marker);
        }
    }

    /* Draw all the lines for "Everyone" */
    for (var i = 0; i < tempWaypoints.length; i++)
    {  
        for (var j = i + 1; j < tempWaypoints.length; j++)
        {  
            if (tempWaypoints[i].group == "Everyone" && tempWaypoints[j].group == "Everyone")
            {
                if (getGroupByName(tempWaypoints[i].group).visible && getGroupByName(tempWaypoints[i].group).enabled)
                {
                    polyline = L.polyline([tempWaypoints[i].latlng, tempWaypoints[j].latlng], {color: getLineColor(tempWaypoints[i].group)}).addTo(mymap);
                    lines.push(polyline);
                }
                break;
            }
        }    
    }

    /* Make a list of all the group which have a waypoint */
    var activeGroup = [];
    for (var i = 0; i < tempWaypoints.length; i++){
        if (activeGroup.indexOf(tempWaypoints[i].group) == -1) activeGroup.push(tempWaypoints[i].group)
    }

    /* Draw the group specific lines */
    for (k = 0; k < activeGroup.length; k++)
    {
        /* Cycle on each "start" point */
        for (var i = 0; i < tempWaypoints.length; i++)
        {  
            /* Search for an appropriate "end" point*/
            for (var j = i + 1; j < tempWaypoints.length; j++)
            {  
                /* If both the start and end points are for "Everyone", we can directly skip to the next start point */
                if (tempWaypoints[i].group == "Everyone" && tempWaypoints[j].group == "Everyone") 
                {
                    break;
                }

                /* Check if we should draw a group specifc line */
                var check1 = tempWaypoints[i].group == activeGroup[k] && tempWaypoints[j].group == activeGroup[k];
                var check2 = tempWaypoints[i].group == activeGroup[k] && tempWaypoints[j].group === "Everyone" && getGroupByName(activeGroup[k]).client;
                var check3 = tempWaypoints[i].group === "Everyone" && tempWaypoints[j].group == activeGroup[k] && getGroupByName(activeGroup[k]).client;
                /* Draw the line */
                if (check1 || check2 || check3)
                {
                    if (getGroupByName(tempWaypoints[i].group).visible && getGroupByName(tempWaypoints[i].group).enabled)
                    {
                        polyline = L.polyline([tempWaypoints[i].latlng, tempWaypoints[j].latlng], {color: getLineColor(activeGroup[k])}).addTo(mymap);
                        lines.push(polyline);
                    }
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
    selectedGroup = null;
    cleanMap();
    drawMap();
}

/* Marker click callback */
function markerClickWaypoint(waypoint)
{
    if (radios_tab_open)
    {
        selectedGroup = getGroupByName(waypoint.group)
        document.getElementById("radio-group").value = waypoint.group;
        document.getElementById("radio-group-div-selected").innerHTML = waypoint.group;
    }

    if (!waypoint_tab_open)
    {
        expandSection("waypoints-section");
    }
    if (waypoint_tab_open)
    {
        selectedWaypoint = waypoint;
        selectedGroup = getGroupByName(waypoint.group)
        document.getElementById("waypoint-name").value = selectedWaypoint.name;
        document.getElementById("waypoint-altitude").value = selectedWaypoint.altitude;
        document.getElementById("waypoint-type").value = selectedWaypoint.type;
        document.getElementById("waypoint-type-div-selected").innerHTML = selectedWaypoint.type;
        document.getElementById("waypoint-group").value = selectedWaypoint.group;
        document.getElementById("waypoint-group-div-selected").innerHTML = selectedWaypoint.group;
        document.getElementById("waypoint-baro-radio").checked = selectedWaypoint.baroRadio;
        toggleSwitchText('waypoint-baro-radio', 'AGL', 'ASL')

        cleanMap();
        drawMap();
    }
}

function markerClickGroup(group)
{
    if (selectedWaypoint !== null && selectedGroup !== null && selectedGroup.client == true && group.client == false)
    {
        var e = {latlng: group.latlng, originalEvent: {ctrlKey: false}};
        onMapClick(e);
    }

    if (group.client)
    {
        lastWaypoint = null;
        for (i = 0; i < waypoints.length; i++)
        {
            if (waypoints[i].group === group.name || waypoints[i].group == "Everyone")
            {
                lastWaypoint = waypoints[i]
            }
        }
        if (lastWaypoint != null)
        {
            markerClickWaypoint(lastWaypoint)
        }
    }
}

function mapUndo()
{
    if (activeWaypointHistory > 0)
    { 
        /* Unselect the selected waypoint */
        selectedWaypoint = null;
        selectedGroup = null;
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
        selectedGroup = null;
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
        obj = document.getElementById("waypoint-group");
        var waypoint_group =  obj.options[obj.selectedIndex].text;
        obj = document.getElementById("waypoint-baro-radio");
        var waypoint_baroRadio =  obj.checked;

        selectedWaypoint.type = waypoint_type;
        selectedWaypoint.group = waypoint_group;
        selectedWaypoint.name = waypoint_name;
        selectedWaypoint.altitude = waypoint_altitude;
        selectedWaypoint.baroRadio = waypoint_baroRadio;
    }

    applyMapChanges();
}

function applyMapChanges(setPosition = false)
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

    lat = 0
    lng = 0
    for (i = 0; i < waypoints.length; i++)
    {
        lat += waypoints[i].latlng.lat
        lng += waypoints[i].latlng.lng
    }

    /* Center the map on the average position */
    if (setPosition && waypoints.length > 0)
    {
        mymap.setView([lat / waypoints.length, lng / waypoints.length], 7);
    }
    
    /* Clean and redraw the map */
    cleanMap();
    drawMap();
}

function autoIncreaseWaypoint()
{
    var string = document.getElementById("waypoint-name").value;
    var num = string.match(/\d+/);
    document.getElementById("waypoint-name").value = string.replace(num, parseInt(num)+1);
}

function mapClear()
{
    waypoints = waypoints.filter(waypoint => !getGroupByName(waypoint.group).client)
    applyMapChanges();
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

function ConvertDDtoDMS(dd, pads)
{
    var deg = dd | 0; // truncate dd to get degrees
    var frac = Math.abs(dd - deg); // get fractional part
    var min = (frac * 60) | 0; // multiply fraction by 60 and truncate
    var sec = frac * 3600 - min * 60;
    sec = sec.toFixed(2);
    return zeroPad(deg, pads) + "\xB0" + zeroPad(min,2) + "'" + zeroPad(sec,5) + "\"";
}

function exportCSV()
{
    groupWaypoints = []
    let csvContent = "data:text/csv;charset=utf-8,"
    for (i = 0; i < groups.length; i++)
    {
        if(groups[i].client)
        {
            groupWaypoints.push(["\r\n"+groups[i].name])
            groupWaypoints.push(['Name', 'Notes', 'Alt.', 'Lat.', 'Long.'])
            for (j = 0; j < waypoints.length; j++)
            {
                if (waypoints[j].group === groups[i].name)
                {
                    if (!waypoints[j].baroRadio) baroRadio = 'ASL';
                    else baroRadio = 'AGL'
                    groupWaypoints.push([waypoints[j].name, '', waypoints[j].altitude + baroRadio, ConvertDDtoDMS(waypoints[j].latlng.lat, 2), ConvertDDtoDMS(waypoints[j].latlng.lng, 3)])
                }
            }
        }
    }
    groupWaypoints.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvContent.replace(/#/g, ''));
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "waypointsExport.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
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

document.onkeydown = function(event) {
    if(event.key == 'Delete'){
        deleteWaypoint();
    }
}