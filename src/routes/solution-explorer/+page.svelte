<script>
    import { ssp, queryParam } from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
  
    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import EnergyStage from "./EnergyStage.svelte"
    import SolarStage from "./SolarStage.svelte"

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

    const existingSolar = queryParam("existingsolar", ssp.boolean())
    const numberOfPanels = queryParam("numberofpanels", ssp.number())
    const solarTariff = queryParam("solartariff", ssp.string())

</script>

<!-- todo: arrange in new layout and make responsive -->
<body>
    <ProgressHeader
        titles={["Energy", "Solar", "Savings", "Investment"]}
        selectedIndex={$stage}
    />
    {#if $stage === 0}
        <EnergyStage
            bind:battery={$battery}
            bind:solar={$solar}
            bind:ev={$ev}
            bind:epsups={$epsups}
            bind:energyUsage={$energyUsage}
            bind:isEnergyUsageExact={$isEnergyUsageExact}
            bind:moreWinterUsage={$moreWinterUsage}
            bind:workFromHome={$workFromHome}
            bind:oilAndGas={$oilAndGas}
            bind:highConsumptionDevices={$highConsumptionDevices}
        />
    {:else if $stage === 1}
        <SolarStage
            bind:existingSolar={$existingSolar}
            bind:numberOfPanels={$numberOfPanels}
            bind:solarTariff={$solarTariff}
        />
    {:else}
        <Solution3DView />
        REVIEW
    {/if}
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
    <NavButtons bind:currentPage={$stage} lastPage={6}/>
</body>

