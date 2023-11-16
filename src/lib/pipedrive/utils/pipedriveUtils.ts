import type { APIResponseData, PipedriveQueryParameters, PipedriveResponse } from './pipedriveUtilTypes';
import pipedrive from 'pipedrive';
const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;

// this should probably be re-written as a class

// persistent api response storage to reduce number of calls in a single instance
let apiResponseData: APIResponseData = {

}

// default opts for pagination
const defaultOpts: PipedriveQueryParameters = {
    limit: 500,
    start: 0
}

// declare APIs
const leadsApi = new pipedrive.LeadsApi(pd);
const dealsApi = new pipedrive.DealsApi(pd);
const dealFieldsApi = new pipedrive.DealFieldsApi(pd);

// get all leads
async function getAllLeads(opts?: PipedriveQueryParameters) {
    if (!apiResponseData.allLeads) {
        const getLeadFunction = async (opts?: PipedriveQueryParameters) => {
            return await leadsApi.getLeads(opts);
        }
        const allLeads = await fetchAllPaginated(getLeadFunction, opts);
        return allLeads;
    } else {
        return apiResponseData.allLeads;
    }
}

// get all deals
async function getAllDeals(opts?: PipedriveQueryParameters) {
    if (!apiResponseData.allDeals) {  // only call API if data hasn't been fetched this session
        const getDealFunction = async (opts?: PipedriveQueryParameters) => {
            return await dealsApi.getDeals(opts)
        }
        const allDeals = await fetchAllPaginated(getDealFunction, opts);
        apiResponseData.allDeals = allDeals;
        return allDeals;
    } else {
        return apiResponseData.allDeals;
    }
}

// filter a list of leads/deals by value of a field (deals as shorthand for leads/deals)
async function filterDealsByFieldName(deals: Array<any>, fieldName: string, fieldValue: string) {
    // check field data for type
    const fieldData = await getFieldData(fieldName);
    const fieldKey = fieldData.key;
    const fieldType = fieldData.field_type;

    // if type is enum, get corresponding option ID
    let optionId = -1; // for error handling
    if (fieldType === "enum") {
        for (const option of fieldData.options) {
            if (option.label === fieldValue) {
                optionId = option.id;
            }
        }
        if (optionId === -1) {
            return false; // fail state, option doesn't exist
        }
    }
    let filteredDeals = [];
    for (const deal of deals) {
        const field = deal[fieldKey]
        if (field == fieldValue || field == optionId) {
            filteredDeals.push(deal)
        }
    }
    return filteredDeals;
}
// filter by key instead of name - just don't search for key
function filterDealsByFieldKey(deals: Array<any>, fieldKey: string, fieldValue: string) {
    let filteredDeals = [];
    for (const deal of deals) {
        const field = deal[fieldKey];
        if (String(field) === fieldValue) {
            filteredDeals.push(deal);
        }
    }
    return filteredDeals;
}


// get key for field
async function getFieldKey(name: string) {
    // call getFieldData and get the key
    const fieldKey = (await getFieldData(name)).key
    return fieldKey;
}


// get field data from field name
async function getFieldData(name: string) {
    // get all fields and search for the one with the right name
    const allFields = await getAllFields();
    if (allFields.success) {
        const matchingField = allFields.data.find((field) => field.name === name)
        return matchingField;
    } else {
        return false;
    }
}

// get all fields
async function getAllFields(opts?: PipedriveQueryParameters) {
    if (!apiResponseData.allFields) {
        const getFieldsFunction = async (opts?: PipedriveQueryParameters) => {
            return await dealFieldsApi.getDealFields(opts);
        }
        const allFields = await fetchAllPaginated(getFieldsFunction, opts);
        return allFields;
    } else {
        return apiResponseData.allFields;
    }
}

// getch all data for given API request
async function fetchAllPaginated(func: Function, opts?: PipedriveQueryParameters): Promise<PipedriveResponse> {
    if (!opts) {
        opts = defaultOpts
    }
    let results = [];
    while (true) {
        let res = await func(opts)
        results.push(...res.data)
        if (res.additional_data.pagination.more_items_in_collection) {
            opts.start = res.additional_data.pagination.next_start;
        } else {
            opts.start = 0
            return { additional_data: res.additional_data, data: results, success: res.success };
        }
    }
}

function resetPipedriveApiData() {
    apiResponseData = {}
}

export {
    resetPipedriveApiData,
    fetchAllPaginated,
    getAllLeads,
    getAllDeals,
    getAllFields,
    getFieldData,
    getFieldKey,
    filterDealsByFieldName,
    filterDealsByFieldKey,
}