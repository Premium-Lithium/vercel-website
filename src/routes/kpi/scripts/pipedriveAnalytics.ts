import pipedrive from 'pipedrive';
const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;



export async function getPipedriveAnalytics() {
    // need to get number of consultations, surveys, chatbot enquiries and contact us enquiries
    // lead source: 

    // consultations booked: where Lead Source === "Energiser - Consultation" || "Consultation Booking"
    // surveys booked: where Lead Source === "Survey Booking" || "Energiser - Survey"
    // chatbot: where Lead Source === "Chatbot" or Lead source === "Chatbot"
    // contact us enquiries: where Lead Source === "Contact Us Webform"
    // other: literally any other Lead Source

    // need to get these for leads and deals
    const allLeads = getAllLeads()

    return allLeads;

}

function getAllDeals() {

}

function getAllLeads() {
    let leadsApi = new pipedrive.LeadsApi(pd);
    let opts = {
        "limit": 1000,
        "start": 0,
    }
    leadsApi.getLeads(opts).then((data) => {
        return data;
    })

}