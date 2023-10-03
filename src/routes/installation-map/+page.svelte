<script lang="ts">
	import Filter from '$lib/components/Filter.svelte';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	import { createEventDispatcher } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	//import { selectedFilters } from '$lib/MapStores.js';
	import Map from '$lib/components/Map.svelte';
	import { onMount } from 'svelte';
	let selectedFilters = [];
	let map;
	let filterUpdate;

	let directionsArr = [
		[0.47469, 51.71796],
		[-1.113156, 53.96058]
	];

	let selectedInstallation = null;

	let sdk;
	let projectsData = [];
	let installations: Array<Installation> = [];
	let style = 5;
	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

	function submitFilter() {
		filterUpdate = !filterUpdate;
	}
	function nextInstall() {
		let currInstall = installations.indexOf(selectedInstallation);
		selectedInstallation = installations[(currInstall + 1) % installations.length];
		let selectedId = selectedInstallation.id;
		console.log(selectedId);
		//dispatch('click', { selectedInstallation });
		//let markerElement = getMarkerElementById(selectedId).click()
		//console.log(markerElement);
	}

	function prevInstall() {
		let currInstall = installations.indexOf(selectedInstallation);
		// Horrible calculation because js cant mod properly: ((value % max) + max) % max
		selectedInstallation =
			installations[
				(((currInstall - 1) % installations.length) + installations.length) % installations.length
			];
		let selectedId = selectedInstallation.id;
		console.log(selectedId);
		//dispatch('click',{ selectedInstallation });
		//let markerElement = getMarkerElementById(selectedId).click()
		//console.log(markerElement);
	}

	// Completely necessary function
	function changeStyle() {
		style = style % 7;
		style += 1;
	}

	onMount(() => {
		//sdk = await new AppExtensionsSDK().initialize();
		//await sdk.execute('resize', { height: 700, width: 800 });

		const statusColors = {
			'Project Handover': 'orange',
			'Awaiting Site Survey': 'yellow',
			'Site Survey Confirmed': 'blue',
			'Site Survey Completed': 'black',
			'DNO Application': 'green',
			'Pre-Installation': 'red',
			'Installation Confirmed': 'purple',
			'Installation Complete': 'cyan'
		};
		class Installation {
			name: String;
			status: String;
			marker: mapboxgl.Marker;
			address: String;
			lat: Number;
			lon: Number;
			hidden: Boolean;
			startDate: String;
			endDate: String;
			id: Number;
			createdDate: String;
			// Other values ie timeframe etc.
			constructor(
				name: String,
				status: String,
				address: String,
				lat: Number,
				lon: Number,
				startDate: String,
				endDate: String,
				id: Number,
				createdDate: String
			) {
				this.name = name;
				this.status = status;
				this.marker = new mapboxgl.Marker({
					color: statusColors[status],
					draggable: false
				}).setLngLat([lon, lat]);
				this.address = address;
				this.lat = lat;
				this.lon = lon;
				if (selectedFilters.includes(this.status)) {
					this.hidden = false;
				} else {
					this.hidden = true;
				}
				this.startDate = startDate;
				this.endDate = endDate;
				this.id = id;
				this.createdDate = createdDate;
			}
		}

		function getMarkerElementById(selectedId) {
			const markerList = document.querySelectorAll('[aria-label="Map marker"]');
			for (const marker of markerList) {
				if (marker.id === selectedId) {
					return marker;
				}
			}
		}

		// Just for use in the key to reload the map

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
				if (row[9].length > 0) {
					let install = {
						name: row[1],
						status: row[3],
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

		// Creates an array of MapMarker objects from an array of inputs
		async function createMarkers() {
			for (let i in projectsData) {
				let lonLat = await fetchLonLatFromAddress(projectsData[i].address);
				let install = new Installation(
					projectsData[i].name,
					projectsData[i].status,
					projectsData[i].address,
					lonLat[1],
					lonLat[0],
					projectsData[i].startDate,
					projectsData[i].endDate,
					projectsData[i].id,
					projectsData[i].createdDate
				);
				installations.push(install);
			}
			addMarkers(installations);
		}

		// Adds markers from an array of locations (Markers)
		function addMarkers(installations) {
			for (let i in installations) {
				if (!installations[i].hidden) {
					let popup = new mapboxgl.Popup({ className: 'pin-popup' })
						.setLngLat([installations[i].lon, installations[i].lat])
						.setHTML(
							'<style>.pin-popup .mapboxgl-popup-content { background-color: #091408;}</style>' +
								'Title: ' +
								installations[i].name +
								'<br>' +
								'Phase: ' +
								installations[i].status +
								'<br>' +
								'Address: ' +
								installations[i].address +
								'<br>' +
								'Start Date: ' +
								installations[i].startDate
						);
					installations[i].marker.setPopup(popup).addTo(map);
					// Add an event listener for the click event
					installations[i].marker.getElement().addEventListener('click', () => {
						handleMarkerClick(installations[i]);
					});
					installations[i].marker.getElement().style.cursor = 'pointer';
					installations[i].marker.getElement().id = installations[i].id;
				}
			}
		}

		async function fetchLonLatFromAddress(address) {
			console.log(address);
			const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${API_TOKEN}`;
			try {
				const geocodingResponse = await fetch(endpoint);
				if (geocodingResponse.ok) {
					const data = await geocodingResponse.json();
					const lonLat = [
						data.features[0].geometry.coordinates[0],
						data.features[0].geometry.coordinates[1]
					];
					return lonLat;
				} else {
					console.error('Bad Response');
				}
			} catch (error) {
				console.error('Bad Catch');
			}
		}

		map.on('load', async () => {
			getInstallationData(); // Input test data
			createMarkers(); //Create markers from data

		});
	});
</script>

<body>
	<div class="grid-container">
		<div class="grid-item">
			<h1>Installation Map</h1>
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
					<div class="installation_info">
						<div class="cards">
							<button on:click={prevInstall}>Prev</button>
							<button on:click={nextInstall}>Next</button>
							<h2>
								{#if selectedInstallation}Installation Info{/if}
							</h2>
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
								{#if selectedInstallation}Start Date: {selectedInstallation.startDate}{/if}
							</li>
							<li>
								{#if selectedInstallation}ID: {selectedInstallation.id}{/if}
							</li>
						</div>
					</div>
				</div>
				<div class="navigation" />
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
							installationArr={projectsData}
							filtersArr={selectedFilters}
							{directionsArr}
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
