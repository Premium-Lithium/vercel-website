<script lang="ts">
	import { ssp, queryParam, queryParameters } from 'sveltekit-search-params';

	import Map from '$lib/components/Map.svelte';
	import Savings from '$lib/components/Savings.svelte';
	import NavButtons from '$lib/components/NavButtons.svelte';
	import Loading from '$lib/components/Loading.svelte';

	import Solution3DView from './Solution3DView.svelte';
	import ProgressHeader from './ProgressHeader.svelte';
	import SampleComponents from './SampleComponents.svelte';
	import EnergyStage from './EnergyStage.svelte';
	import SolarGenerationBreakdown from './SolarGenerationBreakdown.svelte';
	import Investments from './Investments.svelte';
	import SavingsScreen from './SavingsScreen.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import SolarApi from './SolarApi.svelte';

  import { nextPage, prevPage } from '$lib/components/Carousel.svelte';

	const stage = queryParam('stage', ssp.number());
	let map;
	let peakSolarPower = 8.8;
	let solarLoss = 14;
	let solarAngle = 45;
	let solarAzimuth = 0; // 0=south, -90=east, 180=north, 90=west
	let mapboxSearchResult = { latitude: 53.95924825020342, longitude: -1.0772513524147558 };
	let monthlySolarGenerationValues = [];
	let loadingSolarValues = false;
	let carouselEnergyStage;
  let carouselSolar;
	let carouselSavings;
	let carouselInvestments;

	const allQueryParameters = queryParameters({
		battery: ssp.boolean(),
		solar: ssp.boolean(),
		ev: ssp.boolean(),
		epsups: ssp.boolean(),
		energyUsage: ssp.number(),
		isEnergyUsageExact: ssp.boolean(),
		moreWinterUsage: ssp.boolean(),
		workFromHome: ssp.boolean(),
		oilAndGas: ssp.boolean(),
		highConsumptionDevices: ssp.boolean()
	});

	let termsOfServiceAccepted;

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
	<ProgressHeader
		titles={['Energy', 'Solar', 'Savings', 'Investment']}
		bind:selectedIndex={$stage}
	/>
	{#if $stage === 0}
		<!-- Todo 
      fix checkboxes from changing slides - maybe detach them from queryParams?
      make look good -->
		{#key $allQueryParameters}
			<Carousel bind:carouselEnergyStage>
				<EnergyStage bind:queryParams={$allQueryParameters} />
			</Carousel>
		{/key}

	{:else if $stage === 1}
		<div class="map-view">
			<Map search={true} style="5" bind:map bind:searchResult={mapboxSearchResult} />
		</div>
		{#key loadingSolarValues}
			<!-- Todo make look not bad -->
			<Carousel bind:carouselSolar>
        {#if (loadingSolarValues)}
          {carouselEnergyStage.nextPage()}
        {/if}
				<SolarApi />
			</Carousel>
		{/key}

	{:else if $stage === 2}
		{#key $allQueryParameters}
    <!-- Todo make better looking -->
			<Carousel bind:carouselSavings>
				<SavingsScreen />
			</Carousel>
		{/key}

	{:else if $stage === 3}
		{#key $allQueryParameters}
			<!-- Todo make less bad looking -->
			<Carousel bind:carouselInvestments>
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
</style>
