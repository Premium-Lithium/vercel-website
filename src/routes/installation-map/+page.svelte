<script lang="ts">
	import Filter from '$lib/components/Filter.svelte';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	//import { selectedFilters } from '$lib/MapStores.js';
	import Map from '$lib/components/Map.svelte';
	import { onMount } from 'svelte';
	import { installationStores, currentInstallation, selectedInstallation, navigateMarkers} from '$lib/MapStores';
	let selectedFilters = [];
	let map;
	let filterUpdate;
	let projectsData = [];
	let navigateUpdate;

	let sdk;
	let visibleInstallationsCount = 0;

  	// Create a reactive statement that updates the count whenever $installationStores changes
	$: {
		let visibleInstallations = $installationStores.filter(installation => !installation.hidden);
		visibleInstallationsCount = visibleInstallations.length;
	}
	// Input test data
	onMount(async () => {
		getInstallationData();
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
		// Removes current popup from the map before toggling the next one
		$currentInstallation.marker._popup.remove()
		let filteredInstallations = $installationStores.filter((obj) => {
			return selectedFilters.includes(obj.status);
		});
		let currInstall = $installationStores.indexOf($currentInstallation);
		
		currentInstallation.set(filteredInstallations[(currInstall + 1) % filteredInstallations.length]);
		$currentInstallation.marker.togglePopup()
	}

	function prevInstall() {
		$currentInstallation.marker._popup.remove()
		let filteredInstallations = $installationStores.filter((obj) => {
			return selectedFilters.includes(obj.status);
		});
		let currInstall = $installationStores.indexOf($currentInstallation);

		// Horrible calculation because js cant mod properly: ((value % max) + max) % max
		currentInstallation.set(
			filteredInstallations[
				(((currInstall - 1) % filteredInstallations.length) + filteredInstallations.length) %
				filteredInstallations.length
			] 
		);
		$currentInstallation.marker.togglePopup()
	}

	function handleMarkerClick(event) {
		//currentInstallation = event.detail.installation;
		return 0;
	}

	function handleNavigate(){
		selectedInstallation.set([]) // set selected back to empty
		navigateMarkers.set(true);
	}
	function handleDone(){
		navigateUpdate = !navigateUpdate;
		//navigateMarkers.set(false);
	}
	function handleClear(){
		selectedInstallation.set([]);
		navigateUpdate = ! navigateUpdate
	}

	// Reading from a csv file for now TODO read from deals once they are converted from projects and then remove projects.csv
	async function getInstallationData() {
		const file = './projects.csv'; //Projects.csv moved to static folder

		const res = await fetch(file);
		const data = await res.text();

		const lines = data.split('\n');

		// Construct installation object
		// Title 1, Status 3, startDate 5, endDate 7, address 9, id 11, createdDate 13
		for (let line = 2; line < lines.length; line++) {
			let row = lines[line].split('"');
			// Only create object if address available
			if (row[9].length > 0) {
				let install = {
					name: row[1],
					status: row[3].replace(/\s+/g, ' '),  // Replace multiple spaces with a single space,
					address: row[9],
					startDate: row[5],
					endDate: row[7],
					id: row[11],
					createdDate: row[13]
				};
				projectsData.push(install);
			}
		}
	}
</script>

<body>
	<div class="grid-container">
		<div class="grid-item">
			<h1>Installation Map</h1>
			{#if visibleInstallationsCount > 0}
				<p>{visibleInstallationsCount} results</p>
			{/if}
			<div class="side-container">
				<div class="filters">
					<h2>Filters</h2>
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
						<li>
							<label
								><input
									type="checkbox"
									value={'Installation Complete'}
									bind:group={selectedFilters}
								/>Installation Complete</label
							>
						</li>
					</ul>
					<div id="filterButton">
						<button on:click={submitFilter}>Submit Filter</button>
					</div>
				</div>
				<div class="details">
					<div class="navigation">
						<!--{$navigateMarkers}-->
						<button on:click={handleNavigate}> Navigate </button>
						<button on:click={handleDone}> Done </button>
						<button on:click={handleClear}> Clear </button>
					</div>
					<div class="installation_info">
						{#if $currentInstallation}
							<div class="cards">							
								<h2>Installation Info</h2>
								<button on:click={prevInstall}>Prev</button>
								<button on:click={nextInstall}>Next</button>
								<li>
									Title: {$currentInstallation.name}
								</li>
								<li>
									Phase: {$currentInstallation.status}
								</li>
								<li>
									Address: {$currentInstallation.address}
								</li>
								<li>
									Start Date: {$currentInstallation.startDate}
								</li>
								<li>
									ID: {$currentInstallation.id}
								</li>
							</div>
						{/if}
					</div>
					
					
				</div>
			</div>
		</div>
		<div class="grid-item">
			<div class="map-view">
				{#key style}
					{#key filterUpdate}
						{#key navigateUpdate}
							<Map
								search={false}
								bind:style
								bind:map
								--border-radius="10px"
								projectsArr={projectsData}
								filtersArr={selectedFilters}
							/>
						{/key}
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
