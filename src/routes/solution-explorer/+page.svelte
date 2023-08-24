<script>
    import { ssp, queryParam, queryParameters } from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";


    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import ComponentProps from './ComponentProps.svelte';
	

    const stage = queryParam("stage", ssp.number());
    
    const allParams = queryParameters();
    

    $: total = getEnergyCost();

    // proof of concept search params and store function
    // as page renders, params may be called before all elements 
    function getEnergyCost(params) {

        // handle initial errors
        if (params == null) {
            return 0;
        }
        
        let use = params.energyUse;
        let solar = params.solarEnergy;
        let cost = params.energyCost;
            
        return( (params.energyUse - params.solarEnergy) * params.energyCost);
        
    }
    $: getEnergyCost();
   
</script>

<div>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    solution explorer here
</div>
<div>
    <!-- Sample components demonstrating how they interact with the store and params-->
    Energy use<ComponentProps type="number" id="energyUse"/>kwh<br>
    Energy cost£<ComponentProps type="number" id="energyCost"/>/kwh<br>
    Solar Energy<ComponentProps type="number" id="solarEnergy"/>kwh<br>
    <!-- sample to show the output of a function that uses  -->
    <p>
        {getEnergyCost($allParams)}
    </p>
    
    <!-- sample buttons-->
    <ComponentProps type="toggle" id="btn1" text="1"/>
    <ComponentProps type="toggle" id="btn2" text="2"/><br>
    <ComponentProps type="toggle" id="btn3" text="3"/>
    <ComponentProps type="toggle" id="btn4" text="4"/>
    <p>
        You have clicked buttons
    </p>
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
