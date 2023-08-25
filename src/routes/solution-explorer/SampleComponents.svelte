<script lang="ts">
    import ComponentProps from "./ComponentProps.svelte";
    import { queryParam, queryParameters } from "sveltekit-search-params"


    const allParams = queryParameters();
    

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

    

</script>
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
        You have selected:
        {$allParams.btn1=="true" ? "1" : ""} 
        {$allParams.btn2=="true" ? "2" : ""} 
        {$allParams.btn3=="true" ? "3" : ""} 
        {$allParams.btn4=="true" ? "4" : ""} 
        
    </p>
</div>