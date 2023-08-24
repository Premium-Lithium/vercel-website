<script>
    import { onMount } from "svelte";
    import { calculateUpfrontCost } from "./priceConfigurator.js";
	export let solution = {houseType: "detatched", solar: true, battery: true, batterySize_kWh: 5, evCharger: {selected: true}, usage: "unknown", peopleInHouse: 4, wfh: 0, postcode: ""};
    let price = [];
    onMount(async () => {
        price = calculateUpfrontCost(solution);
    });

    function sendEmail(){
        //send quote to user 
    }

</script>

<div class=body>
    <h1> Your Investment </h1>
    <h2> Reccommended battery {solution.batterySize_kWh} kWh </h2>
    <h2> Reccomended solar </h2>
    <h3> For your type of house we reccomend between 8 and 12 pannels</h3>
    <h2> Interested in any add ons?</h2>
    

    <h1> Final price: {price[1]}</h1>
    <h1>Payback </h1>
    <h1> Savings</h1>

    <h2> Breakdown of price </h2>

    <button on:click={sendEmail()}> Recieve Your quote in email </button>
    <button> Book meeting with a consultant </button>
    <button> Order Now </button>
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

    }


</style>