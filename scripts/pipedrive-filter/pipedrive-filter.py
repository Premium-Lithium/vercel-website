from pipedrive.client import Client
from datetime import datetime
from office365.sharepoint.client_context import ClientContext, UserCredential
from openpyxl import Workbook

PIPEDRIVE_API_TOKEN = "f3bf98ccd22e57bbc7f2693e52e32faf89b91e44"
LOST_LEAD_FILTER_ID = "377"
REPORTING_FILTER_ID = "277"
LOST_LEAD_NAME = "LostLeadsBySource"
REPORTING_NAME = "Reporting"
LEAD_SOURCE_KEY = "9c6c616447ee45293d20ebb0db2d2f3f979bb86f"

leadSourceDict = {
    "968": "Battery Competition",
    "969": "Battery Finder",
    "971": "Consultation Booking",
    "970": "Chatbot",
    "966": "Contact Us Webform",
    "909": "Customer Referral",
    "991": "DDS",
    "972": "Email",
    "1007": "Energiser - Callback",
    "1016": "Energiser - Consultation",
    "1055": "Energiser - Survey",
    "834": "Leads.io",
    "973": "Phone Call",
    "965": "Prism",
    "974": "Survey Booking",
    "1058": "Retail Store",
    None: None,
}

pd = Client(domain="https://premiumlithium.pipedrive.com/")
pd.set_api_token(PIPEDRIVE_API_TOKEN)


# Gets deals by filter Lost Deals by Lead Source LOOK INTO PAGINATION https://github.com/GearPlug/pipedrive-python/blob/master/pipedrive/deals.py
def getFilteredDeals(FILTERID):
    print("Getting Deals")
    moreDealsToCome = True
    start = 0
    dealData = []
    while moreDealsToCome:
        response = pd.deals.get_all_deals_with_filter(
            FILTERID, params={"start": start}
        )
        for deal in response["data"]:
            dealData.append(deal)
        if response["additional_data"]["pagination"]["more_items_in_collection"]:
            start = response["additional_data"]["pagination"]["next_start"]
        else:
            moreDealsToCome = False
    return dealData


def createSpreadsheetFrom(deals, FILENAME):
    print("Creating Spreadsheet")
    wb = Workbook()
    ws = wb.active
    ws.append(
        [
            "Deal - Title",
            "Deal - Value",
            "Deal - Organization",
            "Deal - Contact person",
            "Deal - Expected close date",
            "Deal - Next activity date",
            "Deal - Owner",
            "Deal - Lead Source",
            "Deal - Lost reason",
            "Deal - Lost time",
            "Deal - Status",
            "Deal - Deal created",
        ]
    )
    for deal in deals:
        try:
            row = []
            row.append(deal["title"])
            row.append(deal["value"])
            if deal["org_id"] == None:
                row.append(None)
            else:
                row.append(deal["org_id"]["name"])
            row.append(deal["person_id"]["name"])
            row.append(deal["expected_close_date"])
            row.append(deal["next_activity_date"])
            row.append(deal["user_id"]["name"])
            row.append(leadSourceDict[deal[LEAD_SOURCE_KEY]])
            row.append(deal["lost_reason"])
            row.append(deal["lost_time"])
            row.append(deal["status"])  # enum
            row.append(deal["add_time"])
            ws.append(row)
        except:
            pass
    wb.save(FILENAME + str(datetime.now().date()) + ".xlsx")
    return FILENAME + str(datetime.now().date()) + ".xlsx"


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


def main():
    FILTER_ID = LOST_LEAD_FILTER_ID
    FILE_NAME = LOST_LEAD_NAME
    deals = getFilteredDeals(FILTER_ID)
    pathToFile = createSpreadsheetFrom(deals, FILE_NAME)
    uploadToSharepoint(pathToFile)
    FILTER_ID = REPORTING_FILTER_ID
    FILE_NAME = REPORTING_NAME
    deals = getFilteredDeals(FILTER_ID)
    pathToFile = createSpreadsheetFrom(deals, FILE_NAME)
    uploadToSharepoint(pathToFile)

# uploadToSharepoint(FILE_NAME + str(datetime.now().date()) + ".xlsx")
main()
