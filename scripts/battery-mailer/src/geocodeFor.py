from supabase import create_client
from concurrent.futures import ThreadPoolExecutor
import json
from parse_ai_predictions import setup_threading, Building, parallel_get_address, create_new_database_record_for, SolarPanel

url = "http://localhost:54321"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

supabase = create_client(url,key)

entries = supabase.table('campaign_customers_postcode_only').select('*').execute()

entries = entries.data
print(entries[0])
buildings = []
for entry in entries:
    building = Building(entry['address_formatted'], None, [])
    array_info = json.loads(entry['campaign_specific_data'])['solar_array_info'][0]
    lat = array_info.split('lat: ')[1].split(',')[0]
    lon = array_info.split('lon: ')[1].split(',')[0]
    area = array_info.split('area: ')[1].split(')')[0]
    building.arrays.append(SolarPanel(lat,lon,area))
    buildings.append(building)
print(buildings[0].arrays)

setup_threading()

def main():

    with ThreadPoolExecutor() as executor:
        results = list(executor.map(parallel_get_address, buildings))

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
    return

if __name__ == '__main__':
	main()