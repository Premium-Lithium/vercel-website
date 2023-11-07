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
        ['period', opts.period || 'month'],
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

export async function getSummary(siteId: number, date?: string, period?: MatomoAPIOpts["period"]) {

    // initialise default paramters
    if (!date) date = "yesterday"
    if (!period) period ="month"
    let summaryData: EnergiserSummary = {
        sessions: 0,
        totalRevenue: 0,
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
        date: date,
        period: period,
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
    console.log("metadata", metaData)
    // parse and error check non-bounced sessions
    const unbouncedMetaData = await matomoDataCall("API.get", {
        siteID: siteId,
        date: date,
        period: period,
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

    
    const bookingData = await getBookingDetails(siteId, date, period)

    summaryData.consultationsBooked = bookingData.consultationsBooked;
    summaryData.totalConsultationValue = bookingData.totalConsultationValue;
    summaryData.surveysBooked = bookingData.surveysBooked;
    summaryData.totalSurveyValue = bookingData.totalSurveyValue;
    summaryData.preorderNum = bookingData.preorderNum;
    summaryData.preorderVal = bookingData.preorderVal;
    summaryData.expressNum = bookingData.expressNum;
    summaryData.expressVal = bookingData.expressVal;

    
    //console.log(orderData)
    // query events API for order types

    return summaryData;
}

async function getBookingDetails(siteId: number, date: string, period: MatomoAPIOpts["period"]) {
    // https://energiser.matomo.cloud/index.php?module=API&method=Events.getCategory&expanded=1&secondaryDimension=eventAction&idSite=1&idSubtable=1&period=month&date=2023-11-02&format=JSON&token_auth=01935f0876764df2395daa536871c023&force_api_session=1
    // use this to get actions and names for each category
    // find successfulBooking category and get all the data from it
    // if that doesn't have any data, fall back to SuccessfulConsultationBooking

    // data to get: number/value of consultations/surveys; number/value of preorders/express

    // get actions (consultaion/survey) of bookings
    const eventCategoryActions = await matomoDataCall("Events.getCategory", {
        date: date,
        period: period,
        siteID: siteId,
        additionalOpts: [
            ["secondaryDimension", "eventAction"],
            ["expanded", "1"], // successful booking event
        ]
    });

    const bookingDetails = { // base state
        consultationsBooked: 0,
        totalConsultationValue: 0,
        surveysBooked: 0,
        totalSurveyValue: 0,
        preorderNum: 0,
        preorderVal: 0,
        expressNum: 0,
        expressVal: 0,
    }
    let successfulBookingObj;
    let backupBookingObj;

    // get successful booking object
    for (const category of eventCategoryActions) {  
        if (category.label === "SuccessfulBooking") {
            successfulBookingObj = category;
        } else if (category.label === "SuccessfulConsultationBooking") {
            backupBookingObj = category;
        }
    }
    // get analytics data for previus analytics version instead (just number of consultations)
    if (!successfulBookingObj) {
        if (backupBookingObj) {
            bookingDetails.consultationsBooked = backupBookingObj.nb_events;
        }
        return bookingDetails;
    }

    // get consultation and survey data from booking object
    for (const action of successfulBookingObj.subtable) {
        if (action.label === "Consultation") {
            bookingDetails.consultationsBooked = action.nb_events;
            bookingDetails.totalConsultationValue = action.sum_event_value;
        } else if (action.label === "Survey") {
            bookingDetails.surveysBooked = action.nb_events;
            bookingDetails.totalSurveyValue = action.sum_event_value;
        }
    }

    // get names (express/preorder) of booking events
    const eventCategoryNames = await matomoDataCall("Events.getCategory", {
        date: date,
        period: period,
        siteID: siteId,
        additionalOpts: [
            ["secondaryDimension", "eventName"],
            ["expanded", "1"], // successful booking event
        ]
    });

    // get SuccessfulBooking order type data
    for (const category of eventCategoryNames) {
        if (category.label === "SuccessfulBooking") {
            for (const name of category.subtable) {
                if (name.label === "PREMIUM_EXPRESS") {
                    bookingDetails.expressNum = name.nb_events;
                    bookingDetails.expressVal = name.sum_event_value;
                } else if (name.label === "PREMIUM_PREORDER") {
                    bookingDetails.preorderNum = name.nb_events;
                    bookingDetails.preorderVal = name.sum_event_value;
                }
            }
        }
    }

    return (bookingDetails);
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