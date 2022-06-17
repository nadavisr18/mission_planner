/* Toggles the text inside a switch */
function toggleSwitchText(objectId, checkedText, uncheckedText)
{
    console.log(objectId)
    if (document.getElementById(objectId).checked)
    {
        document.getElementById(objectId+"-label").innerHTML = checkedText;
    } else 
    {
        document.getElementById(objectId+"-label").innerHTML = uncheckedText;
    }
}
