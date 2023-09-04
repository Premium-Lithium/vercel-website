<script lang="ts">
	import { ssp, queryParam, queryParameters } from 'sveltekit-search-params';

	import Map from '$lib/components/Map.svelte';
	import Savings from '$lib/components/Savings.svelte';
	import NavButtons from '$lib/components/NavButtons.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Carousel from '$lib/components/Carousel.svelte';

	import { onMount } from 'svelte';

	import Solution3DView from './Solution3DView.svelte';
	import ProgressHeader from './ProgressHeader.svelte';
	import EnergyStage from './EnergyStage.svelte';
	import Investments from './Investments.svelte';
	import SavingsScreen from './SavingsScreen.svelte';

	import SolarApi from './SolarApi.svelte';

	import nextSlide from '$lib/components/Carousel.svelte';
	import SolarQuestions from './SolarQuestions.svelte';

	let map;
	let mapboxSearchResult = { latitude: 53.95924825020342, longitude: -1.0772513524147558 };
	let monthlySolarGenerationValues = [];
	let loadingSolarValues = false;
	let carouselEnergyStage;
	let carouselSolar;
	let carouselSavings;
	let carouselInvestments;
	let termsOfServiceAccepted;
	const stage = queryParam('stage', ssp.number());

	const allQueryParameters = queryParameters({
		// energy stage params
		battery: ssp.boolean(),
		solar: ssp.boolean(),
		ev: ssp.boolean(),
		epsups: ssp.boolean(),
		energyUsage: ssp.number(),
		isEnergyUsageExact: ssp.boolean(),
		moreWinterUsage: ssp.boolean(),
		workFromHome: ssp.boolean(),
		oilAndGas: ssp.boolean(),
		highConsumptionDevices: ssp.boolean(),
		// solar questions params
		haveSolar: ssp.boolean(),
		haventSolar: ssp.boolean(false),
		// solar stage params
		peakSolarPower: ssp.number(8.8),
		solarLoss: ssp.number(15),
		solarAngle: ssp.number(45),
		solarAzimuth: ssp.number(0),
		mapboxSearchParams: ssp.object({ latitude: 53.95924825020342, longitude: -1.0772513524147558 })
	});
	// prevent negative pages
	onMount(() => {
		if ($stage == null) {
			$stage = 0;
		}
		if ($stage < 0) {
			$stage = 0;
		}
	});

	const solution = {
		houseType: 'detatched',
		solar: { selected: true, minPannels: 0, maxPannels: 20, selectedPannels: 0 },
		battery: true,
		batterySize_kWh: 5,
		evCharger: { selected: true },
		usage: 'unknown',
		peopleInHouse: 4,
		wfh: 0,
		postcode: '',
		addOns: { ups: true, evCharger: false, smartBattery: false, birdGuard: false }
	};
</script>

<body>
	<div class="progressHeader">
		<ProgressHeader
			titles={['Energy', 'Solar', 'Savings', 'Investment']}
			bind:selectedIndex={$stage}
		/>
	</div>
	{#if $stage === 0}
		{#key $allQueryParameters}
			<Carousel bind:this={carouselEnergyStage}>
				<EnergyStage bind:queryParams={$allQueryParameters} />
			</Carousel>
		{/key}
	{:else if $stage === 1}
		<Carousel bind:this={carouselSolar}>
			<div><SolarQuestions bind:allQueryParameters={$allQueryParameters} /></div>
			<div class="map-view">
				<Map search={true} style="5" bind:map bind:searchResult={mapboxSearchResult} />
			</div>
			<div><SolarApi bind:allQueryParameters={$allQueryParameters} bind:loadingSolarValues /></div>
		</Carousel>
	{:else if $stage === 2}
		{#key $allQueryParameters}
			<!-- Todo make better looking -->
			<Carousel bind:this={carouselSavings}>
				<SavingsScreen />
			</Carousel>
		{/key}
	{:else if $stage === 3}
		{#key $allQueryParameters}
			<!-- Todo make less bad looking -->
			<Carousel bind:this={carouselInvestments}>
				<Investments {solution} />
			</Carousel>
		{/key}
	{:else}
		<Solution3DView />
		REVIEW
	{/if}
	<Savings totalSavings={10000} paybackTime={5} energySavings={20000} />
	<NavButtons bind:currentPage={$stage} lastPage={6} />
</body>

<style>
	.progressHeader {
		height: 5%;
	}

	.map-view {
		width: 100vw;
		height: 40vh;
	}

	.solar-api {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 90vw;
		margin: 20px 5vw;

		position: relative;
	}

	.modelView {
		overflow-y: hidden;
		background-color: var(--plblue);
		height: 30%;
	}

	.questions {
		overflow-y: hidden;
		background-color: rgb(224, 224, 224);
		height: 45%;
	}
	.savings {
		height: 10%;
		display: flex;
		overflow-y: hidden;
		background-color: chartreuse;
	}

	.footer {
		height: 10%;
		width: 100%;
		position: absolute;
		background-color: aliceblue;
		bottom: 0;
		overflow: hidden;
	}
</style>
