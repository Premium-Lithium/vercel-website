<script>
	import LineGraph from './LineGraph.svelte'
	let data = [
		[8, 2],
		[2, 2],
		[3, 2],
		[4, 2],
		[5, 2],
		[6, 2],
		[7, 3]
	]
	data = data
		.map((x) => {
			return { date: new Date(`2024-01-${x[0]}`), value: x[1] }
		})
		.sort((x, y) => {
			return x.date.getTime() - y.date.getTime()
		})
	console.log(data)
</script>

<div class="container">
	<LineGraph bind:data />
	<!-- <LineGraph bind:data />
	<LineGraph bind:data />
	<LineGraph bind:data /> -->
</div>

<style>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #232424;
		display: flex;
		justify-content: center;
		align-items: center;
		align-content: center;
		gap: 20px;
		flex-wrap: wrap;
	}
</style>
