from pipedrive.client import Client
from office365.sharepoint.client_context import ClientContext, UserCredential
from openpyxl import Workbook
import os

PIPEDRIVE_API_TOKEN = "f3bf98ccd22e57bbc7f2693e52e32faf89b91e44"
LOST_LEAD_FILTER_ID = "377"
REPORTING_FILTER_ID = "277"
LEAD_SOURCE_KEY = "9c6c616447ee45293d20ebb0db2d2f3f979bb86f"

TESTING = True

# Lead Source, EVChargerType, EPSSwitch, PaymentType, DealType, SinglePhaseOrThreePhase, NewBatteryModel
dealFieldsDict = {12654: {}, 12631: {}, 12575: {}, 12681: {}, 12698: {}, 12712: {}, 12650: {}}

pd = Client(domain="https://premiumlithium.pipedrive.com/")
pd.set_api_token(PIPEDRIVE_API_TOKEN)

# Gets deals by filter Lost Deals by Lead Source LOOK INTO PAGINATION https://github.com/GearPlug/pipedrive-python/blob/master/pipedrive/deals.py
def getFilteredDeals(FILTERID):
    print("Getting Deals")
    moreDealsToCome = True
    start = 0
    dealData = []
    stages = {}
    pipelines = {}
    while moreDealsToCome:
        response = pd.deals.get_all_deals_with_filter(
            FILTERID, params={"start": start}
        )
        for obj in response['related_objects']['stage']:
            try:
                stages[str(obj)] = response['related_objects']['stage'][obj]
            except:
                pass # Not important if it broke - it means there wasn't anything useful in it
        for obj in response['related_objects']['pipeline']:
            try:
                pipelines[str(obj)] = response['related_objects']['pipeline'][obj]
            except:
                pass # Not important if it broke - it means there wasn't anything useful in it
        for deal in response["data"]:
            dealData.append(deal)
        if response["additional_data"]["pagination"]["more_items_in_collection"]:
            start = response["additional_data"]["pagination"]["next_start"]
        else:
            moreDealsToCome = False
    return dealData, stages, pipelines


def createLostLeadsSpreadSheet(deals, stages, pipelines):
    print("Creating Lost Lead Spreadsheet")
    wb = Workbook()
    ws = wb.active
    ws.append(
        [
            "Title",
            "Value",
            "Organization",
            "Contact person",
            "Expected close date",
            "Next activity date",
            "Owner",
            "Lead Source",
            "Lost reason",
            "Lost time",
            "Status",
            "Deal created",
            "Pipeline"
            "Quote Issued",
            "Won Time",
            "Sales Contact",
            "Stage"
        ]
    )
    for deal in deals:
        row = []
        row.append(deal["title"])
        row.append(deal["value"])
        if deal["org_id"] == None:
            row.append('')
        else:
            row.append(deal["org_id"]["name"])
        row.append(deal["person_id"]["name"])
        row.append(deal["expected_close_date"])
        row.append(deal["next_activity_date"])
        row.append(deal["user_id"]["name"])
        row.append(dealFieldsDict[12654][(deal[LEAD_SOURCE_KEY])])
        row.append(deal["lost_reason"])
        row.append(deal["lost_time"])
        row.append(deal["status"])  # enum
        row.append(deal["add_time"])
        # pipeline
        row.append(pipelines[str(deal['pipeline_id'])]['name'])
        row.append(deal['won_time'])
        if deal['da0db4682fb1eeb8aa85e1419d50dd5766fc6d2b'] != None:
            row.append(deal['da0db4682fb1eeb8aa85e1419d50dd5766fc6d2b']['name'])
        else:
            row.append('')
        row.append(stages[str(deal['stage_id'])]['name'])
        ws.append(row)
    wb.save("LostLeadsBySource.xlsx")
    return "LostLeadsBySource.xlsx"


def createReportingSpreadSheet(deals, stages, pipelines):
    print("Creating Reporting Spreadsheet")
    wb = Workbook()
    ws = wb.active
    ws.append(
        [
            "Title",
            "Status",
            "Value",
            "Won Time",
            "Sales contact",
            "Installation Date",
            "Battery Model",
            "Number of Panels",
            "Battery size (kWh)",
            "Quote Issued",
            "EV Charger Type",
            "EPS Switch",
            "Lead Source",
            "Payment Type",
            "Deal Created",
            "Contact Person",
            "Stage",
            "Deal Type",
            "Single Phase or Three Phase",
            "Site Survey Date",
            "Inverter Size (kW)"
        ]
    )
    for deal in deals:
        row = []
        row.append(deal["title"])
        row.append(deal["status"])
        row.append(deal['value'])
        row.append(deal['won_time'])
        try:
            row.append(deal['da0db4682fb1eeb8aa85e1419d50dd5766fc6d2b']['name'])
        except:
            row.append('')
        row.append(deal['e448eb2611c9c8a6aeca674511aa64c0a4d06520'])
        row.append(dealFieldsDict[12650][deal['05e84b1dee500f1541defcfbcccc87cab1f2dc0d']])
        row.append(deal['255ed939a712945ddb3ffc7db54bdcd152132e1d'])
        row.append(deal['567489c8ee63a1e43f24caedcbd9ce1398c63317'])
        row.append(deal['81fcad47a18a049303b461e360c0ec2d6c9fa68e'])
        row.append(dealFieldsDict[12631][deal['645f9a8b6d8376f2f8cfd6519a6f72229f9ea761']])
        row.append(dealFieldsDict[12575][deal['42dc4717c0f0523d6fad9881d07be252906a6c1d']])
        row.append(dealFieldsDict[12654][(deal[LEAD_SOURCE_KEY])])
        row.append(dealFieldsDict[12681][deal['8b2cdc8efef23bb571c9ee3d720b0113c1fd9d55']])
        row.append(deal['add_time'])
        row.append(deal['person_id']['name'])
        row.append(stages[str(deal['stage_id'])]['name'])
        row.append(dealFieldsDict[12698][deal['89249d62cbbfd657d1696b426836e9ae92cd6474']])
        row.append(dealFieldsDict[12712][deal['e82e044a6f7231a43d3f570785b2fc033823df65']])
        row.append(deal['e32b261b04609d33ecbc6282fba121c6284f9d53'])
        row.append(deal['c71b79129a01daee3ed338e43f4b99b2356e4a13'])
        ws.append(row)
    wb.save("Reporting.xlsx")
    return "Reporting.xlsx"



def uploadToSharepoint(pathToFile):
    print("Uploading to Sharepoint")
    username = "peter.gillingham@premiumlithium.com"
    password = "5Qy4Wp$83F^Y"

    login = UserCredential(username, password)
    ctx = ClientContext(
        "https://premiumlithium.sharepoint.com/"
    ).with_credentials(login)
    ctx.web.get().execute_query()

    folders = (
        ctx.web.default_document_library().root_folder.get_folders(True).execute_query()
    )
    for folder in folders:
        if "PipeDrive Exports" in folder.name:
            with open(pathToFile, "rb") as f:
                folder.files.upload(f).execute_query()

def createPipedriveDictionaries():
    dealFields = pd.deals.get_deal_fields()['data']
    for field in dealFields:
        if field['id'] in dealFieldsDict:
            id = field['id']
            for opt in field['options']:
                dealFieldsDict[id].update({str(opt['id']): opt['label']})
            dealFieldsDict[id].update({None: None})
    
def main():
    createPipedriveDictionaries()
    if TESTING:
        deals, stages, pipelines = getFilteredDeals(LOST_LEAD_FILTER_ID)
        pathToFile = createLostLeadsSpreadSheet(deals, stages, pipelines)
        deals, stages, pipelines = getFilteredDeals(REPORTING_FILTER_ID)
        pathToFile = createReportingSpreadSheet(deals, stages, pipelines)
    else:
        deals, stages, pipelines = getFilteredDeals(LOST_LEAD_FILTER_ID)
        pathToFile = createLostLeadsSpreadSheet(deals, stages, pipelines)
        uploadToSharepoint(pathToFile)
        os.remove(pathToFile)
        deals, stages, pipelines = getFilteredDeals(REPORTING_FILTER_ID)
        pathToFile = createReportingSpreadSheet(deals, stages, pipelines)
        uploadToSharepoint(pathToFile)
        os.remove(pathToFile)

main()
