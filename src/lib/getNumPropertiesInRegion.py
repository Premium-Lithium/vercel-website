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

def count_properties_in_radius(radius, lat, lon):
    radius_in_miles = radius
    total_count = 0
    for gdf in gdf_total:
        count = count_points_within_radius(gdf, lat, lon, radius_in_miles)
        total_count += count
    return total_count

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
