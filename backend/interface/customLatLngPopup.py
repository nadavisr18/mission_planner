from folium import MacroElement
from jinja2 import Template
import folium


# Custom LatLngPopup with copy to clipboard button
class CustomLatLngPopup(MacroElement):
    """
    When one clicks on a Map that contains a LatLngPopup,
    a popup is shown that displays the latitude and longitude of the pointer.

    """
    _template = Template(u"""
            {% macro script(this, kwargs) %}
                var {{this.get_name()}} = L.popup();
                function copyText(text){
                    var dummy = document.createElement("textarea");
                    document.body.appendChild(dummy);
                    dummy.value = text;
                    dummy.select();
                    document.execCommand("copy");
                    document.body.removeChild(dummy);
                }
                function latLngPop(e) {
                data = e.latlng.lat.toFixed(4) + "," + e.latlng.lng.toFixed(4);
                    {{this.get_name()}}
                        .setLatLng(e.latlng)
                        .setContent("Latitude: " + e.latlng.lat.toFixed(4) + 
                                    "<br>Longitude: " + e.latlng.lng.toFixed(4) + 
                                    "<br><br><button type='button' onclick=copyText(data)>Copy to clipboard</button>")
                        .openOn({{this._parent.get_name()}})
                    }
                {{this._parent.get_name()}}.on('click', latLngPop);

            {% endmacro %}
            """)  # noqa

    def __init__(self):
        super(CustomLatLngPopup, self).__init__()
        self._name = 'LatLngPopup'
