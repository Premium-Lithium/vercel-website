<script>
	import TermsOfService from './TermsOfService.svelte';
	import {getBatteryReccomendation} from './reccomendationsModel.js';
	import HomeLightningBolt from "svelte-material-icons/HomeLightningBolt.svelte"
	import SolarPowerVariantOutline from "svelte-material-icons/SolarPowerVariantOutline.svelte";
	import EvStation from "svelte-material-icons/EvStation.svelte";
	import Bird from "svelte-material-icons/Bird.svelte";
	import { earliestInstallMonth, quoteToInstall } from '$lib/services/price-model.js';
    import BatteryCharging90 from "svelte-material-icons/BatteryCharging90.svelte"
	import InstallationDate from './InstallationDate.svelte';
	
	export let solution;
	let earliestInstall = earliestInstallMonth();
	let installationDate = earliestInstall;
	const recommendedBattery = getBatteryReccomendation(solution.usage);
	let selectedBattery = 0;
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
		solution.batterySize_kWh = selectedBattery;
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
	
	<h2>Recommended Products</h2>
	<div class="battery">
		<p>Battery</p>
		<br/>
		<form>
			<label> Recommended: Powerpod {recommendedBattery} kWh
			<input type="radio" class="check-icon" id="recommended" value={recommendedBattery} bind:group={selectedBattery} on:change={batteryChange} />
			<div class={selectedBattery===recommendedBattery ? "checked-div" : "check-div"}>
				<BatteryCharging90 size="30%" color={selectedBattery===recommendedBattery ? "var(--plblue)": "black"}/>
			</div>
		</label>
		<label> Larger: Powerpod {recommendedBattery+5} kWh
			<input type="radio" class="check-icon" id="larger" value={recommendedBattery+5} bind:group={selectedBattery} on:change={batteryChange} />
			<div class={selectedBattery===(recommendedBattery+5) ? "checked-div" : "check-div"}>
				<BatteryCharging90 size="30%" color={selectedBattery===(recommendedBattery+5) ? "var(--plblue)": "black"}/>
			</div>
		</form>
	</div>
	<br/>
	<div class="battery">
			<p>Solar</p>
			<br/>
			<SolarPowerVariantOutline size="20%" color={"var(--plblue)"}/>
			<br/>
			<label for="solar">How many panels would you like:</label>
			<input type="number" id="solar" min=0 max={solution.solar.maxpanels} bind:value={solution.solar.selectedpanels} on:change={solarChange}/> 
	</div>
	<br/>
	<div class="battery">
		<p>Add Ons</p>
		<br/>
		<div class="buttons">
		<label>
			<input class="check-icon" type="checkbox" name="EV charger" bind:checked={ups} on:change={addOnChange}>
				<div class={ups ? "checked-div" : "check-div"}>
					<HomeLightningBolt size="20%" color={ups ? "var(--plblue)": "black"}/>
				</div>
				Upgrade EPS to UPS
		</label>
		<label>
			<input class="check-icon" type="checkbox" name="EV charger" bind:checked={evCharger} on:change={addOnChange}>
				<div class={evCharger ? "checked-div" : "check-div"}>
					<EvStation size="20%" color={evCharger ? "var(--plblue)": "black"}/>
				</div>
				EV charger
		</label>
		</div>
		
		<div class="buttons">
		<label>
		<input class="check-icon" type="checkbox" bind:checked={smartBattery} on:change={addOnChange} />
		<div class={smartBattery ? "checked-div" : "check-div"}>
			<BatteryCharging90 size="20%" color={smartBattery ? "var(--plblue)": "black"}/>
		</div>
		Smart Battery to existing solar array connection
		</label>
		
		<label>
		<input class="check-icon" type="checkbox" bind:checked={birdGuard} on:change={addOnChange} />
		<div class={birdGuard ? "checked-div" : "check-div"}>
			<Bird size="25%" color={birdGuard ? "var(--plblue)": "black"}/>
		</div>
		Bird Guard (Per Solar Panel)
		</label>
	</div>
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
	</ul>
	<InstallationDate bind:installationDate={installationDate} on:change={solarChange}/>
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
		margin-left: 12px;
		overflow: auto;
		align-items: center;
	}

	form{
		display: flex;
		align-items: inline;
	}

	.battery{
		display: flex;
		width:90%;
		height: auto;
		padding: 12px;
		align-items: center;
		text-align: center;
		flex-direction: column;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 5em;
		background-color: rgb(237, 237, 237);
		border-radius: 25px;
	}

	.buttons {
		padding-top: 20px;
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

	.check-icon {
        display: none;
    }
	
</style>


