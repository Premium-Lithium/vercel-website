<script>
	import * as d3 from 'd3'
	import { draw } from 'svelte/transition'
	export let data
	export let title
	export let width = 570
	export let height = 204
	export let marginTop = 20
	export let marginRight = 30
	export let marginBottom = 30
	export let marginLeft = 20
	const margin = { top: 20, right: 20, bottom: 20, left: 20 }
	const innerHeight = height - margin.top - margin.bottom
	const innerWidth = width - margin.left - margin.right
	let show = false
	setTimeout((x) => {
		show = true
	}, 1)
	let gx
	let gy
	$: x = d3.scaleUtc(
		[data.map((x) => d3.utcDay.floor(x.date))[0], data.map((x) => x.date).at(-1)],
		[marginLeft, width - marginRight]
	)
	$: y = d3.scaleLinear(d3.extent(data.map((x) => x.value)), [height - marginBottom, marginTop])
	$: line = d3
		.line(
			(d) => x(d.date),
			(d) => y(d.value)
		)
		.curve(d3.curveMonotoneX)

	$: d3.select(gy).call(d3.axisLeft(y))
	$: d3.select(gx).call(d3.axisBottom(x))
	// $: console.log(
	// 	x.ticks().map((d) => {
	// 		return d.
	// 	})
	// )
</script>

{#if data}
	<div class="container">
		<h class="title">{title}</h>
		<svg {width} {height}>
			{#each d3.ticks(d3.extent(data.map((x) => x.value))[0], d3.extent(data.map((x) => x.value))[1], 5) as tickValue}
				<g transform={`translate(20,${y(tickValue)})`}>
					<line x2={innerWidth} stroke="black" stroke-opacity="0.2" />
					<text text-anchor="middle" dx="-0.75em" x={0} font-size="12px">
						{tickValue}
					</text>
				</g>
			{/each}
			{#each x.ticks(d3.utcHour.every(24)) as tickValue}
				<g transform={`translate(${x(tickValue) + marginLeft},20)`}>
					<line y2={innerHeight - 10} stroke="black" stroke-opacity="0.2" />
					<text text-anchor="middle" dy="0.1em" y={innerHeight + 3} font-size="12px">
						{tickValue.toDateString().split(' ')[0]}
					</text>
				</g>
			{/each}

			{#if show}
				<path
					transition:draw={{ duration: 2000 }}
					fill="none"
					stroke="#799730"
					filter="drop-shadow(0px 0px 4px #C9FC50)"
					stroke-width="2"
					transform={`translate(${-marginLeft - 10},0)`}
					d={line(data)}
				/>
			{/if}
		</svg>
	</div>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.title {
		color: white;
		margin: 4px;
		font-weight: bold;
	}
	svg {
		border-radius: 25px;
		background-color: white;
		border: 5px solid #d4fd73;
		box-sizing: border-box;
		shape-rendering: geometricPrecision;
		box-shadow: 4px 4px 6px #091408;
	}
	svg g {
		z-index: 1;
	}
	svg path {
		z-index: 3;
	}
</style>
