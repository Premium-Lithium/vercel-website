<script>
    import { onMount } from "svelte";
    import { calculateUpfrontCost } from "./priceConfigurator.js";
	export let solution = {houseType: "detatched", solar: {selected: true, minPannels: 0, maxPannels:20, selectedPannels: 0}, battery: true, batterySize_kWh: 5, evCharger: {selected: true}, usage: "unknown", peopleInHouse: 4, wfh: 0, postcode: ""};
    let price = [0,0];
    onMount(async () => {
        price = calculateUpfrontCost(solution);
    });
    let ups=true;

</script>

<div class=body>
    <h1> Your Investment </h1>
    {#if solution.battery == true}
        <h2> Which battery would you like ?</h2>
        <form>
            <input type="radio" id="reccomended" name="battery" value="reccomended">
            <label for="reccomended"> Reccommended battery {solution.batterySize_kWh} kWh </label>
            <input type="radio" id="smaller" name="battery" value="smaller">
            <label for="smaller"> Smaller battery {solution.batterySize_kWh-2} kWh </label>
            <input type="radio" id="larger" name="battery" value="larger">
            <label for="larger"> Larger battery {solution.batterySize_kWh+2} kWh </label>
        </form>
    {/if}
    {#if solution.solar.selected == true}
        <h2> Reccomended solar </h2>
        <h3> For your type of house we reccomend between {solution.solar.minPannels} and {solution.solar.maxPannels} pannels</h3>
        <h3> select how many pannels you would like: </h3>
        <input
            type="range"
            min={solution.solar.minPannels}
            max={solution.solar.maxPannels}
            bind:value={solution.solar.selectedPannels}
            on:change={calculateUpfrontCost}
        />
    {/if}
    <h2> Interested in any add ons?</h2>
    <input type="checkbox" id="ups" name="ups" bind:checked={ups}>
    <label for="ups"> ups</label><br>


    <h1> Final price: {price[0]}</h1>
    <h1>Payback </h1>
    <h1> Savings</h1>

    <h2> Breakdown of price </h2>
    <h3> Price of {solution.batterySize_kWh} kWh battery: </h3>
    <h3> Price of {solution.solar.selectedPannels} solar pannels: </h3>
    <h3> Discount: </h3>
    <div class=buttons>
        <button> Recieve Your quote in email </button>
        <button> Book meeting with a consultant </button>
        <button> Order Now </button>
    </div>
</div>

<style>
    .body{
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
    }

    button{
        background-color: var(--plblue);
        color: white;
        border: none; 
        font-size: 20px;
        height:auto; 
        width:200px; 
        padding:10px 5px; 
        margin:30px; 
        border-radius:5px;
        display: flex;
        align-items: center;
        justify-content: center;    
    }


</style>