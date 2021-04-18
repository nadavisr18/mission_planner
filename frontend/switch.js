function toggleSwitchText(objectId, checkedText, uncheckedText)
{
    if (document.getElementById(objectId).checked)
    {
        document.getElementById(objectId+"-label").innerHTML = checkedText;
    } else 
    {
        document.getElementById(objectId+"-label").innerHTML = uncheckedText;
    }
}
