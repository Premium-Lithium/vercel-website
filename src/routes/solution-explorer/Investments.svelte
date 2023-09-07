<script>
	import TermsOfService from './TermsOfService.svelte';
	import {getBatteryReccomendation} from './reccomendationsModel.js';
	import { earliestInstallMonth, quoteToInstall } from '$lib/services/price-model.js';
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
	<p>Reccomended Products</p>
		<p>Battery</p>
		<form>
			<input type="radio" bind:group={selectedBattery} value="recommended" on:change={batteryChange}/>
			<label for="recommended"> Powerpod {recommendedBattery} kWh </label>
			<br />
			<input type="radio" bind:group={selectedBattery} value="larger" on:change={batteryChange} />
			<label for="larger"> Powerpod {recommendedBattery+5} kWh  </label>
			<br />
		</form>
			<p>Solar</p>
			<h3>select how many panels you would like:</h3>
			<input
				type="number"
				min=0
				max={solution.solar.maxpanels}
				bind:value={solution.solar.selectedpanels}
				on:change={solarChange}
			/>
</body>

	<!-- <h2>Interested in any add ons?</h2>
	<div class="addOns">
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
</div>
<div>
	<h1>Final price: £{quote.price.total_after_discount}</h1>
	<h1>Payback: 5 years</h1>
	<h1>Savings: 2000kWh</h1>
	<h2>Breakdown</h2>
	{#each quote.price.breakdown as item}
		<li>{item.quantity} {item.name} £{item.price}</li>
	{/each}
	<li>Discount: -£{quote.discount.value}</li> -->
	<div class="helptext">
		These are estimates. We'll arrange a site survey for you for the most accurate information.
	</div>
	<div class="buttons">
		<button> Recieve Your quote in email </button>
		<button> Book meeting with a consultant </button>
		<TermsOfService bind:tosAccepted />
	</div>
<style>
	body {
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
	}

	.buttons {
		align-items: center;
		display: flex;
		flex-direction: row;
		position: relative;
		padding-bottom: 5em;
	}

	button {
		background-color: var(--plblue);
		color: white;
		border: solid #000 1px;
		font-size: 20px;
		height: auto;
		padding: 1rem;
		margin: 30px;
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


