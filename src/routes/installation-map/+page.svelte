<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	let map;
	let style = 5;
	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

	// Completely necessary function
	function changeStyle() {
		console.log(style);
		style = style % 7;
		style += 1;
	}
	let installations = [
		{ name: 'House 4', address: '86 Poppleton Road, York, YO26 4UP', status: 'Survey' },
		{ name: 'House 2', address: '37 Crossways, York, YO10 5JH', status: 'Survey Confirmed' },
		{ name: 'House 3', address: '18 Malton Avenue, York, YO31 7TT', status: 'Installation' },
        { name: 'House 1', address: '25 Millfield Lane, York, YO10 3AN', status: 'Installed' },
		{
			name: 'Work 1',
			address: 'Quartz Point, 13 The Stonebow, York YO1 7NP',
			status: 'DNO Completed'
		}
	];

</script>

<body>
	<div class="grid-container">
		<div class="grid-item">
			<h1>Installation Map</h1>
			<div class="filter-container">
				<div>Filters</div>
				<div>Installation Date</div>
				<ul>
					<li>
						<input type="checkbox" id="" /><span>Project Handover</span>
					</li>
					<li>
						<input type="checkbox" id="" /><span>Awaiting Site Survey</span>
					</li>
					<li>
						<input type="checkbox" id="" /><span>Site Survey Confirmed</span>
					</li>
					<li>
						<input type="checkbox" id="" /><span>Site Survey Completed</span>
					</li>
					<li>
						<input type="checkbox" id="" /><span>DNO Application</span>
					</li>
					<li>
						<input type="checkbox" id="" /><span>Pre-Installation</span>
					</li>
					<li>
						<input type="checkbox" id="" /><span>Installation Confirmed</span>
					</li>
				</ul>
			</div>
			<div class="details">
				<div>
					<div>Name</div>
					<div>etc</div>
				</div>
			</div>
		</div>
		<div class="grid-item">
			<div class="map-view">
				{#key style}
					<Map
						search={false}
						bind:style
						bind:map
						--border-radius="10px"
						installationArr={installations}
					/>
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
	.filter-container ul {
		list-style: none;
		float: left;
	}
</style>
