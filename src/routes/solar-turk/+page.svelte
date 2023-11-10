<script>
	import { goto } from '$app/navigation'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	let uniqueIdentifier = 1234
	let projects = []
	let numOfProjects = 25
	let awaitingResponse = false

	onMount(async () => {
		const { data, error } = await supabase.rpc('get_random_rows', {
			table_name: 'south_facing_houses',
			num_rows: numOfProjects
		})
		// const { data, error } = await supabase
		// 	.from('south_facing_houses')
		// 	.select('*')
		// 	.limit(numOfProjects)
		console.log(data)
		data?.forEach((x) => {
			projects = [...projects, { projectId: x.id, address: x.address, latLon: x.lat_lon }]
		})
	})

	async function onListClick(project) {
		if (awaitingResponse) return
		awaitingResponse = true
		setTimeout(() => {
			awaitingResponse = false
		}, 2000)
		return
		let res = await fetch('/solar-turk', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				project: {
					projectId: project.id,
					address: project.address,
					latLon: project.latLon,
					uniqueIdentifier
				}
			})
		})
		let data = await res.json()
		awaitingResponse = false
		goto(`https://app.opensolar.com/#/projects/${data.id}/`)
	}
</script>

{#key projects}
	{#if awaitingResponse}
		<div class="spinner" />
		<div class="loading-indicator">Loading...</div>
	{/if}
	<div class="project-list" class:disabled={awaitingResponse}>
		<ul>
			{#each projects as project}
				<li on:click={() => onListClick(project)} class:disabled={awaitingResponse}>
					<div class="project-item">
						<div class="address">{project.address}</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
{/key}

<style>
	ul {
		list-style: none;
		padding: 0;
	}

	.project-list {
		padding: 20px;
		background-color: #f2f2f2;
		border-radius: 10px;
		max-width: 600px;
		margin: auto;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
	.project-item {
		padding: 10px 15px;
		margin: 5px 0;
		background-color: #ffffff;
		border-radius: 5px;
		transition: background-color 0.3s, box-shadow 0.3s;
		border-left: 4px solid #35bbed;
		transition: border-left 0.3s;
	}

	.project-item:hover {
		border-left: 32px solid #35bbed;
		transition: border-left 0.3s;
	}

	li:hover .project-item {
		cursor: pointer;
		background-color: #eaeaea;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.spinner {
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top: 4px solid #35bbed; /* Accent color for spinner */
		width: 40px;
		height: 40px;
		animation: spin 2s linear infinite;
		position: absolute;
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	@keyframes spin {
		0% {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		100% {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.project-list {
			width: 90%;
		}
	}

	.loading-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 20px;
		color: #000000;
	}

	.disabled {
		pointer-events: none;
		opacity: 0.5;
		filter: blur(2px);
	}
</style>
