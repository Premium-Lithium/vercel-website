<script lang="ts">
    

    import LoadableInput from "./LoadableInput.svelte";
    import { queryParam, queryParameters, ssp } from "sveltekit-search-params"

    // declare parameters
    const allParams = queryParameters({
        energyUse: ssp.number(),
        solarEnergy: ssp.number(),
        energyCost: ssp.number(),
        btn1: ssp.boolean(),
        btn2: ssp.boolean(),
        btn3: ssp.boolean(),
        btn4: ssp.boolean()
    });


    const defaults = {
        energyUse: 20,
        solarEnergy: 15,
        energyCost: 0.3
    }
    
    
    
    // proof of concept search params and store function
    // as page renders, params may be called before all elements 
    function getEnergyCost(params) {

        // handle initial errors
        if (params == null) {
            return 0;
        }
        
        console.log(defaults);
        

        
        let use = (params.energyUse == null ? defaults : params).energyUse;
        let solar = (params.solarEnergy == null ? defaults : params).solarEnergy;
        let cost = (params.energyCost == null ? defaults : params).energyCost;
            
        return( (use - solar) * cost);
        
    }

    
    
</script>
<div>
    <!-- Sample components demonstrating how they interact with the store and params-->
    Energy use<LoadableInput type="number" id="energyUse"/>kwh<br>
    Energy cost£<LoadableInput type="number" id="energyCost"/>/kwh<br>
    Solar Energy<LoadableInput type="number" id="solarEnergy"/>kwh<br>
    <!-- sample to show the output of a function that uses  -->
    <p>
        {getEnergyCost($allParams)}
    </p>
    
    <!-- sample buttons-->
    <LoadableInput type="toggle" id="btn1" text="1"/>
    <LoadableInput type="toggle" id="btn2" text="2"/><br>
    <LoadableInput type="toggle" id="btn3" text="3"/>
    <LoadableInput type="toggle" id="btn4" text="4"/>
    <p>
        You have selected:
        {$allParams.btn1===true ? "1" : ""} 
        {$allParams.btn2===true ? "2" : ""} 
        {$allParams.btn3===true ? "3" : ""} 
        {$allParams.btn4===true ? "4" : ""} 
        
    </p>
</div>