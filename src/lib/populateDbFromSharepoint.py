from office365.sharepoint.client_context import ClientContext, UserCredential
import os
import zipfile
import shutil
import xml.etree.ElementTree as ET
from fastkml import kml, styles
from pygeoif.geometry import Polygon
from supabase import create_client, Client
from getNumPropertiesInRegion import get_gdf_list, count_properties_in_region

allocated = []

with open('allocated_regions.txt') as f:
    f = f.readlines()
    for line in f:
        allocated.append(line.strip())

print(allocated)
gdf_list = get_gdf_list()
if not gdf_list:
    exit()

EXTRACTION_ZONE = 'kmlFilesToProcess'
def loginToSharepoint():
    username = "joe.lonsdale@premiumlithium.com"
    password = "Voh59815"

    login = UserCredential(username, password)
    ctx = ClientContext('https://premiumlithium.sharepoint.com/sites/development/').with_credentials(login)
    ctx.web.get().execute_query()

    return ctx

def getFilesFromSharepoint(ctx):
    folders = (ctx.web.default_document_library().root_folder.get_folders(True).execute_query())
    for folder in folders:
        if '/solarProposalRegionKMLS/' in folder.serverRelativeUrl:
            folder.download_folder(folder).execute_query()
            with zipfile.ZipFile(folder.name, 'r') as zip_ref:
                zip_ref.extractall(EXTRACTION_ZONE)
            os.remove(folder.name)
            # folder.delete_object().execute_query()
            return folder.name

def get_bounding_box(kml_content):
    k = kml.KML()
    k.from_string(kml_content)

    for feature in k.features():
        for subfeature in feature.features():
            if isinstance(subfeature.geometry, Polygon):
                points = list(subfeature.geometry.exterior.coords)
                points = [[point[0],point[1]] for point in points]
                return points
    return None

def upload_bounding_box_to_supabase(client, bbox, numProps, campaign_id, allocated):
    print("\n\n")
    prev_area = client.table("campaign_master").select('area').eq('campaign_id', campaign_id).execute().data[0]['area']
    data = []
    if not prev_area:
        data = []
    else:
        data = prev_area
    i = 0
    # for p in prev_area:
    #     if p['estNumProperties'] == 0:
    #         print(i)
    #         i+=1
    #         numProps = count_properties_in_region(gdf_list, p['area'])
    #         p['estNumProperties'] = numProps
    #         print(numProps)
    status = 'unprocessed'
    if allocated: status = 'processed'
    if str(bbox) not in [str(d['area']) for d in data]:
        data.append({'area':bbox, 'status': status, 'estNumProperties': numProps})
    response = client.table("campaign_master").update({"area": data}).eq('campaign_id', campaign_id).execute()
    return response

def process_kml_files_and_upload(campaign_id):
    url: str = "http://localhost:54321"
    key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    supabase: Client = create_client(url, key)
    for root, dirs, files in os.walk(EXTRACTION_ZONE):
        for file in files:
            if file.endswith('.kml'):
                with open(os.path.join(root, file), 'rb') as f:
                    kml_content = f.read()
                    is_allocated = False
                    if file in allocated:
                        is_allocated = True
                    try:
                        bbox = get_bounding_box(kml_content)
                        numProps = count_properties_in_region(gdf_list, bbox)
                        if bbox:
                            response = upload_bounding_box_to_supabase(supabase, bbox, numProps, campaign_id, is_allocated)
                            print(f"Uploaded {file}: {response}")
                    except ValueError as e:
                        print(f"Error processing file {file}: {e}")

ctx = loginToSharepoint()
campaign_id = getFilesFromSharepoint(ctx)
process_kml_files_and_upload(campaign_id)
shutil.rmtree('kmlFilesToProcess')