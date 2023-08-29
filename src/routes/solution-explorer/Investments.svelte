<script>
    import { earliestInstallMonth, quoteToInstall } from "$lib/services/price-model.js"
	export let solution = {houseType: "detatched", solar: {selected: true, minPannels: 0, maxPannels:20, selectedPannels: 0}, 
                            battery: true, batterySize_kWh: 5, evCharger: {selected: true}, 
                            usage: "unknown", peopleInHouse: 4, wfh: 0, postcode: "", 
                            addOns: {ups: true, evCharger: false, smartBattery: false, birdGuard: false},
                        };

    let earliestInstall = earliestInstallMonth();
    let installationDate = earliestInstall;
    const reccomendedBattery = solution.batterySize_kWh; 
    let selectedBattery = "reccomended";
    let ups = true;
    let evCharger = false;
    let smartBattery = false;
    let birdGuard = false;
    let quote = quoteToInstall(solution, installationDate);

    function addOnChange(){
        solution.addOns.ups = ups;
        solution.addOns.evCharger = evCharger;
        solution.addOns.smartBattery = smartBattery;
        solution.addOns.birdGuard = birdGuard;
        quote  = quoteToInstall(solution, installationDate);
    }

    function batteryChange(){
        console.log(selectedBattery);
        if (selectedBattery == "reccomended"){
            solution.batterySize_kWh = reccomendedBattery;
        }else if (selectedBattery == "smaller"){
            solution.batterySize_kWh = 5;
        }else{
            solution.batterySize_kWh = 20;
        }
        quote = quoteToInstall(solution, installationDate);
    }

    function solarChange(){
        quote = quoteToInstall(solution, installationDate);
    }

</script>

<div class=body>
    <h1> Your Investment </h1>
    {#if solution.battery == true}
        <h2> Which battery would you like ?</h2>
        <form>
            <input type="radio" bind:group={selectedBattery} value="recommended" on:change={batteryChange}>
            <label for="reccomended"> Reccommended battery {reccomendedBattery} kWh </label>
            <br>
            <input type="radio" bind:group={selectedBattery} value="smaller" on:change={batteryChange}>
            <label for="smaller"> Smaller battery 5 kWh </label>
            <br>
            <input type="radio" bind:group={selectedBattery} value="larger" on:change={batteryChange}>
            <label for="larger"> Larger battery 20 kWh </label>
            <br>
        </form>
    {/if}

    {#if solution.solar.selected == true}
        <h2> Solar </h2>
        <h3> For your type of house we reccomend between {solution.solar.minPannels} and {solution.solar.maxPannels} pannels</h3>
        <h3> select how many pannels you would like: </h3>
        <input
            type="range"
            min={solution.solar.minPannels}
            max={solution.solar.maxPannels}
            bind:value={solution.solar.selectedPannels}
            on:change={solarChange}
        />
    {/if}
    <h2> Interested in any add ons?</h2>
    <div class="addOns">
        <input type="checkbox" bind:checked={ups} on:change={addOnChange}>
        <label for="ups"> Upgrade of EPS to UPS</label>
        <br>
        <input type="checkbox" bind:checked={evCharger} on:change={addOnChange}>
        <label for="evCharger"> EV Charger</label>
        <br>
        <input type="checkbox" bind:checked={smartBattery} on:change={addOnChange}>
        <label for="smartBattery"> Smart battery to existing solar array connection</label>
        <br>
        <input type="checkbox" bind:checked={birdGuard} on:change={addOnChange}>
        <label for="birdGuard"> Bird Guard (Per Solar Pannel)</label>
        <br>
    </div>

    <h1> Final price: £{quote.price.total_after_discount}</h1>
    <h1>Payback: 5 years </h1>
    <h1> Savings: 2000kWh </h1>

    <h2> Breakdown of price </h2>
    {#each quote.price.breakdown as item}
        <li> {item.quantity} {item.name} £{item.price} </li>
    {/each}
    <li> Discount: -£{quote.discount.value} </li>
    <div class="helptext"> These are estimates. We'll arrange a site survey for you for the most accurate information.</div>
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

    .buttons{
        align-items: center;
    }

    button{
        background-color: var(--plblue);
        color: white;
        border:solid #000 1px; 
        font-size: 20px;
        height:auto; 
        padding: 1rem; 
        margin:30px; 
        border-radius:5px;
    }


    input{
        align-items: center;
        accent-color: var(--plblue);
    }

    .helptext {
        margin: 1rem;
        color: var(--plblue);
    }


</style>