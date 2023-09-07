<script lang="ts">
    import { browser } from '$app/environment'; import { ssp, queryParam, queryParameters } from 'sveltekit-search-params';
	import { onMount } from 'svelte';

    import Map from '$lib/components/Map.svelte';
    import Savings from '$lib/components/Savings.svelte';
    import NavButtons from '$lib/components/NavButtons.svelte';
    import Loading from '$lib/components/Loading.svelte';
    import Carousel from '$lib/components/Carousel.svelte';
    import nextSlide from '$lib/components/Carousel.svelte';

    import ModelVisualisation from './ModelVisualisation.svelte';
	import ProgressHeader from './ProgressHeader.svelte';
    import EnergyStage from './EnergyStage.svelte';
    import Investments from './Investments.svelte';
    import SavingsScreen from './SavingsScreen.svelte';
	import SolarApi from './SolarApi.svelte';
	import SolarQuestions from './SolarQuestions.svelte';
    import InstallationDate  from "./InstallationDate.svelte";
    import SavingsBar from "./SavingsExpandBar.svelte";
	import SolarPanelEstimator from "./SolarPanelEstimator.svelte";
	import { SolutionModel } from './solutionModel';

    let map;
    let loadingSolarValues = false;
    let installationDate = new Date().toISOString().slice(0, 7);
	let carouselEnergyStage;

    let carouselSolar;
    let carouselSavings;
    let carouselInvestments;
    let carouselStages = [{ energy: 0 }, { solar: 0 }, { savings: 0 }, { investments: 0 }];
    let termsOfServiceAccepted;
    const stage = queryParam('stage', ssp.number());

    let model = new SolutionModel();
    // let camera = null;
    let solarVisible = true;
    let batteryVisible = true;
    let evVisible = true;

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
      hasSolarYes: ssp.boolean(),
      hasSolarNo: ssp.boolean(),
      wantsSolarYes: ssp.boolean(),
      wantsSolarNo: ssp.boolean(),
      panelsWanted: ssp.number(),
      energyGeneration: ssp.number(),
      // solar stage params
      peakSolarPower: ssp.number(8.8),
      solarLoss: ssp.number(15),
      solarAngle: ssp.number(45),
      solarAzimuth: ssp.number(0),
      installationDate: ssp.string(),
      // savings info
      offPeakTariff: ssp.boolean(false),
      dayTariffRate: ssp.number(0.34),
      nightTariffRate: ssp.number(),
      deliveryMonthOffset: ssp.number(),
      solarTariffRate: ssp.number(),
      solarTariffSEG: ssp.boolean(),  // [true means seg tariff, false means fit
      installMonth: ssp.string()
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
		usage: 5000,
		peopleInHouse: 4,
		wfh: 0,
		postcode: '',
		addOns: { ups: true, evCharger: false, smartBattery: false, birdGuard: false }
	};
</script>

{#if browser}
    <div class="progressHeader">
        <ProgressHeader
            titles={['Energy', 'Solar', 'Savings', 'Investment']}
            bind:selectedIndex={$stage}
        />
    </div>
    <div class="modelView">
        <ModelVisualisation bind:model={model} />
    </div>
    {#if $stage === 0}
    <div class="questions">
        <Carousel bind:this={carouselEnergyStage} bind:currentIndex={carouselStages.energy}>
            <EnergyStage bind:queryParams={$allQueryParameters} />
        </Carousel>
    </div>
    {:else if $stage === 1}
    <div class="questions">
        <Carousel bind:this={carouselEnergyStage}>
            <div>
                <SolarQuestions bind:queryParams={$allQueryParameters} />
            </div>
            <div class="map-view">
                <Map search={true} style="5" bind:map/>
            <SolarPanelEstimator bind:map/>
            </div>
            <div>
                <SolarApi bind:allQueryParameters={$allQueryParameters} bind:loadingSolarValues />
            </div>
        </Carousel>
        </div>
    {/if}
    {#if $stage != 3}
        <div class="savings">
            <SavingsBar params={allQueryParameters}/>
        </div>

    {/if}
	<div class="footer">
        <NavButtons bind:currentPage={$stage} lastPage={3} />
	</div>
{/if}

<style>
    .progressHeader {
        height: 5%;
    }
    body {
        display: flex;
        flex-direction: column;
    }

  .map-view {
    width: 100vw;
    height: 40vh;
  }

  .savings{
    height: 10%;
    width: 100%;
    position: absolute;
    bottom: 10%;
    display: flex;
    overflow-y: visible;
    background-color: chartreuse;
    margin-top: auto;
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
		height: 25%;
	}

	.questions {
		overflow-y: hidden;
    	align-items: center;
    	flex-direction: column;
		height: 45%;
	}

	.footer {
		height: 8%;
		width: 100%;
		position: relative;
		bottom: 0;
		overflow: hidden;
	}
</style>
