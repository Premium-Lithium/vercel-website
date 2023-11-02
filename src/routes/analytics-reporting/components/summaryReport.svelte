<script lang="ts">
	import SummaryTable from "./summaryTable.svelte";
    import type { EnergiserSummary, MatomoAPIOpts } from "../scripts/matomoTypes";

    const STORE_ID = 3;
    const WEBSITE_ID = 2;
    const DEV_ID = 1;

    enum siteId {
        STORE = 3,
        WEBSITE = 2,
        DEV = 1,
    }

    const unbouncedSessionSegment = "interactions>%3D3";

    async function matomoDataCall(method: string, opts?: MatomoAPIOpts) {
        if (!opts) {
			opts = {};
		}
		let queryData = [
			['method', method],
			['idSite', String(opts.siteID || 1)],
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

    async function getSummary(siteId: number) {
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
        siteId = 1
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
        summaryData.bouncedSessions = summaryData.sessions = summaryData.unBouncedSessions;

        // get booking data
        const eventData = await matomoDataCall("Events.getActionFromCategoryId", {
            additionalOpts: [
                ["idSubtable", "4"] // successful booking event
            ]
        });
        for (const booking of eventData) {
            if (booking.label === "Consultation") {
                summaryData.consultationsBooked = booking.nb_visits;
                summaryData.totalConsultationValue = booking.sum_event_value;
            } else if (booking.label === "Survey") {
                summaryData.surveysBooked = booking.nb_visits;
                summaryData.totalSurveyValue = booking.sum_event_value;
            }
        }

        // get name (plan selection), need to wait till tomorrow to properly test
        const orderData = await matomoDataCall("Events.getNameFromCategoryId", {
            additionalOpts: [
                ["idSubtable", "4"] // successful booking event
            ]
        });
        console.log(orderData)
        // query events API for order types
        let preorderNum = 1;
        let preOrderVal = 4000;
        let expressNum = 4;
        let expressVal = 14000;


        return 0;
    }

    async function getStoreSummary() {
        // make a call to site 3 (if not testing)

        const data = getSummary(siteId.STORE)

    }

    async function getOnlineSummary() {
        // make a call to site 2 (if not testing)
        const data = getSummary(siteId.WEBSITE)
    }
    
    async function getOverallSummary () {
        // combine store and online summaries
        const energiserData = getSummary(siteId.WEBSITE)
        const storeData = getSummary(siteId.STORE)
        const devData = getSummary(siteId.DEV)
    }
</script>

<body>
    <h3>
        Energiser overall summary
    </h3>
    <div class=panels>
        <div class=panel>
            <h4>
                Store summary
            </h4>
            <button on:click={getStoreSummary}>Get store summary</button>
            <SummaryTable />
        </div>
        <div class=panel>
            <h4>
                Online summary
            </h4>
            <button on:click={getOnlineSummary}>Get online summary</button>
            <SummaryTable />
        </div>
        <div class=panel>
            <h4>
                Overall summary
            </h4>
            <button on:click={getOverallSummary}>Get overall summary</button>
            <SummaryTable />
        </div>
    </div>
</body>
<style>
    .panels {
        display: flex;
        flex-direction: row;
        width: 80%;
        margin: auto;
        min-height: 100px;
    }
    .panel {
        background-color: #a6e6f4;
        min-height: 40px;
        min-width: 40px;
        border: 1px solid black;
        flex-grow: 1;
    }
    body {
        text-align: center;
    }

</style>