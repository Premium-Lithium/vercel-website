<script lang="ts">
	import Filter from '$lib/components/Filter.svelte';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	//import { selectedFilters } from '$lib/MapStores.js';
	import Map from '$lib/components/Map.svelte';
	import { onMount } from 'svelte';
	let selectedFilters = [];
	let map;
	let filterUpdate;

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
	// Update selectedInstallation when a marker is clicked

	let installations = [
		{
			name: 'House 4',
			address: '86 Poppleton Road, York, YO26 4UP',
			status: 'Project Handover'
		},
		{
			name: 'House 2',
			address: '37 Crossways, York, YO10 5JH',
			status: 'Awaiting Site Survey'
		},
		{
			name: 'House 3',
			address: '18 Malton Avenue, York, YO31 7TT',
			status: 'Site Survey Confirmed'
		},
		{
			name: 'House 1',
			address: '25 Millfield Lane, York, YO10 3AN',
			status: 'Site Survey Completed'
		},
		{
			name: 'House 5',
			address: '83 Newborough Street, York, YO30 7AS',
			status: 'DNO Application'
		},
		{
			name: 'Work 1',
			address: 'Quartz Point, 13 The Stonebow, York YO1 7NP',
			status: 'Pre-Installation'
		},
		{
			name: 'Work 2',
			address: 'Atlas House, York, YO10 3JB',
			status: 'Installation Confirmed'
		}
	];
	let selectedInstallation = installations[0];

	function handleMarkerClick(event) {
		selectedInstallation = event.detail.installation;
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
							<button>left</button>
							<button>right</button>
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
