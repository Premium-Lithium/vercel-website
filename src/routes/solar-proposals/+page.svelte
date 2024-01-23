<script>
	import toastr from 'toastr'
	import 'toastr/build/toastr.min.css'
	import { page } from '$app/stores'
	import {
		PUBLIC_GOOGLE_API_KEY,
		PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
	} from '$env/static/public'
	import Auth from '$lib/components/Auth.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	import { updateStatus } from '$lib/campaignTools'

	let uniqueIdentifier = undefined
	let projects = []
	let awaitingResponse = false
	let isAuthenticated = false
	let supabaseAuth = undefined
	let modals = []
	let menuModal
	const flagsVisibleToWorker = ['PANELS_ALREADY_INSTALLED', 'ROOF_TOO_COMPLICATED']
	let activeCampaigns = []

	// PARAMETERS

	const numOfProjects = 25
	const minSaving = 300.0
	const maxSaving = 2000.0
	const minPanels = 4
	const maxPanels = 24

	$: if (supabaseAuth) {
		uniqueIdentifier = supabaseAuth.user.id
		populateProjectList()
	}

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else {
			isAuthenticated = true
		}
	})

	async function populateProjectList() {
		const { data: getActiveCampaignData, error: getActiveCampaignError } = await supabase
			.from('campaign_master')
			.select('*')
		activeCampaigns = getActiveCampaignData?.map((x) => {
			if (x['campaign_name'].includes('new-solar')) return x.campaign_id
		})
		let workerData = await getWorkerData(uniqueIdentifier)
		let projectIds = []
		if (workerData.length == 0) {
			await createNewWorker(uniqueIdentifier, numOfProjects)
			workerData = await getWorkerData(uniqueIdentifier)
		}
		projectIds = workerData[0]['assigned_projects'].map((x) => {
			return x['customerId']
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
				{
					projectId: x.id,
					address: x.address,
					latLon: x.lat_lon,
					status: statusToString(x.status),
					campaignId: x['campaign_id']
				}
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
			.from('campaign_customers')
			.select('*')
			.eq('customer_id', projectId)
		let { data: projectData, error: projectError } = await supabase
			.from('solar_turk_workers')
			.select('*')
			.eq('worker_id', workerId)
		houseData = houseData[0]
		projectData = projectData[0]

		let projectStatus = 'Not started'
		projectData['assigned_projects'].forEach((x) => {
			if (x['customerId'] === projectId) projectStatus = x.status
		})
		return {
			id: houseData['customer_id'],
			address: houseData?.address['formatted_address'],
			lat_lon: houseData?.address.geometry.location,
			campaign_id: houseData['campaign_id'],
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

	async function assignNProjects(workerId, numOfProjects) {
		const { data: getProjectsData, error: getProjectsError } = await supabase
			.from('solar_turk_workers')
			.select('assigned_projects')
			.eq('worker_id', workerId)
		let assignedProjects = getProjectsData[0]['assigned_projects'].map((x) => {
			return x.customerId
		})

		let { data, error } = await supabase.rpc('get_campaign_customers', {
			numrows: numOfProjects,
			campaignids: activeCampaigns,
			assignedprojectids: assignedProjects
		})

		console.log(data)

		if (error) {
			console.error('Error fetching random campaign customers:', error)
			return
		}

		let response = await supabase
			.from('solar_turk_workers')
			.update({
				assigned_projects: [
					...data.map((x) => {
						return {
							customerId: x['customer_id'],
							status: 'not_started',
							openSolarId: null,
							flags: []
						}
					}),
					...getProjectsData[0]['assigned_projects']
				]
			})
			.eq('worker_id', workerId)

		let newData = response.data
		let newError = response.error

		if (newError) {
			console.error('Error allocating new projects:', newError)
		}
	}

	async function createNewWorker(workerId, numOfProjects) {
		let { data, error } = await supabase.rpc('get_campaign_customers', {
			numrows: numOfProjects,
			campaignids: activeCampaigns,
			assignedprojectids: []
		})

		if (error) {
			console.error('Error fetching random campaign customers:', error)
			return
		}

		let response = await supabase.from('solar_turk_workers').insert([
			{
				worker_id: workerId,
				assigned_projects: data.map((x) => {
					return {
						customerId: x['customer_id'],
						status: 'not_started',
						openSolarId: null,
						flags: []
					}
				}),
				worker_email: supabaseAuth.user.email
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
		let res = await fetch(`${$page.url.pathname}/open-solar/get-roles`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				openSolarOrgId: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
			})
		})
		res = await res.json()
		let user = res.filter((x) => {
			return x['email'] == supabaseAuth.user.email
		})
		if (user.length == 0) {
			console.log(user)
			toastr.error(`Couldn't find user. Are you signed in to the correct email?`)
			awaitingResponse = false
			return
		}
		let userId = user[0].id
		res = await fetch(`${$page.url.pathname}/open-solar/create-project/with-user`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				project: {
					projectId: project.id,
					address: project.address,
					latLon: { 'lat': project.latLon.lat, 'lon': project.latLon.lng },
					uniqueIdentifier
				},
				openSolarOrgId: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID,
				userId
			})
		})
		let data = await res.json()
		let workerData = await getWorkerData(uniqueIdentifier)
		workerData[0]['assigned_projects'].forEach((entry) => {
			if (entry['customerId'] == project.projectId) {
				entry.status = 'in_progress'
				entry.openSolarId = data.id
			}
		})
		await updateWorkerData(uniqueIdentifier, workerData[0])
		awaitingResponse = false
		populateProjectList()
		window.open(`https://app.opensolar.com/#/projects/${data.id}/`, '_blank')?.focus()
	}

	async function openOpenSolarProject(project, i) {
		modals[i].close()
		awaitingResponse = true
		let workerData = await getWorkerData(uniqueIdentifier)
		workerData[0]['assigned_projects'].forEach(async (entry) => {
			if (entry['customerId'] == project.projectId) {
				if (entry.openSolarId) {
					let res = await fetch(`${$page.url.pathname}/open-solar/get-project`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							project: {
								id: entry.openSolarId
							},
							openSolarOrgId: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
						})
					})
					res = await res.json()
					if (res.status == 400) {
						await createOpenSolarProject(project, true)
						return
					}
					window
						.open(`https://app.opensolar.com/#/projects/${entry.openSolarId}/design`, '_blank')
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

	function getStaticImage(lat, lon, size, zoom) {
		return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&size=${size}x${size}&zoom=${zoom}&maptype=satellite&scale=2&key=${PUBLIC_GOOGLE_API_KEY}&markers=color:0x35bbed|${lat},${lon}`
	}

	async function completeProject(project, i) {
		awaitingResponse = true
		modals[i].close()
		let workerData = await getWorkerData(uniqueIdentifier)
		workerData[0]['assigned_projects'].forEach(async (entry) => {
			if (
				entry['customerId'] == project.projectId &&
				(entry.status == 'in_progress' || entry.status == 'completed')
			) {
				let existingFlags = entry.flags
				entry.status = 'completed'
				const { pass, flags } = await performAutomaticAudit(entry.openSolarId)
				flags.forEach(async (flag) => {
					await addFlagToProject(project, flag)
				})
				let newFlags = [
					...new Set([...existingFlags.filter((x) => flagsVisibleToWorker.includes(x)), ...flags])
				] // merge flag arrays, removing duplicates
				await addOpenSolarLinkToAddress(
					entry.openSolarId,
					project.projectId,
					uniqueIdentifier,
					workerData[0]['assigned_projects'].filter((x) => x.status == 'completed').length,
					newFlags
				)
				await updateStatus(
					project.campaignId,
					project.projectId,
					'DESIGN-COMPLETED',
					'An OpenSolar design has been completed'
				)
				// WIP - save system image from OpenSolar when completing a project
				// let res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/get-systems`, {
				// 	method: 'POST',
				// 	body: JSON.stringify({
				// 		'openSolarId': entry.openSolarId,
				// 		'openSolarOrgId': PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
				// 	})
				// })
				// res = await res.json()
				// let systemId = res.systems[0].uuid
				// res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/get-image`, {
				// 	method: 'POST',
				// 	body: JSON.stringify({
				// 		'openSolarId': entry.openSolarId,
				// 		'openSolarOrgId': PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID,
				// 		systemId
				// 	})
				// })
				// res = await res.json()
				// let pdf = res.url
				// console.log(pdf)
			}
		})
		await updateWorkerData(uniqueIdentifier, workerData[0])

		awaitingResponse = false
		populateProjectList()
	}

	async function performAutomaticAudit(openSolarId) {
		let flags = []
		let res = await fetch('/solar-proposals/open-solar/get-systems', {
			method: 'POST',
			body: JSON.stringify({
				openSolarId,
				openSolarOrgId: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
			}),
			headers: { 'Content-Type': 'application/json' }
		})
		if (!res.ok) {
			console.log(res.statusText)
		} else {
			let systems = (await res.json()).systems
			const totalPanels = systems.reduce((p, v, i, a) => {
				return p + v.total_module_quantity
			}, 0)
			if (totalPanels < minPanels) flags.push('NOT_ENOUGH_PANELS')
			if (totalPanels > maxPanels) flags.push('TOO_MANY_PANELS')

			const proposedSaving = systems
				.reduce((p, v, i, a) => {
					return (
						p +
						(v.data.bills.current.bills_yearly[0].annual.total -
							v.data.bills.proposed['213321'].bills_yearly[0].annual.total)
					)
				}, 0)
				.toFixed(2)
			if (proposedSaving < minSaving) flags.push('NOT_ENOUGH_SAVING')
			if (proposedSaving > maxSaving) flags.push('TOO_MUCH_SAVING')
		}
		return { pass: flags.length == 0, flags }
	}

	async function addOpenSolarLinkToAddress(openSolarId, houseId, workerId, numCompleted, flags) {
		let { data, error: selectError } = await supabase
			.from('campaign_customers')
			.select('*')
			.eq('customer_id', houseId)
		if (selectError || !data || data.length == 0 || !data[0]) {
			console.error('Error fetching from campaign customers:', selectError)
			return
		}
		data = data[0]
		let openSolarProjects = data['campaign_specific_data']['open_solar_projects']
		if (!openSolarProjects) {
			openSolarProjects = [
				{
					workerId,
					openSolarId: openSolarId,
					flags
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
					openSolarId: openSolarId,
					flags
				}
			]
		}
		let { error: updateHouseError } = await supabase
			.from('campaign_customers')
			.update({
				campaign_specific_data: {
					...data['campaign_specific_data'],
					open_solar_projects: openSolarProjects
				}
			})
			.eq('customer_id', houseId)

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

	async function addFlagToProject(project, flag) {
		let workerData = await getWorkerData(uniqueIdentifier)
		workerData[0]['assigned_projects'].forEach(async (entry) => {
			if (
				(entry['customerId'] == project.projectId && entry.status == 'in_progress') ||
				entry.status == 'completed'
			) {
				if (!entry.flags.includes(flag)) entry.flags = [...entry.flags, flag]
			}
		})
		await updateWorkerData(uniqueIdentifier, workerData[0])
	}

	async function panelsAlreadyInstalledClicked(project, i) {
		await addFlagToProject(project, 'PANELS_ALREADY_INSTALLED')
		await completeProject(project, i)
		modals[i].close()
	}

	async function roofTooComplicatedClicked(project, i) {
		await addFlagToProject(project, 'ROOF_TOO_COMPLICATED')
		await completeProject(project, i)
		modals[i].close()
	}

	async function notResidentialClicked(project, i) {
		await addFlagToProject(project, 'PROPERTY_NOT_RESIDENTIAL')
		await completeProject(project, i)
		modals[i].close()
	}

	async function notSuitableForSolarClicked(project, i) {
		await addFlagToProject(project, 'NOT_SUITABLE_FOR_SOLAR')
		await completeProject(project, i)
		modals[i].close()
	}

	async function pinNotOnRoofClicked(project, i) {
		await addFlagToProject(project, 'ADDRESS_UNCLEAR')
		await completeProject(project, i)
		modals[i].close()
	}
</script>

{#each modals as modal, i}
	<Modal showModal={false} bind:dialog={modal}>
		<div class="modal" slot="header">
			<h3>{projects[i].address.split(',')[0]}</h3>
		</div>
		{#if projects[i]}
			<img src={getStaticImage(projects[i].latLon.lat, projects[i].latLon.lng, 200, 19)} />
		{/if}
		<div class="button-container">
			<button class="modal-button" on:click={openOpenSolarProject(projects[i], i)}
				>Open OpenSolar Project</button
			>
			<button
				class="warning-button"
				on:click|stopPropagation={() => pinNotOnRoofClicked(projects[i], i)}
				>Pin isn't on roof / address unclear</button
			>
			<button
				class="warning-button"
				on:click|stopPropagation={() => panelsAlreadyInstalledClicked(projects[i], i)}
				>Panels are already installed</button
			>
			<button
				class="warning-button"
				on:click|stopPropagation={() => roofTooComplicatedClicked(projects[i], i)}
				>Roof is too complicated</button
			>
			<button
				class="warning-button"
				on:click|stopPropagation={() => notResidentialClicked(projects[i], i)}
				>Not a residential property</button
			>
			<button
				class="warning-button"
				on:click|stopPropagation={() => notSuitableForSolarClicked(projects[i], i)}
				>Not suitable for solar</button
			>
			{#if projects[i].status.toLowerCase() != 'not started'}
				<button
					class="modal-button"
					on:click|stopPropagation={() => completeProject(projects[i], i)}
					>{projects[i].status.toLowerCase() == 'completed'
						? 'Recomplete Project'
						: 'Complete Project'}</button
				>
			{/if}
		</div>
	</Modal>
{/each}
<Modal showModal={false} bind:dialog={menuModal}>
	<div class="modal" slot="header"><h3>Menu</h3></div>
	<div class="inner-modal">
		<div class="button-container">
			<button
				class="modal-button"
				on:click={async () => {
					await assignNProjects(uniqueIdentifier, 25)
					await populateProjectList()
					menuModal.close()
				}}
			>
				Get new projects
			</button>
			<button
				class="modal-button"
				on:click={async () => {
					await supabase.auth.signOut()
					supabaseAuth = undefined
					isAuthenticated = false
					menuModal.close()
				}}
			>
				Log out
			</button>
		</div>
	</div>
</Modal>

<div class="container">
	{#if isAuthenticated}
		<div class="hamburger" on:click={menuModal.showModal()}>
			<div class="ham" />
			<div class="ham" />
			<div class="ham" />
		</div>
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
								<div class="project-item" class:bold={project.status == 'In progress'}>
									<div class="address">{project.address.split(',')[0]}</div>
									<div class="status">
										{project.status}
									</div>
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
									<div class={'status'}>
										{project.status}
									</div>
								</div>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		{/key}
	{:else}
		<Auth redirectUrl={`solar-proposals`} bind:authenticated={isAuthenticated} bind:supabaseAuth />
	{/if}
</div>

<style>
	.hamburger {
		width: 40px;
		height: 30px;
		margin: 26px 24px 24px 24px;
		position: absolute;
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
	}

	.hamburger:hover > .ham {
		background: #424242;
	}

	.ham {
		width: 100%;
		height: 50%;
		top: 25%;
		position: relative;
		background: black;
		border-radius: 25px;
	}

	.inner-modal {
		min-width: 25vw;
	}

	.bold {
		font-weight: 600;
	}
	h3 {
		margin: 32px 8px 8px 8px;
		text-align: center;
	}

	.modal > h3 {
		margin: 8px 8px 16px 8px;
	}

	.warning-button {
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
		text-wrap: nowrap;
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
		cursor: pointer;
		min-width: 60%;
		transition: background-color 0.15s ease;
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
