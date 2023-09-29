<script lang="ts">
	//import { selectedFilters } from '$lib/MapStores.js';
	import Map from '$lib/components/Map.svelte';
	import { onMount } from 'svelte';
	let selectedFilters = [];
	let map;

	let style = 5;
	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

	// Completely necessary function
	function changeStyle() {
		style = style % 7;
		style += 1;
	}
	let installations = [
		{ name: 'House 4', address: '86 Poppleton Road, York, YO26 4UP', status: 'Project Handover' },
		{ name: 'House 2', address: '37 Crossways, York, YO10 5JH', status: 'Awaiting Site Survey' },
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
		{ name: 'House 5', address: '83 Newborough Street, York, YO30 7AS', status: 'DNO Application' },
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
</script>

<body>
	<div class="grid-container">
		<div class="grid-item">
			<h1>Installation Map</h1>
			<div class="side-container">
				<div class="filters">
					<p>{selectedFilters}</p>
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

				<div class="details">
					<div class="installation_info">
						<div class="cards">
							<button>left</button>
							<button>right</button>
							<li>{selectedInstallation.name}</li>
							<li>{selectedInstallation.status}</li>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="grid-item">
			<div class="map-view">
				{#key style}
					{#key selectedFilters}
						<Map
							search={false}
							bind:style
							bind:map
							--border-radius="10px"
							installationArr={installations}
							filtersArr={selectedFilters}
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
