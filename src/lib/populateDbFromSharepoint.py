from office365.sharepoint.client_context import ClientContext, UserCredential
import os
import zipfile
import shutil
import xml.etree.ElementTree as ET
from fastkml import kml, styles
from pygeoif.geometry import Polygon
from supabase import create_client, Client
from getNumPropertiesInRegion import get_gdf_list, count_properties_in_region
import json

allocated = ['Sheffield-0-0.kml\n', 'Sheffield-0-10.kml\n', 'Sheffield-0-11.kml\n', 'Sheffield-0-13.kml\n', 'Sheffield-0-18.kml\n', 'Sheffield-0-19.kml\n', 'Sheffield-0-1.kml\n', 'Sheffield-0-22.kml\n', 'Sheffield-0-23.kml\n', 'Sheffield-0-24.kml\n', 'Sheffield-0-25.kml\n', 'Sheffield-0-2.kml\n', 'Sheffield-0-3.kml\n', 'Sheffield-0-4.kml\n', 'Sheffield-0-5.kml\n', 'Sheffield-0-6.kml\n', 'Sheffield-0-7.kml\n', 'Sheffield-0-8.kml\n', 'Sheffield-0-9.kml\n', 'Sheffield-10-0.kml\n', 'Sheffield-10-10.kml\n', 'Sheffield-10-11.kml\n', 'Sheffield-10-12.kml\n', 'Sheffield-10-13.kml\n', 'Sheffield-10-14.kml\n', 'Sheffield-10-15.kml\n', 'Sheffield-10-17.kml\n', 'Sheffield-10-18.kml\n', 'Sheffield-10-1.kml\n', 'Sheffield-10-21.kml\n', 'Sheffield-10-22.kml\n', 'Sheffield-10-23.kml\n', 'Sheffield-10-26.kml\n', 'Sheffield-10-2.kml\n', 'Sheffield-10-3.kml\n', 'Sheffield-10-9.kml\n', 'Sheffield-1-0.kml\n', 'Sheffield-11-0.kml\n', 'Sheffield-11-10.kml\n', 'Sheffield-11-11.kml\n', 'Sheffield-11-12.kml\n', 'Sheffield-11-13.kml\n', 'Sheffield-11-14.kml\n', 'Sheffield-11-15.kml\n', 'Sheffield-11-19.kml\n', 'Sheffield-11-1.kml\n', 'Sheffield-11-20.kml\n', 'Sheffield-11-21.kml\n', 'Sheffield-11-23.kml\n', 'Sheffield-11-25.kml\n', 'Sheffield-11-26.kml\n', 'Sheffield-1-12.kml\n', 'Sheffield-11-2.kml\n', 'Sheffield-1-13.kml\n', 'Sheffield-11-3.kml\n', 'Sheffield-1-19.kml\n', 'Sheffield-1-1.kml\n', 'Sheffield-12-0.kml\n', 'Sheffield-12-10.kml\n', 'Sheffield-12-11.kml\n', 'Sheffield-12-12.kml\n', 'Sheffield-12-13.kml\n', 'Sheffield-12-14.kml\n', 'Sheffield-12-17.kml\n', 'Sheffield-12-19.kml\n', 'Sheffield-12-1.kml\n', 'Sheffield-12-20.kml\n', 'Sheffield-12-21.kml\n', 'Sheffield-12-22.kml\n', 'Sheffield-12-23.kml\n', 'Sheffield-12-2.kml\n', 'Sheffield-12-3.kml\n', 'Sheffield-1-24.kml\n', 'Sheffield-12-4.kml\n', 'Sheffield-12-5.kml\n', 'Sheffield-12-6.kml\n', 'Sheffield-12-7.kml\n', 'Sheffield-12-8.kml\n', 'Sheffield-12-9.kml\n', 'Sheffield-13-0.kml\n', 'Sheffield-13-10.kml\n', 'Sheffield-13-11.kml\n', 'Sheffield-13-12.kml\n', 'Sheffield-13-13.kml\n', 'Sheffield-13-14.kml\n', 'Sheffield-13-16.kml\n', 'Sheffield-13-17.kml\n', 'Sheffield-13-19.kml\n', 'Sheffield-13-1.kml\n', 'Sheffield-13-20.kml\n', 'Sheffield-13-21.kml\n', 'Sheffield-13-22.kml\n', 'Sheffield-13-2.kml\n', 'Sheffield-13-3.kml\n', 'Sheffield-13-5.kml\n', 'Sheffield-13-6.kml\n', 'Sheffield-13-7.kml\n', 'Sheffield-13-8.kml\n', 'Sheffield-13-9.kml\n', 'Sheffield-14-0.kml\n', 'Sheffield-14-10.kml\n', 'Sheffield-14-11.kml\n', 'Sheffield-14-12.kml\n', 'Sheffield-14-13.kml\n', 'Sheffield-14-14.kml\n', 'Sheffield-14-15.kml\n', 'Sheffield-14-16.kml\n', 'Sheffield-14-17.kml\n', 'Sheffield-14-1.kml\n', 'Sheffield-14-21.kml\n', 'Sheffield-14-22.kml\n', 'Sheffield-14-23.kml\n', 'Sheffield-14-24.kml\n', 'Sheffield-14-25.kml\n', 'Sheffield-14-2.kml\n', 'Sheffield-14-3.kml\n', 'Sheffield-14-4.kml\n', 'Sheffield-14-5.kml\n', 'Sheffield-14-6.kml\n', 'Sheffield-14-7.kml\n', 'Sheffield-14-8.kml\n', 'Sheffield-14-9.kml\n', 'Sheffield-15-0.kml\n', 'Sheffield-15-10.kml\n', 'Sheffield-15-11.kml\n', 'Sheffield-15-12.kml\n', 'Sheffield-15-13.kml\n', 'Sheffield-15-14.kml\n', 'Sheffield-15-15.kml\n', 'Sheffield-15-16.kml\n', 'Sheffield-15-17.kml\n', 'Sheffield-15-18.kml\n', 'Sheffield-15-19.kml\n', 'Sheffield-15-1.kml\n', 'Sheffield-15-20.kml\n', 'Sheffield-15-21.kml\n', 'Sheffield-15-22.kml\n', 'Sheffield-15-23.kml\n', 'Sheffield-15-24.kml\n', 'Sheffield-15-25.kml\n', 'Sheffield-15-26.kml\n', 'Sheffield-15-2.kml\n', 'Sheffield-15-3.kml\n', 'Sheffield-15-4.kml\n', 'Sheffield-15-5.kml\n', 'Sheffield-15-6.kml\n', 'Sheffield-15-7.kml\n', 'Sheffield-15-8.kml\n', 'Sheffield-15-9.kml\n', 'Sheffield-16-0.kml\n', 'Sheffield-16-10.kml\n', 'Sheffield-16-11.kml\n', 'Sheffield-16-12.kml\n', 'Sheffield-16-13.kml\n', 'Sheffield-16-16.kml\n', 'Sheffield-16-17.kml\n', 'Sheffield-16-18.kml\n', 'Sheffield-16-19.kml\n', 'Sheffield-16-1.kml\n', 'Sheffield-16-20.kml\n', 'Sheffield-16-21.kml\n', 'Sheffield-16-22.kml\n', 'Sheffield-16-23.kml\n', 'Sheffield-16-24.kml\n', 'Sheffield-16-25.kml\n', 'Sheffield-16-26.kml\n', 'Sheffield-16-2.kml\n', 'Sheffield-16-3.kml\n', 'Sheffield-16-4.kml\n', 'Sheffield-16-5.kml\n', 'Sheffield-16-7.kml\n', 'Sheffield-16-8.kml\n', 'Sheffield-16-9.kml\n', 'Sheffield-17-0.kml\n', 'Sheffield-17-11.kml\n', 'Sheffield-17-12.kml\n', 'Sheffield-17-13.kml\n', 'Sheffield-17-16.kml\n', 'Sheffield-17-17.kml\n', 'Sheffield-17-18.kml\n', 'Sheffield-17-19.kml\n', 'Sheffield-17-1.kml\n', 'Sheffield-17-20.kml\n', 'Sheffield-17-23.kml\n', 'Sheffield-17-24.kml\n', 'Sheffield-17-25.kml\n', 'Sheffield-17-26.kml\n', 'Sheffield-17-2.kml\n', 'Sheffield-17-3.kml\n', 'Sheffield-17-4.kml\n', 'Sheffield-17-5.kml\n', 'Sheffield-17-6.kml\n', 'Sheffield-17-7.kml\n', 'Sheffield-17-8.kml\n', 'Sheffield-18-0.kml\n', 'Sheffield-18-11.kml\n', 'Sheffield-18-12.kml\n', 'Sheffield-18-13.kml\n', 'Sheffield-18-18.kml\n', 'Sheffield-18-20.kml\n', 'Sheffield-18-21.kml\n', 'Sheffield-18-22.kml\n', 'Sheffield-18-23.kml\n', 'Sheffield-18-24.kml\n', 'Sheffield-18-25.kml\n', 'Sheffield-18-26.kml\n', 'Sheffield-18-5.kml\n', 'Sheffield-18-6.kml\n', 'Sheffield-18-7.kml\n', 'Sheffield-18-8.kml\n', 'Sheffield-19-10.kml\n', 'Sheffield-19-11.kml\n', 'Sheffield-19-12.kml\n', 'Sheffield-19-13.kml\n', 'Sheffield-19-17.kml\n', 'Sheffield-19-18.kml\n', 'Sheffield-19-19.kml\n', 'Sheffield-19-1.kml\n', 'Sheffield-19-20.kml\n', 'Sheffield-19-21.kml\n', 'Sheffield-19-22.kml\n', 'Sheffield-19-26.kml\n', 'Sheffield-19-3.kml\n', 'Sheffield-19-4.kml\n', 'Sheffield-19-9.kml\n', 'Sheffield-20-10.kml\n', 'Sheffield-20-11.kml\n', 'Sheffield-20-12.kml\n', 'Sheffield-20-17.kml\n', 'Sheffield-20-18.kml\n', 'Sheffield-20-19.kml\n', 'Sheffield-20-1.kml\n', 'Sheffield-20-20.kml\n', 'Sheffield-20-21.kml\n', 'Sheffield-20-22.kml\n', 'Sheffield-20-25.kml\n', 'Sheffield-20-26.kml\n', 'Sheffield-20-2.kml\n', 'Sheffield-20-3.kml\n', 'Sheffield-20-4.kml\n', 'Sheffield-20-5.kml\n', 'Sheffield-20-7.kml\n', 'Sheffield-20-8.kml\n', 'Sheffield-20-9.kml\n', 'Sheffield-21-0.kml\n', 'Sheffield-21-10.kml\n', 'Sheffield-21-11.kml\n', 'Sheffield-21-12.kml\n', 'Sheffield-21-13.kml\n', 'Sheffield-21-14.kml\n', 'Sheffield-21-18.kml\n', 'Sheffield-21-19.kml\n', 'Sheffield-21-1.kml\n', 'Sheffield-21-24.kml\n', 'Sheffield-21-25.kml\n', 'Sheffield-21-26.kml\n', 'Sheffield-2-12.kml\n', 'Sheffield-21-2.kml\n', 'Sheffield-2-13.kml\n', 'Sheffield-21-3.kml\n', 'Sheffield-2-14.kml\n', 'Sheffield-2-15.kml\n', 'Sheffield-2-16.kml\n', 'Sheffield-21-6.kml\n', 'Sheffield-2-17.kml\n', 'Sheffield-21-7.kml\n', 'Sheffield-2-18.kml\n', 'Sheffield-21-8.kml\n', 'Sheffield-2-19.kml\n', 'Sheffield-21-9.kml\n', 'Sheffield-2-20.kml\n', 'Sheffield-2-21.kml\n', 'Sheffield-2-22.kml\n', 'Sheffield-2-23.kml\n', 'Sheffield-2-24.kml\n', 'Sheffield-2-6.kml\n', 'Sheffield-2-7.kml\n', 'Sheffield-2-8.kml\n', 'Sheffield-3-10.kml\n', 'Sheffield-3-11.kml\n', 'Sheffield-3-12.kml\n', 'Sheffield-3-13.kml\n', 'Sheffield-3-14.kml\n', 'Sheffield-3-15.kml\n', 'Sheffield-3-16.kml\n', 'Sheffield-3-17.kml\n', 'Sheffield-3-18.kml\n', 'Sheffield-3-19.kml\n', 'Sheffield-3-20.kml\n', 'Sheffield-3-3.kml\n', 'Sheffield-3-4.kml\n', 'Sheffield-3-5.kml\n', 'Sheffield-3-6.kml\n', 'Sheffield-3-7.kml\n', 'Sheffield-3-8.kml\n', 'Sheffield-3-9.kml\n', 'Sheffield-4-10.kml\n', 'Sheffield-4-11.kml\n', 'Sheffield-4-12.kml\n', 'Sheffield-4-13.kml\n', 'Sheffield-4-14.kml\n', 'Sheffield-4-15.kml\n', 'Sheffield-4-16.kml\n', 'Sheffield-4-17.kml\n', 'Sheffield-4-18.kml\n', 'Sheffield-4-26.kml\n', 'Sheffield-4-3.kml\n', 'Sheffield-4-4.kml\n', 'Sheffield-4-5.kml\n', 'Sheffield-4-6.kml\n', 'Sheffield-4-7.kml\n', 'Sheffield-4-8.kml\n', 'Sheffield-4-9.kml\n', 'Sheffield-5-0.kml\n', 'Sheffield-5-10.kml\n', 'Sheffield-5-11.kml\n', 'Sheffield-5-12.kml\n', 'Sheffield-5-13.kml\n', 'Sheffield-5-14.kml\n', 'Sheffield-5-15.kml\n', 'Sheffield-5-16.kml\n', 'Sheffield-5-17.kml\n', 'Sheffield-5-18.kml\n', 'Sheffield-5-19.kml\n', 'Sheffield-5-20.kml\n', 'Sheffield-5-22.kml\n', 'Sheffield-5-23.kml\n', 'Sheffield-5-24.kml\n', 'Sheffield-5-26.kml\n', 'Sheffield-5-2.kml\n', 'Sheffield-5-5.kml\n', 'Sheffield-5-6.kml\n', 'Sheffield-5-7.kml\n', 'Sheffield-5-8.kml\n', 'Sheffield-5-9.kml\n', 'Sheffield-6-0.kml\n', 'Sheffield-6-10.kml\n', 'Sheffield-6-11.kml\n', 'Sheffield-6-12.kml\n', 'Sheffield-6-13.kml\n', 'Sheffield-6-14.kml\n', 'Sheffield-6-15.kml\n', 'Sheffield-6-17.kml\n', 'Sheffield-6-18.kml\n', 'Sheffield-6-19.kml\n', 'Sheffield-6-20.kml\n', 'Sheffield-6-22.kml\n', 'Sheffield-6-23.kml\n', 'Sheffield-6-24.kml\n', 'Sheffield-6-26.kml\n', 'Sheffield-6-5.kml\n', 'Sheffield-6-6.kml\n', 'Sheffield-6-7.kml\n', 'Sheffield-6-8.kml\n', 'Sheffield-6-9.kml\n', 'Sheffield-7-0.kml\n', 'Sheffield-7-10.kml\n', 'Sheffield-7-11.kml\n', 'Sheffield-7-12.kml\n', 'Sheffield-7-13.kml\n', 'Sheffield-7-15.kml\n', 'Sheffield-7-16.kml\n', 'Sheffield-7-17.kml\n', 'Sheffield-7-18.kml\n', 'Sheffield-7-19.kml\n', 'Sheffield-7-1.kml\n', 'Sheffield-7-20.kml\n', 'Sheffield-7-21.kml\n', 'Sheffield-7-22.kml\n', 'Sheffield-7-23.kml\n', 'Sheffield-7-24.kml\n', 'Sheffield-7-25.kml\n', 'Sheffield-7-26.kml\n', 'Sheffield-7-4.kml\n', 'Sheffield-7-5.kml\n', 'Sheffield-7-6.kml\n', 'Sheffield-7-7.kml\n', 'Sheffield-7-8.kml\n', 'Sheffield-7-9.kml\n', 'Sheffield-8-0.kml\n', 'Sheffield-8-10.kml\n', 'Sheffield-8-11.kml\n', 'Sheffield-8-12.kml\n', 'Sheffield-8-13.kml\n', 'Sheffield-8-14.kml\n', 'Sheffield-8-17.kml\n', 'Sheffield-8-18.kml\n', 'Sheffield-8-19.kml\n', 'Sheffield-8-1.kml\n', 'Sheffield-8-20.kml\n', 'Sheffield-8-22.kml\n', 'Sheffield-8-26.kml\n', 'Sheffield-8-4.kml\n', 'Sheffield-8-5.kml\n', 'Sheffield-8-6.kml\n', 'Sheffield-8-7.kml\n', 'Sheffield-8-8.kml\n', 'Sheffield-8-9.kml\n', 'Sheffield-9-0.kml\n', 'Sheffield-9-10.kml\n', 'Sheffield-9-11.kml\n', 'Sheffield-9-12.kml\n', 'Sheffield-9-13.kml\n', 'Sheffield-9-14.kml\n', 'Sheffield-9-17.kml\n', 'Sheffield-9-18.kml\n', 'Sheffield-9-19.kml\n', 'Sheffield-9-1.kml\n', 'Sheffield-9-20.kml\n', 'Sheffield-9-21.kml\n', 'Sheffield-9-22.kml\n', 'Sheffield-9-26.kml\n', 'Sheffield-9-2.kml\n', 'Sheffield-9-9.kml\n']
allocated = [a.strip() for a in allocated]
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