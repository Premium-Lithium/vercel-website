<script>
	import { onMount } from 'svelte'
	import LineGraph from './LineGraph.svelte'
	import { getAllHomeowners, getAllInstallers } from './utils'
	import { supabase } from '$lib/supabase'
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
	let homeowners, installers
	let homeownerCount, installerCount

	const homeownerChannel = supabase
		.channel('custom-insert-channel')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'platform_homeowners' },
			async (payload) => {
				await refreshGraphs()
			}
		)
		.subscribe()
	const installerChannel = supabase
		.channel('custom-insert-channel')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'platform_installers' },
			async (payload) => {
				await refreshGraphs()
			}
		)
		.subscribe()
	onMount(refreshGraphs)

	async function refreshGraphs() {
		homeowners = await getAllHomeowners()
		installers = await getAllInstallers()

		const binDataFor7Days = (data) => {
			const bins = new Array(7).fill(0).map(() => [])
			const now = Date.now()
			data.forEach((item) => {
				const diffDays = Math.floor(
					(now - new Date(item['date_signed_up']).getTime()) / (1000 * 60 * 60 * 24)
				)
				if (diffDays >= 0 && diffDays < 7) {
					bins[6 - diffDays].push(item)
				}
			})
			return bins
		}

		const binDataFor24Hours = (data) => {
			const bins = new Array(24).fill(0).map(() => [])
			const now = Date.now()
			data.forEach((item) => {
				const diffHours = Math.floor(
					(now - new Date(item['date_signed_up']).getTime()) / (1000 * 60 * 60)
				)
				if (diffHours >= 0 && diffHours < 24) {
					bins[diffHours].push(item)
				}
			})
			return bins
		}

		const homeownerBinsFor7Days = binDataFor7Days(homeowners)

		let homeownerRollingLength =
			homeowners.length -
			homeownerBinsFor7Days.reduce((p, v, i, a) => {
				return p + v.length
			}, 0)
		homeownerCount = homeownerBinsFor7Days.map((x, i, a) => {
			homeownerRollingLength += x.length
			return { date: new Date(Date.now() - 86400000 * (6 - i)), value: homeownerRollingLength }
		})

		const installerBinsFor7Days = binDataFor7Days(installers)

		let installerRollingLength =
			installers.length -
			installerBinsFor7Days.reduce((p, v, i, a) => {
				return p + v.length
			}, 0)
		installerCount = installerBinsFor7Days.map((x, i, a) => {
			installerRollingLength += x.length
			return { date: new Date(Date.now() - 86400000 * (6 - i)), value: installerRollingLength }
		})
	}
</script>

<div class="container">
	{#if homeownerCount}
		<LineGraph bind:data={homeownerCount} title="Homeowner signups (7d)" />
	{/if}
	{#if installerCount}
		<LineGraph bind:data={installerCount} title="Installer signups (7d)" />
	{/if}
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
