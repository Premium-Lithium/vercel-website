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
							<label
								><input
									type="checkbox"
									value={'Project Handover'}
									bind:group={selectedFilters}
								/>Project Handover</label
							>
						</li>
						<li>
							<label>
								<input
									type="checkbox"
									value={'Awaiting Site Survey'}
									bind:group={selectedFilters}
								/>Awaiting Site Survey
							</label>
						</li>
						<li>
							<label>
								<input
									type="checkbox"
									value={'Site Survey Confirmed'}
									bind:group={selectedFilters}
								/>Site Survey Confirmed
							</label>
						</li>
						<li>
							<label>
								<input
									type="checkbox"
									value={'Site Survey Completed'}
									bind:group={selectedFilters}
								/>Site Survey Completed
							</label>
						</li>
						<li>
							<label>
								<input type="checkbox" value={'DNO Application'} bind:group={selectedFilters} />DNO
								Application
							</label>
						</li>
						<li>
							<label>
								<input
									type="checkbox"
									value={'Pre-Installation'}
									bind:group={selectedFilters}
								/>Pre-Installation
							</label>
						</li>
						<li>
							<label
								><input
									type="checkbox"
									value={'Installation Confirmed'}
									bind:group={selectedFilters}
								/>Installation Confirmed</label
							>
						</li>
					</ul>
					<div id="filterButton">
						<button on:click={submitFilter}>Submit Filter</button>
					</div>
				</div>
				
				<div class="details">
					<div class="installation_info">
						<div class="cards">
							<button on:click={prevInstall}>Prev</button>
							<button on:click={nextInstall}>Next</button>
							<li>
								{#if selectedInstallation}Title: {selectedInstallation.name}{/if}
							</li>
							<li>
								{#if selectedInstallation}Phase: {selectedInstallation.status}{/if}
							</li>
							<li>
								{#if selectedInstallation}Address: {selectedInstallation.address}{/if}
							</li>
							<li>
								{#if selectedInstallation}Start Date{selectedInstallation.startDate}{/if}
							</li>
							<li>
								{#if selectedInstallation}ID: {selectedInstallation.id}{/if}
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
		margin: 0;
		padding: 0;
	}
	.map-view {
		height: 100%;
	}
	.grid-container {
		display: grid;
		grid-template-columns: auto 70%;
		background: #091408;
		padding: 0 20px;
	}
	.grid-item {
		height: 100vh;
	}
	.side-container ul {
		list-style: none;
		padding-inline-start: 0;
		width: 100%;
	}
	.cards li {
		list-style: none;
	}
	#styleButton {
		position: absolute;
		top: 25px;
		right: 40px;
	}
</style>
