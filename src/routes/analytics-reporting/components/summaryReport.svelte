<script lang="ts">
	import SummaryTable from "./summaryTable.svelte";
    import type { EnergiserSummary, MatomoAPIOpts } from "../scripts/matomoTypes";
	import { getSummary, siteId } from "../scripts/summaryReportLogic";

    const STORE_ID = 3;
    const WEBSITE_ID = 2;
    const DEV_ID = 1;

    let storeSummaryData: EnergiserSummary = {
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

    let onlineSummaryData: EnergiserSummary = {
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
    let overallSummaryData: EnergiserSummary = {
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
    


    async function getStoreSummary() {
        // make a call to site 3 (if not testing)

        const data = await getSummary(siteId.STORE)
        storeSummaryData = data;

    }

    async function getOnlineSummary() {
        // make a call to site 2 (if not testing)
        const data = await getSummary(siteId.WEBSITE)
        onlineSummaryData = data;
    }
    
    async function getOverallSummary () {
        // combine store and online summaries
       // const energiserData = getSummary(siteId.WEBSITE)
        //const storeData = getSummary(siteId.STORE)
        const devData = await getSummary(siteId.DEV)
        overallSummaryData = devData;
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
            <SummaryTable
                sessions={storeSummaryData.sessions}
                conversionRate={storeSummaryData.conversionRate}
                bounced={storeSummaryData.bouncedSessions}
                bounceRate={(storeSummaryData.bouncedSessions / storeSummaryData.sessions) * 100 + "%"}
                sessionTime={storeSummaryData.avgSessionLength}
                consultations={storeSummaryData.consultationsBooked}
                consultationValue={storeSummaryData.totalConsultationValue}
                surveys={storeSummaryData.surveysBooked}
                surveyValue={storeSummaryData.totalSurveyValue}
                preorders={storeSummaryData.preorderNum}
                preOrderRevenue={storeSummaryData.preorderVal}
                express={storeSummaryData.expressNum}
                expressRevenue={storeSummaryData.expressVal}
            />
        </div>
        <div class=panel>
            <h4>
                Online summary
            </h4>
            <button on:click={getOnlineSummary}>Get online summary</button>
            <SummaryTable
                sessions={onlineSummaryData.sessions}
                conversionRate={onlineSummaryData.conversionRate}
                bounced={onlineSummaryData.bouncedSessions}
                bounceRate={(onlineSummaryData.bouncedSessions / storeSummaryData.sessions) * 100 + "%"}
                sessionTime={onlineSummaryData.avgSessionLength}
                consultations={onlineSummaryData.consultationsBooked}
                consultationValue={onlineSummaryData.totalConsultationValue}
                surveys={onlineSummaryData.surveysBooked}
                surveyValue={onlineSummaryData.totalSurveyValue}
                preorders={onlineSummaryData.preorderNum}
                preOrderRevenue={onlineSummaryData.preorderVal}
                express={onlineSummaryData.expressNum}
                expressRevenue={onlineSummaryData.expressVal}
            />
        </div>
        <div class=panel>
            <h4>
                Overall summary (dev for now)
            </h4>
            <button on:click={getOverallSummary}>Get overall summary</button>
            <SummaryTable
                sessions={overallSummaryData.sessions}
                conversionRate={overallSummaryData.conversionRate}
                bounced={overallSummaryData.bouncedSessions}
                bounceRate={(overallSummaryData.bouncedSessions / storeSummaryData.sessions) * 100 + "%"}
                sessionTime={overallSummaryData.avgSessionLength}
                consultations={overallSummaryData.consultationsBooked}
                consultationValue={overallSummaryData.totalConsultationValue}
                surveys={overallSummaryData.surveysBooked}
                surveyValue={overallSummaryData.totalSurveyValue}
                preorders={overallSummaryData.preorderNum}
                preOrderRevenue={overallSummaryData.preorderVal}
                express={overallSummaryData.expressNum}
                expressRevenue={overallSummaryData.expressVal}
            />
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