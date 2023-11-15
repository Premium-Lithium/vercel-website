<script lang="ts">
	import { onMount } from 'svelte';
	import type { GeneralKPI as KPIBody } from './KPITypes';
	import { getMatomoAnalytics } from './scripts/matomoAnalytics';


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
    
	let leadKPIs: Array<KPIBody> = [];

        let projectedLeadValue: number; // I have no idea how to track this

	onMount(async () => {
		// load in the values for the previous day
        let day = "yesterday";
        let period = "day"
        let test = await fetch("kpi/api", {
            method: "POST",
            body: "test",
            headers: {
                'content-type': 'application/json',
          
            }
        })
        const resp = await test.json()
        console.log(resp)

	});

    async function getData() {
        
    }
</script>
<button on:click={getData}>Get data</button>


<style>
</style>
