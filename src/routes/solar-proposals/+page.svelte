<script>
	import { page } from '$app/stores'
	import Auth from '$lib/components/Auth.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	let uniqueIdentifier = undefined
	let projects = []
	let numOfProjects = 25
	let awaitingResponse = false
	let isAuthenticated = false
	let supabaseAuth = undefined
	let modals = []

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
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
		projects = []
		projectData?.forEach((x) => {
			modals = modals.length > projects.length ? [...modals] : [...modals, null]
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

	// in_progress -> In progress
	// not_started -> Not started
	// completed -> Completed
	function statusToString(status) {
		let split = status.split('_')
		return `${split[0][0].toUpperCase()}${split[0].slice(1)}${split[1] ? ` ${split[1]}` : ''}`
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

	async function createOpenSolarProject(project, comingFromOpen = false) {
		if (awaitingResponse & !comingFromOpen) return
		awaitingResponse = true
		let res = await fetch(`${$page.url.pathname}/open-solar/create-project`, {
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

	async function openOpenSolarProject(project, i) {
		modals[i].close()
		awaitingResponse = true
		let workerData = await getWorkerData(uniqueIdentifier)
		workerData[0]['assigned_projects'].forEach(async (entry) => {
			if (entry.uuid == project.projectId) {
				if (entry.openSolarId) {
					let res = await fetch(`${$page.url.pathname}/open-solar/get-project`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							project: {
								id: entry.openSolarId
							}
						})
					})
					res = await res.json()
					if (res.status == 400) {
						await createOpenSolarProject(project, true)
						return
					}
					window
						.open(`https://app.opensolar.com/#/projects/${entry.openSolarId}/`, '_blank')
						?.focus()
					awaitingResponse = false
				} else {
					await createOpenSolarProject(project, true)
				}
			}
		})
	}

	async function onListClick(project, i) {
		modals[i].showModal()
	}

	async function completeProject(project, i) {
		let awaitingResponse = true
		modals[i].close()
		let workerData = await getWorkerData(uniqueIdentifier)
		workerData[0]['assigned_projects'].forEach(async (entry) => {
			if (entry.uuid == project.projectId) {
				entry.status = 'completed'
				await addOpenSolarLinkToAddress(
					entry.openSolarId,
					project.projectId,
					uniqueIdentifier,
					workerData[0]['assigned_projects'].filter((x) => x.status == 'completed').length
				)
			}
		})
		await updateWorkerData(uniqueIdentifier, workerData[0])

		awaitingResponse = false
		populateProjectList()
	}

	async function addOpenSolarLinkToAddress(openSolarId, houseId, workerId, numCompleted) {
		let { data, error: selectError } = await supabase
			.from('south_facing_houses')
			.select('*')
			.eq('id', houseId)
		if (selectError) {
			console.error('Error fetching from south facing houses:', selectError)
			return
		}
		data = data[0]
		let openSolarProjects = data['open_solar_projects']
		if (!openSolarProjects) {
			openSolarProjects = [
				{
					workerId,
					openSolarLink: `https://app.opensolar.com/#/projects/${openSolarId}/`
				}
			]
		} else {
			openSolarProjects = openSolarProjects.filter((x) => {
				return x.workerId != workerId
			})
			openSolarProjects = [
				...openSolarProjects,
				{
					workerId,
					openSolarLink: `https://app.opensolar.com/#/projects/${openSolarId}/`
				}
			]
		}
		let { error: updateHouseError } = await supabase
			.from('south_facing_houses')
			.update({ open_solar_projects: openSolarProjects })
			.eq('id', houseId)

		if (updateHouseError) {
			console.error('Error update to south facing houses:', updateHouseError)
			return
		}

		let { error: updateWorkerError } = await supabase
			.from('solar_turk_workers')
			.update({ completed_projects: numCompleted })
			.eq('worker_id', workerId)
		if (updateWorkerError) {
			console.error('Error update to worker:', updateWorkerError)
			return
		}
	}
</script>

{#each modals as modal, i}
	<Modal showModal={false} bind:dialog={modal}>
		<div slot="header">
			<h3>{projects[i].address}</h3>
		</div>
		<div class="button-container">
			<button class="modal-button" on:click={openOpenSolarProject(projects[i], i)}
				>Open OpenSolar Project</button
			>
			<button class="warning">Panels are already installed</button>
			<button class="warning">Roof is too complicated</button>
			<button class="modal-button" on:click|stopPropagation={() => completeProject(projects[i], i)}
				>{projects[i].status.toLowerCase() == 'completed'
					? 'Recomplete Project'
					: 'Complete Project'}</button
			>
		</div>
	</Modal>
{/each}

<div class="container">
	{#if isAuthenticated}
		{#if awaitingResponse}
			<div class="spinner" />
			<div class="loading-indicator">Loading...</div>
		{/if}
		{#key projects}
			<h3 style="text-align: center;" class:disabled={awaitingResponse}>Projects</h3>
			<div class="project-list" class:disabled={awaitingResponse}>
				<ul>
					<li>
						<div class="project-header" style="pointer-events: none">
							<div class="address">Address</div>
							<div class="status">Status</div>
						</div>
					</li>
					{#each projects as project, i}
						{#if project.status.toLowerCase() != 'completed'}
							<li on:click={() => onListClick(project, i)} class:disabled={awaitingResponse}>
								<div class="project-item">
									<div class="address">{project.address.split(',')[0]}</div>
									<div class="status">{project.status}</div>
								</div>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
			<h3 style="text-align: center;" class:disabled={awaitingResponse}>Completed Projects</h3>
			<div class="project-list" class:disabled={awaitingResponse}>
				<ul>
					<li>
						<div class="project-header" style="pointer-events: none">
							<div class="address">Address</div>
							<div class="status">Status</div>
						</div>
					</li>
					{#each projects as project, i}
						{#if project.status.toLowerCase() == 'completed'}
							<li on:click={() => onListClick(project, i)} class:disabled={awaitingResponse}>
								<div class="project-item">
									<div class="address">{project.address.split(',')[0]}</div>
									<div class="status">{project.status}</div>
								</div>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		{/key}
	{:else}
		<Auth redirectUrl={`/solar-proposals`} bind:authenticated={isAuthenticated} bind:supabaseAuth />
	{/if}
</div>

<style>
	h3 {
		margin: 8px;
	}
	.warning {
		border: 2px solid #f9bf3b;
		padding: 5px 10px;
	}
	.button-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	.container {
		background-color: #f2f2f2;
		width: 100%;
		min-height: 100%;
		height: fit-content;
		position: absolute;
		top: 0;
		left: 0;
	}
	ul {
		list-style: none;
		padding: 0;
	}

	.project-list {
		padding: 10px;
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
		border-radius: 4px;
		transition: background-color 0.3s, box-shadow 0.3s;
		border-left: 4px solid #35bbed;
		transition: border-left 0.3s;
		display: grid;
		grid-template-columns: 3fr 1fr 1fr;
		gap: 12px;
	}

	.project-header {
		font-weight: 600;
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

	.button-container button {
		background-color: #eaeaea;
		border-radius: 8px;
		color: black;
		margin-right: 10px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.modal-button {
		padding: 10px 20px;
		border: 2px solid #35bbed;
	}

	.button-container button:hover {
		background-color: #dadada;
	}

	.button-container button:active {
		background-color: darken(#eaeaea, 20%);
	}

	.button-container button:last-child {
		margin-right: 0;
	}

	.button-container button.disabled {
		background-color: #ccc;
	}

	.button-container button.negative {
		background-color: #e74c3c;
	}
</style>
