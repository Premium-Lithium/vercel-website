<script lang="ts">
    import { ssp, queryParam, queryParameters} from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
  
    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import EnergyStage from "./EnergyStage.svelte"
    import SolarStage from "./SolarStage.svelte"
    import SampleComponents from "./SampleComponents.svelte"
    import Investments from "./Investments.svelte";
    import SavingsScreen from "./SavingsScreen.svelte";

    let termsOfServiceAccepted;

    const stage = queryParam("stage", ssp.number())
    const battery = queryParam("battery", ssp.boolean())
    const solar = queryParam("solar", ssp.boolean())
    const ev = queryParam("ev", ssp.boolean())
    const epsups = queryParam("epsups", ssp.boolean())
    const energyUsage = queryParam("energyusage", ssp.number())
    const isEnergyUsageExact = queryParam("isenergyusageexact", ssp.boolean())
    const moreWinterUsage = queryParam("morewinterusage", ssp.boolean())
    const workFromHome = queryParam("workfromhome", ssp.boolean())
    const oilAndGas = queryParam("oilandgas", ssp.boolean())
    const highConsumptionDevices = queryParam("highconsumptiondevices", ssp.boolean())



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
        existingSolar: ssp.boolean(),
        numberOfPanels: ssp.number(),
        solarTarrif: ssp.string(),
        solarLocation: ssp.string(),
    });

    let termsOfServiceAccepted;


    const solution = {houseType: "detatched", solar: {selected: true, minPannels: 0, maxPannels:20, selectedPannels: 0}, battery: true, batterySize_kWh: 5, evCharger: {selected: true}, usage: "unknown", peopleInHouse: 4, wfh: 0, postcode: "",  addOns: {ups: true, evCharger: false, smartBattery: false, birdGuard: false}};
</script>  

<body>
    <ProgressHeader
        titles={["Energy", "Solar", "Savings", "Investment"]}
        bind:selectedIndex={$stage}
    />
    {#if $stage === 0}
        <EnergyStage
            bind:queryParams={$allQueryParameters}
           
        />
    {:else if $stage === 1}
        <SolarStage
            bind:existingSolar={$existingSolar}
            bind:numberOfPanels={$numberOfPanels}
            bind:solarTariff={$solarTariff}
            bind:solarLocation={$solarLocation}
        />
    {:else if $stage === 2}
        <SavingsScreen/>
    {:else if $stage === 4}
        <Investments solution={solution}/>  
    {:else}
        <Solution3DView />
        REVIEW
    {/if}
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
    <NavButtons bind:currentPage={$stage} lastPage={6}/>
</body>

