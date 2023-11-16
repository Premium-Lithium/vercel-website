// traffic: API.get / nb_visits
// total page views: API.get / nb_pageviews
// average page views per visitor: derived
// average time on site: API.get / avg_time_on_site

import type { KPIBody } from "../KPITypes"

export async function getMatomoAnalytics(day: string, period: string, site: number) {
    // call to matomo API, needs various matomo utils I built
    

    // dummy response, pending merge of other PR
    const data = {
        nb_visits: 20875,
        nb_pageviews: 35489,
        avg_time_on_site: 238,
    }

    const secondsToMinuteString = function(seconds: number) {
        const minutes = Math.floor(seconds / 60).toString();
        const remainder = (seconds % 60).toString();
        return minutes + " minutes " + remainder + " seconds"
    }
    const matomoKPIs: Array<KPIBody> = [
        {
            name: "visits",
            value: data.nb_visits.toLocaleString(),
        },
        {
            name: "page views",
            value: data.nb_pageviews.toLocaleString(),
        },
        {
            name: "page views per visitor",
            value: (data.nb_pageviews / data.nb_visits).toLocaleString("en-GB", {maximumFractionDigits: 2})
        },
        {
            name: "time spent per visitor",
            value: secondsToMinuteString(data.avg_time_on_site)
        }
    ]
    // return the KPIs in proper format
    return matomoKPIs;
}