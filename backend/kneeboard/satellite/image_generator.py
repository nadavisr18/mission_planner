from backend.data_types import Unit

from typing import Tuple, List, Dict, Union
from copy import deepcopy
from PIL import Image
import numpy as np
import requests
import math
import yaml
import io


class ImageGenerator:
    def __init__(self):
        self.token = "pk.eyJ1IjoibmFkYXZmciIsImEiOiJja3ZtYXpzZDE1N3hmMnFvazZsbDk0OWh3In0.lMcppAAJbflwlwman-AQhg"
        self.url = "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.pngraw?access_token={key}"
        self.tile_size = 256
        self.zoom = 20

        with open("backend/kneeboard/scaling.yml") as file:
            self.config = yaml.load(file, Loader=yaml.FullLoader)

    def generate_image(self, units: List[Unit]) -> Image:
        lat, lon = self.get_avg_position(units)
        sat_image = self.composite_image(lat, lon)
        for unit in units:
            sat_image = self.add_unit(unit, sat_image)
        return sat_image

    def composite_image(self, lat: float, lon: float, rad: int = 1) -> Image:
        """
        generate a large image from tiles
        :param lat: latitude of center tile
        :param lon: longitude of center tile
        :param rad: radius of the image in tiles. rad=1 is a center tile and 1 tile to each side (9 in total)
        :return: image
        """
        x, y = self.get_tile_coords(lat, lon)
        big_img = None
        for i in range(-rad, rad + 1):
            axis_img = None
            for j in range(-rad, rad + 1):
                img = self.get_tile(x + j, y + i)
                if axis_img is None:
                    axis_img = img
                else:
                    axis_img = self.get_concat_h(axis_img, img)
            if big_img is None:
                big_img = axis_img
            else:
                big_img = self.get_concat_v(big_img, axis_img)
        return big_img

    def add_unit(self, unit: Unit, background: Image) -> Image:
        bg_copy = deepcopy(background)
        unit_image = Image.open(f"backend/kneeboard/satellite/images/{unit.category}.png")
        pixelated_img = self.pixelate(unit_image, unit)
        scaled_img = self.scale(pixelated_img, unit)
        angle = unit.angle * self.config[unit.category]['rot']
        rotated_img = scaled_img.rotate(angle, expand=True)
        bg_copy.paste(rotated_img, (1400, 400), rotated_img)
        return bg_copy

    def pixelate(self, img: Image, unit: Unit) -> Image:
        downsize = self.config[unit.category]['downsize']
        small_img = img.resize((downsize, downsize), resample=Image.BILINEAR)
        pixelated_img = small_img.resize(img.size, Image.NEAREST)
        return pixelated_img

    def scale(self, img: Image, unit) -> Image:
        scaling = self.config[unit.category]['scaling_20']
        scaled_image = img.resize((int(img.size[0] * scaling), int(img.size[1] * scaling)),
                                  resample=Image.BILINEAR)
        return scaled_image

    def get_tile(self, x_tile: int, y_tile: int) -> Image:
        r = requests.get(self.url.format(z=self.zoom, x=x_tile, y=y_tile, key=self.token))
        img = Image.open(io.BytesIO(r.content))
        return img

    def get_tile_coords(self, lat: float, lon: float, isint=True) -> Tuple[Union[int, float], Union[int, float]]:
        lat_rad = math.radians(lat)
        n = 2.0 ** self.zoom
        xtile = (lon + 180.0) / 360.0 * n
        ytile = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
        if isint:
            return int(xtile), int(ytile)
        else:
            return xtile, ytile

    def latlon2pixel(self, lat: float, lon: float, xtile: int, ytile: int):
        """
        returns the relative pixel of the object's lat/lon to the center pixel
        :param lat: latitude of object
        :param lon: longitude of object
        :param xtile: x of the center tile of the image
        :param ytile: y of the center tile of the image
        """
        x, y = self.get_tile_coords(lat, lon, isint=False)
        x_diff, y_diff = xtile - x, ytile - y
        return int(x_diff * self.tile_size), int(y_diff * self.tile_size)

    @staticmethod
    def get_concat_h(im1: Image, im2: Image):
        dst = Image.new('RGB', (im1.width + im2.width, im1.height))
        dst.paste(im1, (0, 0))
        dst.paste(im2, (im1.width, 0))
        return dst

    @staticmethod
    def get_concat_v(im1: Image, im2: Image):
        dst = Image.new('RGB', (im1.width, im1.height + im2.height))
        dst.paste(im1, (0, 0))
        dst.paste(im2, (0, im1.height))
        return dst

    @staticmethod
    def get_avg_position(units: List[Unit]) -> Tuple[float, float]:
        lats = [unit.lat for unit in units]
        lons = [unit.lon for unit in units]
        return np.average(lats), np.average(lons)
