<script>
	import { page } from '$app/stores'
	import Auth from '$lib/components/Auth.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	let uniqueIdentifier = undefined
	let projects = []
	let numOfProjects = 25
	let awaitingResponse = false
	let isAuthenticated = false
	let supabaseAuth = undefined

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		console.log(data)
		if (data.session == null) isAuthenticated = false
		else isAuthenticated = true
	})

	$: if (isAuthenticated && supabaseAuth) {
		uniqueIdentifier = supabaseAuth.user.id
		populateProjectList()
	}

	async function populateProjectList() {
		let workerData = await getWorkerData(uniqueIdentifier)
		let projectIds = []
		if (workerData.length == 0) {
			await createNewWorker(uniqueIdentifier, numOfProjects)
			workerData = await getWorkerData(uniqueIdentifier)
		}
		projectIds = workerData[0]['assigned_projects'].map((x) => {
			return x.uuid
		})

		let projectData = await Promise.all(
			projectIds.map(async (id) => {
				return await getProjectData(id, uniqueIdentifier)
			})
		)
		projectData?.forEach((x) => {
			projects = [
				...projects,
				{ projectId: x.id, address: x.address, latLon: x.lat_lon, status: statusToString(x.status) }
			]
		})
	}

	async function getWorkerData(id) {
		const { data, error } = await supabase
			.from('solar_turk_workers')
			.select('*')
			.eq('worker_id', id)
		return data
	}

	async function updateWorkerData(id, workerData) {
		const { data, error } = await supabase
			.from('solar_turk_workers')
			.update(workerData)
			.eq('worker_id', id)
	}

	async function getProjectData(projectId, workerId) {
		let { data: houseData, error: houseError } = await supabase
			.from('south_facing_houses')
			.select('*')
			.eq('id', projectId)
		let { data: projectData, error: projectError } = await supabase
			.from('solar_turk_workers')
			.select('*')
			.eq('worker_id', workerId)
		houseData = houseData[0]
		projectData = projectData[0]

		let projectStatus = 'Not started'
		projectData['assigned_projects'].forEach((x) => {
			if (x.uuid === projectId) projectStatus = x.status
		})
		return {
			id: houseData?.id,
			address: houseData?.address,
			lat_lon: houseData?.lat_lon,
			status: projectStatus
		}
	}

	function statusToString(status) {
		let split = status.split('_')
		return `${split[0][0].toUpperCase()}${split[0].slice(1)} ${split[1]}`
	}

	async function createNewWorker(workerId, numOfProjects) {
		let { data, error } = await supabase.rpc('get_random_south_facing_houses', {
			num_rows: numOfProjects
		})

		if (error) {
			console.error('Error fetching random south facing houses:', error)
			return
		}
		let projectIds = data.map((x) => {
			return x.id
		})

		let response = await supabase.from('solar_turk_workers').insert([
			{
				worker_id: workerId,
				assigned_projects: data.map((x) => {
					return { uuid: x.id, status: 'not_started', openSolarId: null }
				})
			}
		])

		let newData = response.data
		let newError = response.error

		if (newError) {
			console.error('Error inserting new worker:', newError)
		}
	}

	async function onListClick(project) {
		if (awaitingResponse) return
		awaitingResponse = true
		setTimeout(() => {
			awaitingResponse = false
		}, 2000)
		let res = await fetch($page.url.pathname, {
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
		let workerData = await getWorkerData(uniqueIdentifier)
		workerData[0]['assigned_projects'].forEach((entry) => {
			if (entry.uuid == project.projectId) {
				entry.status = 'in_progress'
				entry.openSolarId = data.id
			}
		})
		await updateWorkerData(uniqueIdentifier, workerData[0])
		awaitingResponse = false
		window.open(`https://app.opensolar.com/#/projects/${data.id}/`, '_blank')?.focus()
	}
</script>

<div class="container">
	{#if isAuthenticated}
		{#key projects}
			{#if awaitingResponse}
				<div class="spinner" />
				<div class="loading-indicator">Loading...</div>
			{/if}
			<div class="project-list" class:disabled={awaitingResponse}>
				<ul>
					<li>
						<div class="project-header" style="pointer-events: none">
							<div class="address">Address</div>
							<div class="status">Status</div>
						</div>
					</li>
					{#each projects as project}
						<li on:click={() => onListClick(project)} class:disabled={awaitingResponse}>
							<div class="project-item">
								<div class="address">{project.address}</div>
								<div class="status">{project.status}</div>
								{#if project.status !== 'completed'}
									<button on:click|stopPropagation={() => completeProject(project)}>Complete</button
									>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/key}
	{:else}
		<Auth redirectUrl={`/solar-proposals`} bind:authenticated={isAuthenticated} bind:supabaseAuth />
	{/if}
</div>

<style>
	.container {
		background-color: #f2f2f2;
		width: 100%;
		height: 100%;
	}
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
	}
	.project-item,
	.project-header {
		padding: 10px 15px;
		margin: 5px 0;
		background-color: #ffffff;
		border-radius: 5px;
		transition: background-color 0.3s, box-shadow 0.3s;
		border-left: 4px solid #35bbed;
		transition: border-left 0.3s;
		display: grid;
		grid-template-columns: 3fr 1fr 1fr;
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
		border-top: 4px solid #35bbed;
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
