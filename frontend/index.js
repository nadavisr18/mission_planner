/* Read the configuration file and set the values of the dropdown selections */
function setupSelections(){
    var objs = document.getElementsByClassName("selection");
    for (i = 0; i < objs.length; i++)
    {
        var values = selections[objs[i].id];
        if (objs[i].id == "map-provider"){
            setupSelection(objs[i], values, false);
        } else {
            setupSelection(objs[i], values, true);
        }
    }
    styleSelections();  /* Set the style of our custom selections */
}

/* Read the configuration file and set the values of the dropdown selections */
function setupSelection(obj, values, dots){
    var c;
    if (dots == true)
    {
        c = document.createElement("option");
        c.text = "..."; /* The default value, to force the user to make sure he selected the right value */
        var length = obj.options.length;
        if (length > 0)
        {
            for (i = length-1; i >= 0; i--) {
                obj.options[i].remove();
            }
        }   
        obj.options.add(c, 0);
    }
    if (values){
        for (j = 0; j < values.length; j++)
        {
            c = document.createElement("option");
            c.text = values[j];
            obj.options.add(c, j+1);
        }
    }
}

/* Setup the page */
function setupPage(){
    /* Set the page of the main content height */
    document.getElementById("root-table").style.height = (window.innerHeight-20) + "px";

    /* Setup the leaflet map */
    setupLeafletMap();

    /* Setup the multiselection objects */
    setupSelections();

    /* Grey out all the the controls until a valid mission is uploaded */
    deactivateInputs('waypoint-input');
    deactivateInputs('kneeboard-input');

    /* Create and setup the radios */
    setupRadio(1);
    deactivateRadio(1);
    setupRadio(2);
    deactivateRadio(2);
}

/* Resize the table to vertically fill the page */
function resizePage(){
    /* Set the page of the main content height */
    document.getElementById("root-table").style.height = (window.innerHeight-20) + "px";
}

function activateInputs(inputClass){
    x = document.getElementsByClassName(inputClass);
    for (i = 0; i < x.length; i++)
    {
        x[i].classList.remove("greyed");
        x[i].disabled = false;
    }
}

function deactivateInputs(inputClass){
    x = document.getElementsByClassName(inputClass);
    for (i = 0; i < x.length; i++)
    {
        x[i].classList.add("greyed");
        x[i].disabled = true;
    }
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
    else if (id == "radio-aircraft-div"){
        obj = document.getElementById("radio-aircraft");
        var radio_aircraft = obj.options[obj.selectedIndex].text;
        deactivateRadio(1);
        if (radio_aircraft != "...") activateRadio(1);
        deactivateRadio(2);
        if (radio_aircraft != "...") activateRadio(2);
    }
    else if (id == "kneeboard-aircraft-div"){
        obj = document.getElementById("kneeboard-aircraft");
        var kneeboard_aircraft = obj.options[obj.selectedIndex].text;
        if (kneeboard_aircraft != "...") 
        {   
            activateInputs("kneeboard-input");
            hideKneeboardFiles();
            showKneeboardFiles();
        }
    }
    else if (id == "map-provider-div"){
        obj = document.getElementById("map-provider");
        var map_provider = obj.options[obj.selectedIndex].text;
        setMapProvider(map_provider);
    }
}

function resetError(el)
{
    el.classList.remove('error');
}

function flashError(el)
{
    el.classList.remove('error');
    el.classList.add('error');
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
}

function flashSuccess(el)
{
    el.classList.remove('success');
    el.classList.add('success');
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
}

function expandSection(section)
{
    var els = document.getElementsByClassName(section)
    for (i = 0; i < els.length; i++) 
    {
        els[i].style.display = 'table-cell';
    }

    var arrow = document.getElementById(section+"-arrow");
    arrow.classList.remove("fa-arrow-circle-down")
    arrow.classList.add("fa-arrow-circle-up") 
    arrow.setAttribute("onClick", "collapseSection('"+section+"')");
}

function collapseSection(section)
{
    var els = document.getElementsByClassName(section)
    for (i = 0; i < els.length; i++) 
    {
        els[i].style.display = 'none';
    }

    var arrow = document.getElementById(section+"-arrow");
    arrow.classList.remove("fa-arrow-circle-up")
    arrow.classList.add("fa-arrow-circle-down") 
    arrow.setAttribute("onClick", "expandSection('"+section+"')");
}


/* Main loop */
window.onload = setupPage;
window.onresize = resizePage;
