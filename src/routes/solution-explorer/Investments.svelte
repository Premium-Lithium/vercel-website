<script>
	import TermsOfService from './TermsOfService.svelte';
	import BatteryChargingOutline from "svelte-material-icons/BatteryChargingOutline.svelte"
	import {getBatteryReccomendation} from './reccomendationsModel.js';
	import SolarPowerVariantOutline from "svelte-material-icons/SolarPowerVariantOutline.svelte";
	import { earliestInstallMonth, quoteToInstall } from '$lib/services/price-model.js';
	import BatteryCharging10 from "svelte-material-icons/BatteryCharging10.svelte"
    import BatteryCharging50 from "svelte-material-icons/BatteryCharging50.svelte"
    import BatteryCharging90 from "svelte-material-icons/BatteryCharging90.svelte"
	import InstallationDate from './InstallationDate.svelte';
	export let solution = {
		houseType: 'detatched',
		solar: { selected: true, minpanels: 0, maxpanels: 20, selectedpanels: 14 },
		battery: true,
		batterySize_kWh: 5,
		evCharger: { selected: true },
		usage: 3,
		peopleInHouse: 4,
		wfh: 0,
		postcode: '',
		addOns: { ups: true, evCharger: false, smartBattery: false, birdGuard: false }
	};
	let earliestInstall = earliestInstallMonth();
	let installationDate = earliestInstall;
	const recommendedBattery = getBatteryReccomendation(solution.usage);
	let selectedBattery = 'recommended';
	let ups = true;
	let evCharger = false;
	let smartBattery = false;
	let birdGuard = false;
	let quote = quoteToInstall(solution, installationDate);

	let tosAccepted = false;

	function addOnChange() {
		solution.addOns.ups = ups;
		solution.addOns.evCharger = evCharger;
		solution.addOns.smartBattery = smartBattery;
		solution.addOns.birdGuard = birdGuard;
		quote = quoteToInstall(solution, installationDate);
	}

	function batteryChange() {
		if (selectedBattery == 'recommended') {
			solution.batterySize_kWh = recommendedBattery;
		} else if (selectedBattery == 'smaller') {
			solution.batterySize_kWh = 5;
		} else {
			solution.batterySize_kWh = 20;
		}
		quote = quoteToInstall(solution, installationDate);
	}

	function solarChange() {
		quote = quoteToInstall(solution, installationDate);
	}

	function order() {
		alert('order button clicked');
	}
</script>

<body>
	
	<h1>Recomended Products</h1>
	<div class="battery">
		<p>Battery</p>
		<br/>
		<form>
			<BatteryCharging90 size="20%" color={solution.batterySize_kWh===recommendedBattery ? "var(--plblue)": "black"} />
			<input type="radio" id="recommended" value={recommendedBattery} bind:group={selectedBattery} on:change={batteryChange} />
			<label for="recommended"> Powerpod {recommendedBattery} kWh </label>
			<br/>
			<BatteryCharging90 size="20%" color={solution.batterySize_kWh===recommendedBattery+5 ? "var(--plblue)": "black"}/>
			<input type="radio" id="larger" value={recommendedBattery+5} bind:group={selectedBattery} on:change={batteryChange} />
			<label for="larger"> Powerpod {recommendedBattery+5} kWh  </label>
		</form>
	</div>
	<br/>
	<div class="solar">
			<p>Solar</p>
			<br/>
			<SolarPowerVariantOutline size="20%" color={"var(--plblue)"}/>
			<br/>
			<label for="solar">select how many panels you would like:</label>
			<input type="number" id="solar" min=0 max={solution.solar.maxpanels} bind:value={solution.solar.selectedpanels} on:change={solarChange}/> 
	</div>
	<br/>
	<div class="addOns">
		<p>Add Ons</p>
		<br/>
		<input type="checkbox" bind:checked={ups} on:change={addOnChange} />
		<label for="ups"> Upgrade of EPS to UPS</label>
		<br />
		<input type="checkbox" bind:checked={evCharger} on:change={addOnChange} />
		<label for="evCharger"> EV Charger</label>
		<br />
		<input type="checkbox" bind:checked={smartBattery} on:change={addOnChange} />
		<label for="smartBattery"> Smart battery to existing solar array connection</label>
		<br />
		<input type="checkbox" bind:checked={birdGuard} on:change={addOnChange} />
		<label for="birdGuard"> Bird Guard (Per Solar Pannel)</label>
		<br />
	</div>
<div>
	<h1>Final price: £{quote.price.total_after_discount}</h1>
	<p>Payback: 5 years</p>
	<p>Savings: 2000kWh</p>
	<p>Breakdown:</p>
	<ul>
	{#each quote.price.breakdown as item}
		<li>{item.quantity} {item.name} £{item.price}</li>
	{/each}
	<li>Discount: -£{quote.discount.value}</li>
	<InstallationDate installationDate={earliestInstall}/>
	</ul>
	<div class="helptext">
		These are estimates. We'll arrange a site survey for you for the most accurate information.
	</div>
	<div class="buttons">
		<button> Recieve Your quote in email </button>
		<button> Book meeting with a consultant </button>
	</div>
	<TermsOfService bind:tosAccepted />
</body>

<style>
	body {
		margin: 12px;
	}


	.battery{
		padding: 12px;
		flex-direction: row;
		position: relative;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 5em;
		background-color: rgb(237, 237, 237);
		border-radius: 25px;
	}

	.solar{
		padding: 12px;
		flex-direction: row;
		position: relative;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 5em;
		background-color: rgb(237, 237, 237);
		border-radius: 25px;
	}

	.addOns{
		padding: 12px;
		flex-direction: row;
		position: relative;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 5em;
		background-color: rgb(237, 237, 237);
		border-radius: 25px;
	}

	.buttons {
		display: flex;
		flex-direction: row;
		position: relative;
	}

	button {
		background-color: var(--plblue);
		color: white;
		text-align: center;
		border: solid #000 1px;
		font-size: 20px;
		height: auto;
		padding: 1rem;
		margin: 10px;
		border-radius: 5px;
	}

	input {
		align-items: center;
		accent-color: var(--plblue);
	}

	.helptext {
		margin: 1rem;
		color: var(--plblue);
	}
</style>


