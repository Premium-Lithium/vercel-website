import argparse
import csv
import requests
from math_utils import Location, centroid
from enum import Enum
from supabase import create_client, Client
import datetime
from concurrent.futures import ThreadPoolExecutor
import json
import threading
import time

last_api_call_time = time.time()
lock = threading.Lock()
class SolarPanel:
    def __init__(self, lat, lon, area):
        self.lat = lat
        self.lon = lon
        self.area = area
        self.location: Location = Location(lat, lon)

    def __str__(self):
        return f'SolarArray(lat: {self.lat}, lon: {self.lon}, area: {self.area})'

class AutoAuditError(Enum):
    AREA_UNDER_6M2 = 4
    AREA_OVER_40M2 = 5

class Building:
    def __init__(self, address, formatted_addr = None, arrays: [SolarPanel] = None):
        self.address = address if formatted_addr else {"postcode": address}
        self.formatted_addr = formatted_addr if formatted_addr else address
        self.arrays: [SolarPanel] = arrays if arrays else []
        self.location: Location = centroid([array.location for array in self.arrays])

    def getArea(self) -> float:
        return sum([array.area for array in self.arrays])

def get_address_of(location: Location):
    global last_api_call_time

    with lock:
        elapsed = time.time() - last_api_call_time
        wait_time = max(0.02 - elapsed, 0)  # 0.02 seconds for 50 calls per second
        time.sleep(wait_time)

        last_api_call_time = time.time()

    response = requests.post('http://localhost:3000/solar-proposals/geocoding', json={
        "lat": location.latitude, "lon": location.longitude
    })
    response = response.json()
    if not response['results']:
        return None

    return response['results'][0]

def get_postcode_of(location: Location):
    response = requests.get(f'https://api.postcodes.io/postcodes?lon={location.longitude}&lat={location.latitude}')
    response = response.json()
    if response['result'] == None:
        return None
    return response['result'][0]['postcode']

def bulk_get_postcode_of(locations: [Location]):
    if len(locations) > 100:
        print("Please provide 1-100 locations")
        return None
    query = {"geolocations": [{"longitude": x.longitude, "latitude": x.latitude} for x in locations]}
    response = requests.post(f'https://api.postcodes.io/postcodes',json=query)
    response = response.json()
    if response['result'] == None:
        return None
    return [{'query': x['query'], 'postcode': x['result'][0]['postcode']} for x in response['result'] if x['result'] != None]

def parallel_get_postcode(panels):
    postcodes = bulk_get_postcode_of([panel.location for panel in panels])
    return list(zip(postcodes,panels))

def parallel_get_address(panel):
    address = get_address_of(panel.location)
    return (address,panel)

def main():
    if not args.filename.endswith('.csv'):
        print('TypeError: File must be a .csv')
        return
    if args.database:
        url: str = "http://localhost:54321"
        key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

        supabase: Client = create_client(url, key)
    campaign_id = args.filename.split('_')[0]
    solar_panels = []

    with open(args.filename, newline='') as f:
        reader = csv.reader(f, dialect="unix")
        print(f"Parsing {args.filename}")
        for row in reader:
            if row[0] == 'panel_lon_lat': continue
            latitude = float(row[0].split(', ')[1].rstrip(')'))
            longitude = float(row[0].split(', ')[0].lstrip('('))
            area = float(row[1])
            solar_panels.append(SolarPanel(latitude, longitude,area))

    buildings_dict = {}
    print("Getting postcodes/addresses...")

    chunk_size = 100
    solar_chunks = [solar_panels[i:i+chunk_size] for i in range(0,len(solar_panels), chunk_size)]
    with ThreadPoolExecutor() as executor:
        results = list(executor.map(parallel_get_postcode, solar_chunks))

    panel_postcode_pairs = [pair for sublist in results for pair in sublist]
    postcodes, panels = zip(*panel_postcode_pairs)
    print(f"Found {len(postcodes)} panels")
    postcodes = [p['postcode'] for p in postcodes]
    for panel,postcode in zip(panels,postcodes):
        if not postcode:
            continue
        if postcode not in buildings_dict:
            buildings_dict[postcode] = Building(postcode, [])
        buildings_dict[postcode].arrays.append(panel)
    duplicate_arrays = []
    items_to_remove = []
    for b in buildings_dict:
        if len(buildings_dict[b].arrays) > 1:
            duplicate_arrays.extend(buildings_dict[b].arrays)
            items_to_remove.append(b)

    for x in items_to_remove:
        buildings_dict.pop(x)
    print(f"Combining {len(items_to_remove)} duplicates...")
    i = 0

    with ThreadPoolExecutor() as executor:
        results = list(executor.map(parallel_get_address, duplicate_arrays))

    for (address,array) in results:
        if not address:
            continue
        formatted_addr = address["formatted_address"]

        if formatted_addr not in buildings_dict:
            buildings_dict[formatted_addr] = Building(address, formatted_addr)
        buildings_dict[formatted_addr].arrays.append(array)

    print(f"Created {len(buildings_dict)} buildings")
    if args.database:
        print("Uploading to database...")
        i=0
        entries = []
        for b in buildings_dict:
            print(f"{i} / {len(buildings_dict)}", end="\r")
            i+=1
            entries.append(create_new_database_record_for(buildings_dict[b],campaign_id))
        supabase.table('campaign_customers').insert(entries).execute()
    print("Completed!")

def catch_auto_audit_errors_on(building) -> AutoAuditError:
    errors = []
    if building.getArea() < 6:
        errors.append(AutoAuditError.AREA_UNDER_6M2.value)
    if building.getArea() > 40:
        errors.append(AutoAuditError.AREA_OVER_40M2.value)
    return errors

def create_new_database_record_for(building: Building, campaign_id):
    date = str(datetime.datetime.now()).split(' ')
    date = f'{date[0]}T{date[1]}Z'
    database_entry = {
        "campaign_id": campaign_id,
        "address_formatted": building.formatted_addr,
        "campaign_specific_data": {"solar_array_info": [ str(array) for array in building.arrays ]},
        "current_status": {"name": "AI-PRE-AUDIT", "description": "An AI model predicted this is a building with a solar array on.", "date_started": date},
        "audit_flags": catch_auto_audit_errors_on(building),
        "address": building.address
    }
    return database_entry

if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog="python parse_ai_predictions", description="Parses AI predictions of Solar Panels, and optionally adds them to a database.")
    parser.add_argument('filename', type=str, help="A file to parse")
    parser.add_argument('-db', '--database', action="store_true", default=False, help="Store the parsed predictions into a database. (default: False)")
    parser.add_argument('-v', '--verbose', action="store_true")
    args = parser.parse_args()
    main()