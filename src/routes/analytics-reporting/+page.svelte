<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	interface AssistantData {
		sessions: number,
		medSessionLength: number,
		totalSessionTime: number,
		numConsultationsBooked: number,
		numSurveysBooked: number,
		conversionRate: string,

	}

	interface MatomoAPIOpts {
		siteID?: number,
		period?: "day" | "week" | "month" | "year" | "range",
		date?: "today" | "yesterday" | "lastWeek" | "lastMonth" | "lastYear" | string,
		segment?: string,
		format?: "xml" | "json" | "csv" | "tsv" | "html" | "original",
		filterLimit?: number,
		expanded?: "0" | "1",
		flat?: "0" | "1",
	}

	let dataString = JSON.stringify(data.post);

	console.log(data);
	const mtmo = data.post;
	// load up some interesting data
	const interestingdata = {
		visitors: mtmo.nb_visits,
		bouncerate: mtmo.bounce_rate,
		avgSiteTime: mtmo.avg_time_on_site,
		conversionRate: mtmo.conversion_rate,
	};

	let assistantID = 1;
	let assistantData = {

	}
	

	async function getMatomoData (method: string, opts?:MatomoAPIOpts ) {
		if (!opts) {
			opts = {}
		}
		let queryData = [
			["method", method],
			["idSite", String(opts.siteID || 3)],
			["period", opts.period || "day"],
			["date", opts.date || "yesterday"],
			["format", opts.format || "JSON"],
		]
		// handle optional API parameters
		if (opts.expanded) {
			queryData.push(["expanded", opts.expanded])
		}
		if (opts.flat) {
			queryData.push(["flat", opts.flat])
		}
		console.log("Querydata", queryData)
		const data = await fetch("", {
			method: "POST",
			body: JSON.stringify(queryData),
			headers: {
				"content-type": "application/json"
			}
		});
		const res = await data.json();
		return res;
	}

	function changeAssistant(id: number) {
		assistantID = id;
		getMatomoData("API.get", {
			period: "month"
		})
	}

	async function someData() {
		let data = await getMatomoData("Actions.getPageTitles", {
			flat: "1"
		})
		console.log(data)
	}
</script>

<body>
	<div>
		<h1>get aggregate data for each assistant</h1>
		<p>Make a call to the matomo API to get data for every session</p>
		<h2>Some interesing data</h2>
		<table>
			<tr>
				<td>Visitors</td>
				<td>{interestingdata.visitors}</td>
			</tr>
			<tr>
				<td>Bounce rate</td>
				<td>{interestingdata.bouncerate}</td>
			</tr>
			<tr>
				<td>Average time on site</td>
				<td>{interestingdata.avgSiteTime} seconds</td>
			</tr>
			<tr>
				<td>Conversion rate</td>
				<td>{interestingdata.conversionRate}</td>
			</tr>
		</table>
	</div>
	<div>
		<button on:click={() => changeAssistant(1)}>Assistant 1</button>
		<button on:click={() => changeAssistant(2)}>Assistant 2</button>
		<button on:click={() => changeAssistant(3)}>Assistant 3</button>
		<button on:click={() => changeAssistant(4)}>Assistant 4</button>
		<button on:click={() => changeAssistant(5)}>Assistant 5</button>
	</div>
	<div class=assistant_info>
		<h3>
			Assistant {assistantID} info
		</h3>
		<button on:click={someData}>Get some data</button>
		<table>
			<tr>
				<td>Sessions</td>
				<td></td>
			</tr>
			<tr>
				<td></td>
				<td></td>
			</tr>
			<tr>
				<td></td>
				<td></td>
			</tr>
			<tr>
				<td></td>
				<td></td>
			</tr>
			<tr>
				<td></td>
				<td></td>
			</tr>
			<tr>
				<td></td>
				<td></td>
			</tr>
		</table>
	</div>
</body>

<style>
	.assistant_info {
		width: 40%;
		min-height: 100px;
		background-color: #eeeefe;
	}
</style>
