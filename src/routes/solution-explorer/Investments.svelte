<script>
	import TermsOfService from './TermsOfService.svelte';

	import { earliestInstallMonth, quoteToInstall } from '$lib/services/price-model.js';
	export let solution = {
		houseType: 'detatched',
		solar: { selected: true, minpanels: 0, maxpanels: 20, selectedpanels: 14 },
		battery: true,
		batterySize_kWh: 5,
		evCharger: { selected: true },
		usage: 'unknown',
		peopleInHouse: 4,
		wfh: 0,
		postcode: '',
		addOns: { ups: true, evCharger: false, smartBattery: false, birdGuard: false }
	};
	let earliestInstall = earliestInstallMonth();
	let installationDate = earliestInstall;
	const recommendedBattery = solution.batterySize_kWh;
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

<div class="body">
	<h1>Your Investment</h1>
	{#if solution.battery == true}
		<h2>Which battery would you like ?</h2>
		<form>
			<input
				type="radio"
				bind:group={selectedBattery}
				value="recommended"
				on:change={batteryChange}
			/>
			<label for="recommended"> Recommended battery {recommendedBattery} kWh </label>
			<br />
			<input type="radio" bind:group={selectedBattery} value="smaller" on:change={batteryChange} />
			<label for="smaller"> Smaller battery 5 kWh </label>
			<br />
			<input type="radio" bind:group={selectedBattery} value="larger" on:change={batteryChange} />
			<label for="larger"> Larger battery 20 kWh </label>
			<br />
		</form>
	{/if}
</div>

<div class="body">
	{#if solution.solar.selected == true}
		<div>
			<h2>Solar</h2>
			<h3>
				For your house we recommend between {solution.solar.minpanels} and {solution.solar
					.maxpanels} panels
			</h3>
			<h3>select how many panels you would like:</h3>
			<input
				type="range"
				min={solution.solar.minpanels}
				max={solution.solar.maxpanels}
				bind:value={solution.solar.selectedpanels}
				on:change={solarChange}
			/>
			{solution.solar.selectedpanels} solar panels
		</div>
	{/if}
</div>
<div>
	<h2>Interested in any add ons?</h2>
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
	<li>Discount: -£{quote.discount.value}</li>
	<div class="helptext">
		These are estimates. We'll arrange a site survey for you for the most accurate information.
	</div>
	<div class="buttons">
		<button> Recieve Your quote in email </button>
		<button> Book meeting with a consultant </button>
		<TermsOfService bind:tosAccepted />
	</div>
</div>

<style>
	.body {
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
