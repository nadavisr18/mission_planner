import cv2 as cv
import json
import math
from scipy.optimize import minimize
import numpy as np
from pathlib import Path
import argparse
import os
import sys

R = 6371000

def showImage(img, width = 800, height = 800, title = "image"):
    scale_width = 800 / width
    scale_height = 800 / height
    scale = min(scale_width, scale_height)
    window_width = int(width * scale)
    window_height = int(height * scale)
    cv.namedWindow(title, cv.WINDOW_NORMAL)
    cv.resizeWindow(title, window_width, window_height)
    cv.imshow(title, img)
    cv.waitKey(0)
    cv.destroyAllWindows()

def WGS84ToMercator(coord, zoom):
    lat_deg = coord[0] 
    lon_deg = coord[1] 
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = (lon_deg + 180.0) / 360.0 * n
    ytile = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return (xtile, ytile)

def mercatorToWGS84(merc, zoom):
    xtile = merc[0]
    ytile = merc[1]
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return (lat_deg, lon_deg)

def errorFun(coord, lamb):
    lat = coord[0]
    lng = coord[1]
    x = lamb[0]
    y = lamb[1]
    xp, yp = WGS84ToLambert((lat, lng))
    err = np.linalg.norm([x-xp, y-yp])
    print(f"{lat}, \t{lng}, \t {x}, \t{xp}, \t{y}, \t{yp}, \t{err}")
    return err

def WGS84ToLambert(coord):
    lat = coord[0]
    lng = coord[1]
    lat = math.radians(lat)
    lng = math.radians(lng)
    lat0 = math.radians(MapPoint.lat0)
    lat1 = math.radians(MapPoint.lat1)
    lat2 = math.radians(MapPoint.lat2)
    lng0 = math.radians(MapPoint.lng0)
    
    n = math.log(math.cos(lat1)/math.cos(lat2)) / math.log(math.tan(1/4*math.pi+1/2*lat2)/math.tan(1/4*math.pi+1/2*lat1))
    F = math.cos(lat1)*pow(math.tan(1/4*math.pi+1/2*lat1), n)/n
    rho = R*F*1/pow(math.tan(1/4*math.pi+1/2*lat), n)
    rho0 = R*F*1/pow(math.tan(1/4*math.pi+1/2*lat0), n)
    x = rho * math.sin(n*(lng-lng0))
    y = rho0 - rho * math.cos(n*(lng-lng0))
    return (x, y)

def lambertToWGS84(lamb):
    x = lamb[0]
    y = lamb[1]
    fun = lambda coord, x=x, y=y: errorFun(coord, (x, y))
    centerLat = MapPoint.bottomLeft.WGS84[0] + (MapPoint.topLeft.WGS84[0] - MapPoint.bottomLeft.WGS84[0]) / 2
    centerLng = MapPoint.bottomLeft.WGS84[1] + (MapPoint.bottomRight.WGS84[1] - MapPoint.bottomLeft.WGS84[1]) / 2
    res = minimize(fun, [centerLat, centerLng], bounds=[(MapPoint.bottomLeft.WGS84[0], MapPoint.topLeft.WGS84[0]), (MapPoint.bottomLeft.WGS84[1], MapPoint.bottomRight.WGS84[1])])
    lat = res.x[0]
    lng = res.x[1]
    return (lat, lng)

def lambertToPixel(lamb):
    x = lamb[0]
    y = lamb[1]

    pts1 = np.float32([MapPoint.topLeft.lambert, MapPoint.topRight.lambert, MapPoint.bottomRight.lambert, MapPoint.bottomLeft.lambert])
    pts2 = np.float32([MapPoint.topLeft.pixel, MapPoint.topRight.pixel, MapPoint.bottomRight.pixel, MapPoint.bottomLeft.pixel])
    
    M = cv.getPerspectiveTransform(pts1, pts2)
    res = np.matmul(M, np.asarray([x, y, 1]).reshape((3,1)))
    return (int(res[0]), int(res[1]))

class MapPoint():
    lat0 = 0
    lat1 = 0
    lat2 = 0
    lng0 = 0
    topLeft = None
    topRight = None
    bottomLeft = None
    bottomRight = None

    def __init__(self, a, b = None, px = None, py = None):
        if b is None:
            lat = a[0]
            lng = a[1]
        else:
            lat = a
            lng = b
        self.WGS84 = (lat, lng)
        self.lambert = WGS84ToLambert(self.WGS84)
                
        if px is not None and py is not None:
            self.pixel = (px, py)
        elif self.topLeft is not None and self.topRight is not None and self.bottomRight is not None and self.bottomLeft is not None:
            self.pixel = lambertToPixel(self.lambert)
        else:
            raise ValueError("px and py can be left unset only if map corners have already be assigned")

    def mercator(self, zoom):
        return WGS84ToMercator(self.WGS84, zoom)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate mercator slippy map tiles from Lambert conformal conical projection maps.')
    parser.add_argument('-m', '--map', type=str, help='Map name (Syria, Nevada, Caucasus, Channel, Marianas, Persian Gulf, Normandy)', default="Syria")
    args = parser.parse_args()
    files = os.listdir(f"{sys.path[0]}\\{args.map}")
    for file in files:
        if "json" in file:
            json_path = f"{sys.path[0]}\\{args.map}\\{file}"
            idx = json_path.rfind(".json")
            img_path = json_path[:idx]

            print(f"Processing {file}...")

            with open(json_path) as json_file:
                data = json.load(json_file)

            MapPoint.lat0 = data["reference_latitude"]
            MapPoint.lng0 = data["reference_longitude"]
            MapPoint.lat1 = data["standard_parallel_1"]
            MapPoint.lat2 = data["standard_parallel_2"]
            
            MapPoint.topLeft = MapPoint(*data['top_left'])
            MapPoint.topRight = MapPoint(*data['top_right'])
            MapPoint.bottomRight = MapPoint(*data['bottom_right'])
            MapPoint.bottomLeft = MapPoint(*data['bottom_left'])
            
            img = cv.imread(img_path)
            height, width = img.shape[:2]
            mask = np.zeros((height,width, 3), np.uint8)

            step = 0.1
            lat = MapPoint.bottomLeft.WGS84[0]
            while lat < MapPoint.topLeft.WGS84[0]:
                lng = MapPoint.bottomLeft.WGS84[1]
                while lng < MapPoint.bottomRight.WGS84[1]:
                    corners = [MapPoint(lat + step, lng), MapPoint(lat + step, lng + step), MapPoint(lat, lng + step), MapPoint(lat, lng)]
                    pts = np.array([corner.pixel for corner in corners], np.int32)
                    pts = pts.reshape((-1,1,2))
                    mask = cv.fillPoly(mask, pts = [pts], color = (255, 255, 255))
                    lng += step
                lat += step
            img = cv.bitwise_and(img, mask)
               
            for zoom in range(6, 12):
                mx = math.floor(MapPoint.topLeft.mercator(zoom)[0])
                while mx < MapPoint.bottomRight.mercator(zoom)[0]:
                    Path(f"{sys.path[0]}\\{zoom}\\{mx}").mkdir(parents=True, exist_ok=True)
                    pts2 = None
                    minx = None
                    maxx = None
                    my = math.floor(MapPoint.topLeft.mercator(zoom)[1])
                    while my < MapPoint.bottomRight.mercator(zoom)[1]:
                        corners = [MapPoint(mercatorToWGS84((mx, my), zoom)), MapPoint(mercatorToWGS84((mx+1, my), zoom)), MapPoint(mercatorToWGS84((mx+1, my+1), zoom)), MapPoint(mercatorToWGS84((mx, my+1), zoom))]
                        xs = [corner.pixel[0] for corner in corners]
                        ys = [corner.pixel[1] for corner in corners]
                        pts1 = np.float32([corner.pixel for corner in corners])

                        pts2 = np.float32([[0, 0], [256, 0], [256, 256], [0, 256]])

                        M = cv.getPerspectiveTransform(pts1, pts2)
                        s = (256, 256)
                        sub = cv.warpPerspective(img, M, s, flags=cv.INTER_LINEAR)

                        try:
                            existing = cv.imread(f"{sys.path[0]}\\{zoom}\\{mx}\\{my}.png")
                            sub = cv.bitwise_or(existing, sub)
                        except:
                            pass
                        cv.imwrite(f"{sys.path[0]}\\{zoom}\\{mx}\\{my}.png", sub)
                        my += 1
                    mx += 1