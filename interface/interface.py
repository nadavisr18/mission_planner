from streamlit.delta_generator import DeltaGenerator as Column
from mission_editing.edit_mission import MissionEditor
from interface.waypoint import WayPoint
from typing import List, Tuple
from folium import Map

from streamlit_folium import folium_static
import streamlit as st
import folium
import base64
import yaml
import os
import re


class Interface:
    def __init__(self):
        st.set_page_config(page_title="Tony's balls", layout='wide', page_icon='icon.png')
        self.waypoints: List = []
        self.current_wp = 0
        self.start_location = [34.6513, 36.7822]
        self.start_zoom = 7
        self.selected_mission = ""
        self.map = self._get_map()
        self.config = self._get_config("interface/config.yml")

    def _get_map(self) -> Map:
        map_ = folium.Map(location=self.start_location, zoom_start=self.start_zoom, tiles="Stamen Terrain")
        map_.add_child(folium.LatLngPopup())
        return map_

    def _add_lines(self, waypoints: List[WayPoint]):
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
        c1, c2 = st.beta_columns(2)
        point = self._get_point(c1)
        mission = c2.file_uploader("Drop Mission Here", type=['miz'])
        if mission:
            self.selected_mission = mission.name
            with open("temp.miz", 'wb') as file:
                file.write(mission.read())
        wp_options = self.config['WayPointOptionToIcon']
        marker_colors = self.config['PlaneToColor']

        c1, c2, c3, c4 = self._get_columns()
        viz = c3.checkbox("Visual Only")
        agl = c4.checkbox("AGL")
        wp_name, wp_altitude, wp_type, aircraft_type = self._get_waypoint_data(c1, c2, wp_options, marker_colors)
        plane_name = self.config['DisplayToBackendName'][aircraft_type]
        if c3.button("Apply"):
            marker_icon = folium.Icon(color=marker_colors[aircraft_type], icon=wp_options[wp_type], prefix='fa')
            marker = folium.Marker(point, draggable=False, popup=wp_name, icon=marker_icon).add_to(self.map)
            new_point = WayPoint(marker, point[0], point[1], wp_altitude, plane_name,
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

    def _undo(self, c4: Column):
        if c4.button("Undo"):
            self.map = self._get_map()
            self.current_wp = max(self.current_wp - 1, 0)
            for wp in self.waypoints[:self.current_wp]:
                wp.marker.add_to(self.map)
            self._add_lines(self.waypoints[:self.current_wp])

    def _redo(self, c4: Column):
        if c4.button("Redo"):
            self.map = self._get_map()
            self.current_wp = min(self.current_wp + 1, len(self.waypoints))
            for wp in self.waypoints[:self.current_wp]:
                wp.marker.add_to(self.map)
            self._add_lines(self.waypoints[:self.current_wp])

    def render(self):
        self._add_point()
        folium_static(self.map, 1750, 500)
        if st.button("Apply Changes To The Mission!"):
            me = MissionEditor("temp.miz")
            me.edit_waypoints(self.waypoints)
            st.balloons()
            with open('temp.miz', 'rb') as file:
                href = self._get_binary_file_downloader_html('temp.miz', file_label=self.selected_mission)
                st.markdown(href, unsafe_allow_html=True)

    def _get_waypoint_data(self, c1: Column, c2: Column, wp_options: dict, marker_colors: dict) -> tuple:
        wp_name: str = c1.text_input(label="Waypoint Name", value=f"WP{self.current_wp + 1}")
        wp_altitude = float(c1.text_input(label='Waypoint Altitude (ft)', value="10000"))

        wp_type: str = c2.selectbox('Select Waypoint Type', list(wp_options.keys()))
        marker_color: str = c2.selectbox('Select Waypoint Aircraft', list(marker_colors.keys()))
        return wp_name, wp_altitude, wp_type, marker_color

    @staticmethod
    def _get_binary_file_downloader_html(file_path: str, file_label='File') -> str:
        with open(file_path, 'rb') as f:
            data = f.read()
        bin_str = base64.b64encode(data).decode()
        href = f'<a href="data:application/octet-stream;base64,{bin_str}" download="{file_label}">Download {file_label}</a>'
        return href

    @staticmethod
    def _get_columns() -> Tuple[Column, Column, Column, Column]:
        c1, c2, c3, c4 = st.beta_columns((3, 3, 2, 1))
        # Blank spaces to line up the columns in the UI
        c3.text('')
        c3.text('')
        c4.text('')
        c4.text('')
        return c1, c2, c3, c4

    @staticmethod
    def _get_point(c1: Column) -> List[float, float]:
        raw_point = c1.text_input(label='Point')
        point = [float(number) for number in re.findall(r'\d+\.\d+', raw_point)]
        return point

    @staticmethod
    def _get_config(config_path: str) -> dict:
        with open(config_path, 'r') as file:
            config = yaml.load(file, Loader=yaml.FullLoader)
        return config


m = Interface()


def get_interface():
    return m
