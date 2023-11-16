<script lang="ts">
	import { onMount } from 'svelte';
	import type { KPIBody } from './KPITypes';
	import { getMatomoAnalytics } from './scripts/matomoAnalytics';
	import type { MatomoAPIOpts } from '../analytics-reporting/scripts/matomoTypes';


    enum siteIDs {
        ENERGISER_WEB = 2,
        SHOPIFY = 4,
    }

	// get all the KPIs Robert wants and display them in a nice dashboard
	// then re-use the code to turn the dashboard into an email

	// How it will be done
	/*
    Traffic: from matomo
    Total page views: from Matomo
    Average page view per visitor: from matomo
    average session time per visitor: from matomo

    leads generated:
        consultations booked: matomo/pipedrive
        surveys booked: matomo/pipedrive?
        chatbot enquiries: pipedrive
        contact us enquiries: matomo/pipedrive
        other: pipedrive
    
    projected total lead value: ???
        consultation and survey value can come from Matomo where there is a value
    */

	// initialise KPIs
	let generalKPIs: Array<KPIBody>;
    let leadSourceStats: Array<KPIBody>;

    let projectedLeadValue: number; // I have no idea how to track this
    
    // allow custom date settings
    let date: MatomoAPIOpts["date"];
    let period: MatomoAPIOpts["period"];

    // TODO: send a date and period with the request that the leads will be filtered by
    async function getData() {
        console.log("getting data")
        // load in the values for the previous day
        let day = "yesterday";
        let period = "day"
        let test = await fetch("kpi/api", {
            method: "POST",
            body: JSON.stringify({date, period}),
            headers: {
                'content-type': 'application/json',
          
            }
        })
        const resp = await test.json()
        console.log(resp)
        leadSourceStats = resp;
        
    }

    function setDate(newDate: MatomoAPIOpts["date"]) {
        date = newDate;
    }
    function setPeriod(newPeriod: MatomoAPIOpts["period"]) {
        period = newPeriod;
    }
</script>
<button on:click={getData}>Get data</button>
<div>
    <h1>Select date and period</h1>
    <div>
        <h3>Date: {date}</h3>
        <button on:click={() => setDate("today")}>Today</button>
        <button on:click={() => setDate("yesterday")}>Yesterday</button>
        <button on:click={() => setDate("lastWeek")}>Last Week</button>
        <button on:click={() => setDate("lastMonth")}>Last Month</button>
        <button on:click={() => setDate("custom")}>Custom</button>
    </div>
    <div>
        <h3>Period: {period}</h3>
        <button on:click={() => setPeriod("day")}>Day</button>
        <button on:click={() => setPeriod("week")}>Week</button>
        <button on:click={() => setPeriod("month")}>Month</button>
        <button on:click={() => setPeriod("year")}>Year</button>
        <button on:click={() => setPeriod("range")}>Range</button>
    </div>
</div>
{#if leadSourceStats}
    <div>
        <h2>
            Leads by source
        </h2>
        <table>
            {#each leadSourceStats as leadSource}
            <tr>
                <td>
                    {leadSource.name}
                </td>
                <td>
                    {leadSource.value}
                </td>
            </tr>
            {/each}
        </table>
    </div>
{/if}

<style>
</style>
