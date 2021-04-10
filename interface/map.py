from streamlit_folium import folium_static
from interface.waypoint import WayPoint
from mission_editing.edit_mission import MissionEditor
import streamlit as st
import folium
import re
st.set_page_config(page_title="Tony's balls", layout='wide', page_icon='icon.png')


class Map:
    def __init__(self):
        self.waypoints = []
        self.current_wp = 0
        self.start_location = [34.6513, 36.7822]
        self.start_zoom = 7
        self.map = self._get_map()

    def _get_map(self):
        map_ = folium.Map(location=self.start_location, zoom_start=self.start_zoom, tiles="Stamen Terrain")
        map_.add_child(folium.LatLngPopup())
        return map_

    def _add_lines(self, waypoints):
        last_everyone = WayPoint()
        open_edges = {}
        for wp in waypoints:
            if wp.aircraft in open_edges.keys():
                last_wp = open_edges[wp.aircraft]
                folium.PolyLine([(wp.lat, wp.lon), (last_wp.lat, last_wp.lon)], color=wp.color).add_to(self.map)
            elif last_everyone.aircraft:
                folium.PolyLine([(wp.lat, wp.lon), (last_everyone.lat, last_everyone.lon)], color=wp.color).add_to(
                    self.map)
            if wp.aircraft == "Everyone":
                last_everyone = wp
                for open_wp in open_edges.values():
                    folium.PolyLine([(wp.lat, wp.lon), (open_wp.lat, open_wp.lon)], color=open_wp.color).add_to(self.map)
                open_edges.clear()
            else:
                open_edges.update({wp.aircraft: wp})

    def _add_point(self):
        point = self._get_point()
        wp_options = self._get_wp_options()
        marker_colors = self._get_marker_colors()

        c1, c2, c3, c4 = self._get_columns()
        viz = c3.checkbox("Visual Only")
        agl = c4.checkbox("AGL")
        wp_name, wp_altitude, wp_type, aircraft_type = self._get_waypoint_data(c1, c2, wp_options, marker_colors)
        if c3.button("Apply"):
            marker = folium.Marker(point, draggable=False, popup=wp_name,
                                   icon=folium.Icon(color=marker_colors[aircraft_type],
                                                    icon=wp_options[wp_type], prefix='fa')).add_to(self.map)
            new_point = WayPoint(marker, point[0], point[1], wp_altitude, self._get_dcs_aircraft_name(aircraft_type),
                                 marker_colors[aircraft_type], wp_name, viz, "RADIO" if agl else "BARO")

            self.waypoints = self.waypoints[:self.current_wp]
            self.waypoints.append(new_point)
            self._add_lines(self.waypoints)
            self.current_wp += 1
        if c3.button("Clear Map"):
            self.map = self._get_map()
            self.current_wp = -1

        self._undo(c4)
        self._redo(c4)

    def _undo(self, c4):
        if c4.button("Undo"):
            self.map = self._get_map()
            self.current_wp = max(self.current_wp - 1, 0)
            for wp in self.waypoints[:self.current_wp]:
                wp.marker.add_to(self.map)
            self._add_lines(self.waypoints[:self.current_wp])

    def _redo(self, c4):
        if c4.button("Redo"):
            self.map = self._get_map()
            self.current_wp = min(self.current_wp + 1, len(self.waypoints))
            for wp in self.waypoints[:self.current_wp]:
                wp.marker.add_to(self.map)
            self._add_lines(self.waypoints[:self.current_wp])

    def render(self):
        self._add_point()
        folium_static(self.map, 1750, 500)
        password = st.text_input(label="Enter Password", type='password')
        if st.button("Apply Changes To The Mission!"):
            if password == "plebs":
                me = MissionEditor()
                me.edit_waypoints(self.waypoints)
                st.balloons()
            else:
                st.error("Wrong Password You Salad!")

    def _get_waypoint_data(self, c1, c2, wp_options, marker_colors):
        wp_name = c1.text_input(label="Waypoint Name", value=f"WP{self.current_wp + 1}")
        wp_altitude = float(c1.text_input(label='Waypoint Altitude (ft)', value="10000"))

        wp_type = c2.selectbox('Select Waypoint Type', list(wp_options.keys()))
        marker_color = c2.selectbox('Select Waypoint Aircraft', list(marker_colors.keys()))
        return wp_name, wp_altitude, wp_type, marker_color

    @staticmethod
    def _get_columns():
        c1, c2, c3, c4 = st.beta_columns((3, 3, 2, 1))
        c3.text('')
        c3.text('')
        c4.text('')
        c4.text('')
        return c1, c2, c3, c4

    @staticmethod
    def _get_point():
        raw_point = st.text_input(label='Point')
        point = [float(number) for number in re.findall(r'\d+\.\d+', raw_point)]
        return point

    @staticmethod
    def _get_wp_options():
        # https://getbootstrap.com/docs/3.3/components/
        options = {'Anchor': 'anchor', 'Route': 'play', 'IP': 'sign-in', 'Target': 'crosshairs', 'FAC': 'eye',
                   'SAM': 'exclamation-circle', 'Home Base': 'home', 'Tanker': 'battery-quarter',
                   'Contested Area': 'fort-awesome', "Bullseye": "bullseye", 'Airport': "fighter-jet"}
        return options

    @staticmethod
    def _get_marker_colors():
        # https://getbootstrap.com/docs/3.3/components/
        options = {'Everyone': 'black', 'Hornet': 'blue', 'Viper': 'green', 'Tomcat': 'red', 'Harrier': 'orange',
                   'Mirage': 'purple'}
        return options

    @staticmethod
    def _get_dcs_aircraft_name(name):
        names = {"Hornet": "FA-18C_hornet", "Mirage": "M-2000C", "Viper": "F-16C_50", "Tomcat": "F-14",
                 "Harrier": "AV8BNA", "Everyone": "Everyone"}
        return names[name]


m = Map()


def get_map():
    return m
