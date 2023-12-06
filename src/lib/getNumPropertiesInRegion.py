import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, Polygon
file_path = 'osopenuprn_202310.csv'
gdf_total = []

def count_points_within_radius(gdf, lat, lon, radius_in_miles):
    radius_in_degrees = radius_in_miles / 69
    point = Point(lon, lat)
    buffer = point.buffer(radius_in_degrees)

    points_within_buffer = gdf[gdf.within(buffer)]

    return len(points_within_buffer)

# props = {"SN7 7YQ": [51.656129674259866, -1.5754000692283365],
# "TR16 5NR": [50.23724638361607, -5.197154106884273],
# "NG12 5HB": [52.87903218915024, -1.0845728019807974],
# "LA3 3EB": [54.01429206749631, -2.862367947710301],
# "NG16 2GE": [53.007442832328586, -1.284280341674037],
# "NR25 6EG": [52.90779765615002, 1.0992864245119653],
# "SA62 5AA": [51.90830564504241, -5.072383507527523],
# "ME14 2TQ": [51.28566798541035, 0.5334412519206945]}

# for postcode, (latitude,longitude) in props.items():
#     print(f"{postcode}:")
#     for radius in [1,3,5]:
#         # latitude = 52.24794740090099
#         # longitude = 0.07882204782708145
#         radius_in_miles = radius
#         total_count = 0
#         for gdf in gdf_total:
#             count = count_points_within_radius(gdf, latitude, longitude, radius_in_miles)
#             total_count += count
#         print(f"Total number of points within {radius_in_miles} miles: {total_count}")
#     print("\n=============================\n")


def count_properties_in_region(gdf_list, region_coords):
    region_polygon = Polygon(region_coords)
    total_count = 0

    for gdf in gdf_list:
        properties_within_region = gdf[gdf.geometry.within(region_polygon)]
        total_count += len(properties_within_region)

    return total_count

def get_gdf_list():
    gdf_total = []
    try:
        df = pd.read_csv(file_path)
        df = df.drop(columns=['UPRN','X_COORDINATE', 'Y_COORDINATE'])
        print(df.head)
        print(f"{df.shape[0]} rows loaded")
        chunk_size = 100000

        for chunk in pd.read_csv(file_path, chunksize=chunk_size):
            gdf_chunk = gpd.GeoDataFrame(chunk, geometry=gpd.points_from_xy(chunk.LONGITUDE, chunk.LATITUDE))
            gdf_chunk.set_crs(epsg=4326, inplace=True)
            gdf_total.append(gdf_chunk)

    except Exception as e:
        print("Error loading file:", e)
    return gdf_total
