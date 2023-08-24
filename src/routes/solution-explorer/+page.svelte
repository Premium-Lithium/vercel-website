<script>
    import { ssp, queryParam, queryParameters } from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
      import { page } from "$app/stores";

    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import ComponentProps from './ComponentProps.svelte';

    const stage = queryParam("stage", ssp.number())
    
    const allParams = queryParameters();
    let use;
    let cost;
    let solar;

    function getEnergyCost() {
        use = $allParams.energyUse;
        cost = $allParams.energyCost;
        solar = $allParams.solarEnergy;
        totalCost = (use - solar) * cost;
        return (use - solar) * cost;
    }
    $: totalCost = getEnergyCost()
   
</script>

<div>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    solution explorer here
</div>
<div>
    Energy use<ComponentProps id="energyUse"/>kwh<br>
    Energy cost£<ComponentProps id="energyCost"/>/kwh<br>
    Solar Energy<ComponentProps id="solarEnergy"/>kwh<br>
    
    <p>
        {getEnergyCost()}
    </p>
    <p>
        {($allParams.energyUse - $allParams.solarEnergy) * $allParams.energyCost}
    </p>
    <button on:click={() => console.log(getEnergyCost())}>test</button>
</div>
    
    <Solution3DView />
    <div class="map-view">
      <Map search={true}/>
    </div>
    <h2> currentPage: {$stage}</h2>
    <NavButtons bind:currentPage={$stage} lastPage={6}/>
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>


<style>
</style>
