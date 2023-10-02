<script lang="ts">
	import Filter from '$lib/components/Filter.svelte';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	//import { selectedFilters } from '$lib/MapStores.js';
	import Map from '$lib/components/Map.svelte';
	import { onMount } from 'svelte';
	let selectedFilters = [];
	let map;
	let filterUpdate;
	let installations = [];

	// Input test data
	onMount(async () => {
		getInstallationData();
	});

	let selectedInstallation = installations[0];

	let sdk;
    onMount(async () => {
        sdk = await new AppExtensionsSDK().initialize();
        await sdk.execute('resize', { height: 700, width: 800 });
    });

	let sdk;
    onMount(async () => {
        sdk = await new AppExtensionsSDK().initialize();
        await sdk.execute('resize', { height: 700, width: 800 });
    });

	let style = 5;
	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

	// Completely necessary function
	function changeStyle() {
		style = style % 7;
		style += 1;
	}

	// Just for use in the key to reload the map
	function submitFilter() {
		filterUpdate = !filterUpdate;
	}
	function nextInstall() {
		let currInstall = installations.indexOf(selectedInstallation);
		selectedInstallation = installations[(currInstall + 1) % installations.length];
	}

	function prevInstall() {
		let currInstall = installations.indexOf(selectedInstallation);
		// Horrible calculation because js cant mod properly: ((value % max) + max) % max
		selectedInstallation =
			installations[
				(((currInstall - 1) % installations.length) + installations.length) % installations.length
			];
	}

	function handleMarkerClick(event) {
		selectedInstallation = event.detail.installation;
	}

	// Reading from a csv file for now TODO read from deals once they are converted from projects and then remove projects.csv
	async function getInstallationData() {
		const file = 'src/routes/installation-map/projects.csv';

		const res = await fetch(file);
		const data = await res.text();

		const lines = data.split('\n');

		// Construct installation object
		// Title 1, Status 3, startDate 5, endDate 7, address 9, id 11, createdDate 13
		for (let line = 2; line < lines.length; line++) {
			let row = lines[line].split('"');
			// Only create object if address available
			if (row[9].length > 0 ) {
				let install = {
					name: row[1],
					status: row[3],
					address: row[9],
					startDate: row[5],
					endDate: row[7],
					id: row[11],
					createdDate: row[13]
				}
				installations.push(install);
			}
		}
	}
</script>

<body>
	<div class="grid-container">
		<div class="grid-item">
			<h1>Installation Map</h1>
			<div class="side-container">
				<div class="filters">
					<div>Filters</div>
					<div>Installation Date</div>
					<ul>
						<li>
							<input type="checkbox" value={'Project Handover'} bind:group={selectedFilters} /><span
								>Project Handover</span
							>
						</li>
						<li>
							<input
								type="checkbox"
								value={'Awaiting Site Survey'}
								bind:group={selectedFilters}
							/><span>Awaiting Site Survey</span>
						</li>
						<li>
							<input
								type="checkbox"
								value={'Site Survey Confirmed'}
								bind:group={selectedFilters}
							/><span>Site Survey Confirmed</span>
						</li>
						<li>
							<input
								type="checkbox"
								value={'Site Survey Completed'}
								bind:group={selectedFilters}
							/><span>Site Survey Completed</span>
						</li>
						<li>
							<input type="checkbox" value={'DNO Application'} bind:group={selectedFilters} /><span
								>DNO Application</span
							>
						</li>
						<li>
							<input type="checkbox" value={'Pre-Installation'} bind:group={selectedFilters} /><span
								>Pre-Installation</span
							>
						</li>
						<li>
							<input
								type="checkbox"
								value={'Installation Confirmed'}
								bind:group={selectedFilters}
							/><span>Installation Confirmed</span>
						</li>
					</ul>
				</div>
				<div id="filterButton">
					<button on:click={submitFilter}>Submit Filter</button>
				</div>

				<div class="details">
					<div class="installation_info">
						<div class="cards">
							<button on:click={prevInstall}>Prev</button>
							<button on:click={nextInstall}>Next</button>
							<li>
								{#if selectedInstallation}{selectedInstallation.name}{/if}
							</li>
							<li>
								{#if selectedInstallation}{selectedInstallation.status}{/if}
							</li>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="grid-item">
			<div class="map-view">
				{#key style}
					{#key filterUpdate}
						<Map
							search={false}
							bind:style
							bind:map
							--border-radius="10px"
							installationArr={installations}
							filtersArr={selectedFilters}
							on:markerClick={handleMarkerClick}
						/>
					{/key}
				{/key}
			</div>
			<div id="styleButton">
				<button on:click={changeStyle}>Change Style</button>
			</div>
		</div>
	</div>
</body>

<style>
	body {
		color: #fff;
	}
	.map-view {
		width: 100%;
		height: 80vh;
	}
	.grid-container {
		display: grid;
		grid-template-columns: auto 70%;
	}
	.grid-item {
		background: #091408;
		padding: 20px;
		height: 100vh;
	}
	.side-container ul {
		list-style: none;
	}
	.cards li {
		list-style: none;
	}
</style>
