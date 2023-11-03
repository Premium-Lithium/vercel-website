import type { EnergiserSummary, MatomoAPIOpts } from "./matomoTypes";

// constants
const unbouncedSessionSegment = "interactions>%3D3";
export enum siteId {
    STORE = 3,
    WEBSITE = 2,
    DEV = 1,
}



async function matomoDataCall(method: string, opts?: MatomoAPIOpts) {
    if (!opts) {
        opts = {};
    }
    let queryData = [
        ['method', method],
        ['idSite', String(opts.siteID || siteId.DEV)],
        ['period', opts.period || 'day'],
        ['date', opts.date || 'yesterday'],
        ['format', opts.format || 'JSON']
    ];

    // any extra params
    if (opts.additionalOpts) {
        queryData.push(...opts.additionalOpts);
    }
    const data = await fetch('', {
        method: 'POST',
        body: JSON.stringify(queryData),
        headers: {
            'content-type': 'application/json'
        }
    });
    const res = await data.json();
    if (res.result === "error") {
        return {
            result: "error",
            message: res.message,
        }
    }
    return res;
}

export async function getSummary(siteId: number) {
    let summaryData: EnergiserSummary = {
        sessions: 0,
        conversionRate: "0%",
        unBouncedSessions: 0,
        bouncedSessions: 0,
        avgSessionLength: 0,
        consultationsBooked: 0,
        totalConsultationValue: 0,
        surveysBooked: 0,
        totalSurveyValue: 0,
        preorderNum: 0,
        preorderVal: 0,
        expressNum: 0,
        expressVal: 0,
    }
    // get info from metadata API
    // stats should include bounced sessions
    //siteId = 3
    const metaData = await matomoDataCall("API.get", {
        siteID: siteId
    });
    // if there is an error, leave at defaults
    if (metaData.result === "error") {
        console.log(metaData.message);
    } else {
        summaryData.conversionRate = metaData.conversion_rate;
        summaryData.sessions = metaData.nb_visits;
        summaryData.avgSessionLength = metaData.avg_time_on_site;
    }
    // parse and error check non-bounced sessions
    const unbouncedMetaData = await matomoDataCall("API.get", {
        siteID: siteId,
        additionalOpts: [
            ["segment", unbouncedSessionSegment]
        ],
    });
    if (unbouncedMetaData.result === "error") {
        console.log(unbouncedMetaData.message);
    } else {
        summaryData.unBouncedSessions = unbouncedMetaData.nb_visits;
    }
    summaryData.bouncedSessions = summaryData.sessions - summaryData.unBouncedSessions;

    // to get the right subtable ID, first get the subtable

    // get subtable ID
    let categorySubtableId = await getCategorySubtableId("SuccessfulBooking", siteId);
    // backup is in case no names are found on the main one - for some reason they might be assigned differently?
    let backupCategorySubtableId = await getCategorySubtableId("BookConsultation", siteId)
    let detailedGoals = true; // additional data stored with goal events
    if (categorySubtableId === -1) { // SuccessfulBooking event not found
        // use old event, no detailed tracking
        categorySubtableId = await getCategorySubtableId("SuccessfulConsultationBooking", siteId)
        detailedGoals = false;
    }

    if (detailedGoals === true) {

        // get booking data
        const eventData = await matomoDataCall("Events.getActionFromCategoryId", {
            siteID: siteId,
            additionalOpts: [
                ["idSubtable", String(categorySubtableId)], // successful booking event
            ]
        });

        // get event names (don't know why this works but it does)
        let eventNames = await matomoDataCall("Events.getNameFromCategoryId", {
            siteID: siteId,
            additionalOpts: [
                ["idSubtable", String(categorySubtableId)], // successful booking event
            ]
        });

        if (eventNames.length === 0) {
            // try the other option
            eventNames = await matomoDataCall("Events.getNameFromCategoryId", {
                siteID: siteId,
                additionalOpts: [
                    ["idSubtable", String(backupCategorySubtableId)], // successful booking event
                ]
            });
        }

        // get booking type data
        for (const booking of eventData) {
            if (booking.label === "Consultation") {
                summaryData.consultationsBooked = booking.nb_events;
                summaryData.totalConsultationValue = booking.sum_event_value;
            } else if (booking.label === "Survey") {
                summaryData.surveysBooked = booking.nb_events;
                summaryData.totalSurveyValue = booking.sum_event_value;
            }
        }

        // get order type data

        for (const name of eventNames) {
            if (name.label === "PREMIUM_EXPRESS") {
                summaryData.expressNum = name.nb_events;
                summaryData.expressVal = name.sum_event_value;
            } else if (name.label === "PREMIUM_PREORDER") {
                summaryData.preorderNum = name.nb_events;
                summaryData.preorderVal = name.sum_event_value;
            }
        }
        
        
    }
    //console.log(orderData)
    // query events API for order types

    console.log("summary data", summaryData)
    return summaryData;
}

// make matomo data call for category
async function getCategorySubtableId(category: string, siteId: number) {
    const categories = await matomoDataCall("Events.getCategory", {
        siteID: siteId,
    })
    for (const categoryData of categories) {
        if (categoryData.label === category) {
            return categoryData.idsubdatatable
        }

    }
    console.log("none found", category)
    return -1;
}