import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

import { filterDealsByFieldKey, filterDealsByFieldName, getAllDeals, getAllFields, getAllLeads, getFieldData, getFieldKey, resetPipedriveApiData } from "$lib/pipedrive/utils/pipedriveUtils";
import type { LeadSourceData } from "$lib/pipedrive/utils/pipedriveUtilTypes";
import type { KPIBody } from "../KPITypes";

// leads are in custom fields
let leadSourceData: Array<LeadSourceData> = [
    {
        title: "Consultation booking",
        pipedriveSources: ["Consultation Booking", "Energiser - Consultation", ],
    },
    {
        title: "Survey booking",
        pipedriveSources: ["Survey Booking", "Energiser - Survey"],
    },
    {
        title: "Chatbot",
        pipedriveSources: ["Chatbot"],
        altField: {
            sourceValue: null,
            fieldKey: "source_name",
            fieldValue: "Leadbooster",
        }
    },
    {
        title: "Contact us enquiries",
        pipedriveSources: ["Contact Us Webform", ],
    },
    {
        title: "Energiser",
        pipedriveSources: ["Energiser - Callback", "Energiser - Consultation", "Energiser - Survey"],
    },
    {
        title: "Store",
        pipedriveSources: ["Retail Store"],
    },
    {
        title: "Other",
        pipedriveSources: ["Battery Finder", "Customer Referral", "DDS", "Email", "Leads.io", "Phone Call"],
    },
]




let opts = {
    limit: 100,
    start: 0,
}

export async function POST({ request }: RequestEvent) {
    resetPipedriveApiData();
    // const leads = await getAllLeads();
    // const filteredLeads = await filterDealsByField(leads.data, "Lead Source", "DDS")
    // const deals = await getAllDeals();
    // const filteredDeals = await filterDealsByField(deals.data, "Lead Source", "DDS")
    // const key = await getFieldKey("Lead Source")
    // let leadSources = []
    // for (const lead of leads.data) {
    //     leadSources.push(lead["source_name"])
    // }
    // const allDeals = await getAllDeals();
    // const testDeals = await getAllDeals();
    // const allLeads = await getAllLeads();
    // const allFields = await getAllFields();
    // const fieldData = await getFieldData("Lead Source")
    // const fieldKey = await getFieldKey("Lead Source")
    // return json([allDeals, allLeads, allFields, fieldData, fieldKey])
    // return json([filteredLeads, filteredDeals, leads, deals])
    // return json([leadSources, leads, allFields]);
    const leadData = await getLeadSourceCounts()
    return json(leadData);
}


async function getLeadSourceCounts() {
    const leads = await getAllLeads();
    const deals = await getAllDeals();
    let kpiData: Array<KPIBody> = []
    for (const source of leadSourceData) {
        let sourceCount = 0;
        // data for each lead source category
        // for each pipedrive source, filter leads and deals
        for (const pipedriveSource of source.pipedriveSources) {
            const filteredLeads = await filterDealsByFieldName(leads.data, "Lead Source", pipedriveSource);
            const filteredDeals = await filterDealsByFieldName(deals.data, "Lead Source", pipedriveSource);
            if (filteredLeads) {
                sourceCount += filteredLeads.length;
            }
            if (filteredDeals) {
                sourceCount += filteredDeals.length;
            }
        }
        if (source.altField) {
            if (source.altField.fieldKey) {
                const filteredLeads = filterDealsByFieldKey(leads.data, source.altField.fieldKey, source.altField.fieldValue)
                if (filteredLeads) sourceCount += filteredLeads.length;
                const filteredDeals = filterDealsByFieldKey(deals.data, source.altField.fieldKey, source.altField.fieldValue)
                if (filteredDeals) sourceCount += filteredDeals.length;
            } else if (source.altField.fieldName) {
                const filteredLeads = await filterDealsByFieldName(leads.data, source.altField.fieldName, source.altField.fieldValue)
                if (filteredLeads) sourceCount += filteredLeads.length;
                const filteredDeals = await filterDealsByFieldName(deals.data, source.altField.fieldName, source.altField.fieldValue)
                if (filteredDeals) sourceCount += filteredDeals.length;
            }
        }
        source
        // construct KPI
        const kpi: KPIBody = {
            name: source.title,
            value: sourceCount.toLocaleString(),
        }
        kpiData.push(kpi);
    }
    return kpiData;
}