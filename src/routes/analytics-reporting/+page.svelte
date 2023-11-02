<script lang="ts">
	import type { PageData } from './$types';
	import SummaryReport from './components/summaryReport.svelte';
	import type { DataSummary, MatomoAPIOpts } from './scripts/matomoTypes';


	export let data: PageData;

	

	let assistantData: DataSummary = {
		// data for selected assistant
		sessions: 0,
		totalSessionTime: 0,
		avgSessionTime: 0,
		numConsultationsBooked: 0,
		totalConsultationValue: 0,
		numSurveysBooked: 0,
		totalSurveyValue: 0,
		conversionRate: '0%',
		sessionValue: 0,
		sessionValuePerMinute: 0
	};

	let storeData: DataSummary = {
		// data for selected assistant
		sessions: 0,
		totalSessionTime: 0,
		avgSessionTime: 0,
		numConsultationsBooked: 0,
		totalConsultationValue: 0,
		numSurveysBooked: 0,
		totalSurveyValue: 0,
		conversionRate: '0%',
		sessionValue: 0,
		sessionValuePerMinute: 0
	};

	console.log(data);
	const mtmo = data.post;
	// load up some interesting data
	const interestingdata = {
		visitors: mtmo.nb_visits,
		bouncerate: mtmo.bounce_rate,
		avgSiteTime: mtmo.avg_time_on_site,
		conversionRate: mtmo.conversion_rate
	};

	let assistantID = 1;

	async function getMatomoData(method: string, opts?: MatomoAPIOpts) {
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
		// handle optional API parameters
		if (opts.expanded) {
			queryData.push(['expanded', opts.expanded]);
		}
		if (opts.flat) {
			queryData.push(['flat', opts.flat]);
		}

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
		return res;
	}

	async function changeAssistant(id: number) {
		assistantID = id;

		const segment = 'eventCategory==setAssistant;eventAction==' + String(assistantID);
		// fetch the actual data for that assistant

		// session number data

		// data for bookings

		const bookingData = await getBookingData(segment);

		const sessionData = await getSessiondata(segment);

		// extract data from returned values
		assistantData.sessions = sessionData.num;
		assistantData.totalSessionTime = sessionData.totalTime;
		assistantData.avgSessionTime = sessionData.avgDuration;
		assistantData.numConsultationsBooked = bookingData.consultation.num;
		assistantData.totalConsultationValue = bookingData.consultation.val;
		assistantData.numSurveysBooked = bookingData.survey.num;
		assistantData.totalSurveyValue = bookingData.survey.val;
		assistantData.conversionRate = sessionData.conversionRate;
		assistantData.sessionValue = Math.round(
			(bookingData.survey.val + bookingData.consultation.val) / sessionData.num
		);
		assistantData.sessionValuePerMinute = Math.round(
			(bookingData.survey.val + bookingData.consultation.val) / (sessionData.totalTime / 60)
		);
	}

	async function someData() {
		// get segmented data for an assistant

		// define segment for specific assistant ID
		const segment = 'eventCategory==setAssistant;eventAction==' + String(assistantID);

		let data = await getSessiondata(segment);
		console.log(data);
	}

	async function getBookingData(segment?: string) {
		// get count for each booking event
		// event category successfulBooking has subtable ID 4
		let opts = [['idSubtable', '4']];
		if (segment) {
			opts.push(['segment', segment]);
		}
		let data = await getMatomoData('Events.getActionFromCategoryId', {
			additionalOpts: opts
		});

		let bookingData = {
			consultation: {
				num: 0,
				val: 0
			},
			survey: {
				num: 0,
				val: 0
			}
		};
		// handle if error instead
		if (data.result) {
			if (data.result === 'error') {
				console.log(data.message);
				return bookingData;
			}
		}
		// returns array containing an object for every event this matches
		// for each element, construct whatever data is needed
		console.log(data)
		for (const booking of data) {
			if (booking.label === 'Consultation') {
				bookingData.consultation.num = booking.nb_visits;
				bookingData.consultation.val = booking.sum_event_value;
			} else if (booking.label === 'Survey') {
				bookingData.survey.num = booking.nb_visits;
				bookingData.survey.val = booking.sum_event_value;
			}
		}
		return bookingData;
	}

	async function getSessiondata(segment?: string) {
		// get data on session number, length and conversion rate
		let opts = [];
		if (segment) {
			opts.push(['segment', segment]);
		}
		let data = await getMatomoData('API.get', {
			additionalOpts: opts
		});
		const sessionData = {
			num: data.nb_visits,
			totalTime: data.sum_visit_length,
			avgDuration: data.avg_time_on_site,
			conversionRate: data.conversion_rate
		};

		return sessionData;
	}

	async function eventConstructor(segment?: string) {
		let opts = [];
		if (segment) {
			opts.push(['segment', segment]);
		}
		let data = await getMatomoData('Events.getCategory', {
			additionalOpts: opts
		});
		return data;
	}

	async function summaryConstructor(segment?: string) {
		let opts = [];
		if (segment) {
			opts.push(['segment', segment]);
		}
		let data = await getMatomoData('API.get', {
			additionalOpts: opts
		});
		return data;
	}

	// construct request for Live last visits API
	async function lastVisitConstructor(segment: string) {
		let data = await getMatomoData('Live.getLastVisitsDetails', {
			additionalOpts: [
				['countVisitorsToFetch', '10'],
				['segment', segment]
			]
		});
		return data;
	}

	async function getStoreSummary() {
		// fetch all the data needed for a store summary
		// same as assistant data, but without segmentation

		const bookingData = await getBookingData();

		const sessionData = await getSessiondata();

		// extract data from returned values
		storeData.sessions = sessionData.num;
		storeData.totalSessionTime = sessionData.totalTime;
		storeData.avgSessionTime = sessionData.avgDuration;
		storeData.numConsultationsBooked = bookingData.consultation.num;
		storeData.totalConsultationValue = bookingData.consultation.val;
		storeData.numSurveysBooked = bookingData.survey.num;
		storeData.totalSurveyValue = bookingData.survey.val;
		storeData.conversionRate = sessionData.conversionRate;
		storeData.sessionValue = Math.round(
			(bookingData.survey.val + bookingData.consultation.val) / sessionData.num
		);
		storeData.sessionValuePerMinute = Math.round(
			(bookingData.survey.val + bookingData.consultation.val) / (sessionData.totalTime / 60)
		);
	}
</script>

<body>
	<div>
		<h1>get aggregate data for each assistant</h1>
		<p>Make a call to the matomo API to get data for every session</p>
		<h2>Some interesting data</h2>
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
		<button on:click={() => changeAssistant(123512)}>Assistant 123512</button>
		<button on:click={() => changeAssistant(-1)}>Assistant not selected</button>
	</div>
	<div class="panel">
		<div class="assistant-info">
			<h3>
				Assistant {assistantID} info
			</h3>
			<button on:click={someData}>Get some data</button>
			<table>
				<tr>
					<td>Sessions</td>
					<td>{assistantData.sessions}</td>
				</tr>
				<tr>
					<td>Total session time</td>
					<td>{assistantData.totalSessionTime} seconds</td>
				</tr>
				<tr>
					<td>Average session time</td>
					<td>{assistantData.avgSessionTime} seconds</td>
				</tr>
				<tr>
					<td>Consultations booked</td>
					<td>{assistantData.numConsultationsBooked}</td>
				</tr>
				<tr>
					<td>Total Consultation Value</td>
					<td>£{assistantData.totalConsultationValue}</td>
				</tr>
				<tr>
					<td>Surveys booked</td>
					<td>{assistantData.numSurveysBooked}</td>
				</tr>
				<tr>
					<td>Total Survey Value</td>
					<td>£{assistantData.totalSurveyValue}</td>
				</tr>
				<tr>
					<td>Conversion rate</td>
					<td>{assistantData.conversionRate}</td>
				</tr>
				<tr>
					<td>Avg session value</td>
					<td>£{assistantData.sessionValue}</td>
				</tr>
				<tr>
					<td>Value per minute</td>
					<td>£{assistantData.sessionValuePerMinute}</td>
				</tr>
			</table>
		</div>
		<div class="store-summary">
			<h3>Store summary</h3>
			<button on:click={getStoreSummary}>Get store summary</button>
			<table>
				<tr>
					<td>Sessions</td>
					<td>{storeData.sessions}</td>
				</tr>
				<tr>
					<td>Total session time</td>
					<td>{storeData.totalSessionTime} seconds</td>
				</tr>
				<tr>
					<td>Average session time</td>
					<td>{storeData.avgSessionTime} seconds</td>
				</tr>
				<tr>
					<td>Consultations booked</td>
					<td>{storeData.numConsultationsBooked}</td>
				</tr>
				<tr>
					<td>Total Consultation Value</td>
					<td>£{storeData.totalConsultationValue}</td>
				</tr>
				<tr>
					<td>Surveys booked</td>
					<td>{storeData.numSurveysBooked}</td>
				</tr>
				<tr>
					<td>Total Survey Value</td>
					<td>£{storeData.totalSurveyValue}</td>
				</tr>
				<tr>
					<td>Conversion rate</td>
					<td>{storeData.conversionRate}</td>
				</tr>
				<tr>
					<td>Avg session value</td>
					<td>£{storeData.sessionValue}</td>
				</tr>
			</table>
		</div>
	</div>
	<SummaryReport />
</body>

<style>
	.assistant-info {
		width: 40%;
		min-height: 100px;
		background-color: #eeeefe;
	}
	.store-summary {
		width: 40%;
		min-height: 100px;
		background-color: #eeeefe;
	}
	.panel {
		display: flex;
		flex-direction: row;
	}
</style>
