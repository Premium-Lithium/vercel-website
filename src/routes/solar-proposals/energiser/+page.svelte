<script>
	import { page } from '$app/stores'
	import { PUBLIC_GOOGLE_API_KEY, PUBLIC_OPEN_SOLAR_ORG_ID } from '$env/static/public'
	import Auth from '$lib/components/Auth.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	let uniqueIdentifier = undefined
	let projects = []
	let awaitingResponse = false
	let isAuthenticated = false
	let supabaseAuth = undefined
	let modals = []
	let menuModal

	// PARAMETERS

	const numOfProjects = 1000
	const minSaving = 300.0
	const maxSaving = 2000.0
	const minPanels = 4
	const maxPanels = 24

	$: if (supabaseAuth) {
		uniqueIdentifier = supabaseAuth.user.id
		populateProjectList()
	}

	const channels = supabase
		.channel('custom-insert-channel')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'platform_jobs' },
			async (payload) => {
				await populateProjectList()
			}
		)
		.subscribe()

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else {
			isAuthenticated = true
		}
	})

	async function populateProjectList() {
		const { data: getJobsData, error: getJobsError } = await supabase
			.from('platform_jobs')
			.select('*')
			.in('status', ['AWAITING_DESIGN', 'DESIGN_IN_PROGRESS', 'PENDING_QUOTES'])
		let data = await Promise.all(
			getJobsData.map(async (x) => {
				let homeownerData = await supabase
					.from('platform_homeowners')
					.select('*')
					.eq('id', x['homeowner_id'])
				return { jobData: { ...x }, homeownerData: homeownerData.data[0] }
			})
		)
		data = await Promise.all(
			data.map(async (x) => {
				let latLon = undefined
				if (x.homeownerData['lat_lon']) {
					latLon = x.homeownerData['lat_lon']
				} else {
					latLon = await getLatLon(x.homeownerData.address)
					await supabase
						.from('platform_homeowners')
						.update({ 'lat_lon': latLon })
						.eq('id', x.homeownerData.id)
				}
				let newHomeownerData = { ...x.homeownerData, latLon }
				return { jobData: x.jobData, homeownerData: newHomeownerData }
			})
		)
		projects = []
		console.log(data)
		data.forEach((x) => {
			modals = modals.length > projects.length ? [...modals] : [...modals, null]
			projects = [
				...projects,
				{
					homeownerId: x.homeownerData.id,
					jobId: x.jobData.id,
					address: x.homeownerData.address,
					latLon: x.homeownerData.latLon,
					status: getStringStatus(x.jobData.status),
					openSolarId: x.jobData['open_solar_project_id']
				}
			]
		})
		console.log(projects)
	}

	async function getLatLon(address) {
		let res = await fetch(`${$page.url.origin}/solar-proposals/geocoding`, {
			method: 'POST',
			body: JSON.stringify({ address: address })
		})
		return (await res.json()).results[0].geometry.location
	}

	async function createOpenSolarProject(project, comingFromOpen = false) {
		if (awaitingResponse & !comingFromOpen) return
		awaitingResponse = true
		console.log(project)
		let res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/create-project`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				project: {
					projectId: project.id,
					address: project.address,
					latLon: { 'lat': project.latLon.lat, 'lon': project.latLon.lng }
				},
				openSolarOrgId: PUBLIC_OPEN_SOLAR_ORG_ID
			})
		})
		let data = await res.json()
		awaitingResponse = false
		await addOpenSolarIdToAddress(data.id, project.jobId)
		await populateProjectList()
		project.openSolarId = data.id

		window.open(`https://app.opensolar.com/#/projects/${data.id}/`, '_blank')?.focus()
	}

	async function openOpenSolarProject(project, i) {
		modals[i].close()
		awaitingResponse = true
		await updateStatus(project.jobId, 'DESIGN_IN_PROGRESS')
		if (project.openSolarId) {
			let res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/get-project`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: {
						id: project.openSolarId
					},
					openSolarOrgId: PUBLIC_OPEN_SOLAR_ORG_ID
				})
			})
			res = await res.json()
			if (res.status == 400) {
				await createOpenSolarProject(project, true)
				return
			}
			window
				.open(`https://app.opensolar.com/#/projects/${project.openSolarId}/design`, '_blank')
				?.focus()
			awaitingResponse = false
		} else {
			await createOpenSolarProject(project, true)
		}
	}

	function getStringStatus(status) {
		return status[0] + status.slice(1).toLowerCase().replaceAll('_', ' ')
	}

	async function onListClick(project, i) {
		modals[i].showModal()
	}

	function getStaticImage(lat, lon, size, zoom) {
		return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&size=${size}x${size}&zoom=${zoom}&maptype=satellite&scale=2&key=${PUBLIC_GOOGLE_API_KEY}&markers=color:0x35bbed|${lat},${lon}`
	}

	async function updateStatus(jobId, status) {
		const { data, error } = await supabase
			.from('platform_jobs')
			.update({ 'status': status })
			.eq('id', jobId)
		if (error) {
			console.error('Error updating DB entry')
		}
	}

	async function completeProject(project, i) {
		awaitingResponse = true
		modals[i].close()
		project.status = 'PENDING_QUOTES'
		await updateStatus(project.jobId, project.status)
		await addOpenSolarIdToAddress(project.openSolarId, project.jobId)
		// fire webhook
		// await fetch('', {method: 'POST', body: JSON.stringify({'job_id': project.jobId})})
		awaitingResponse = false
		await populateProjectList()
	}

	async function addOpenSolarIdToAddress(openSolarId, jobId) {
		const { data, error } = await supabase
			.from('platform_jobs')
			.update({ 'open_solar_project_id': openSolarId })
			.eq('id', jobId)
		if (error) {
			console.error('Error updating DB entry')
		}
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
			{#if projects[i].status.toLowerCase() != 'not started'}
				<button
					class="modal-button"
					on:click|stopPropagation={() => completeProject(projects[i], i)}
					>{['design completed', 'quotes requested'].includes(projects[i].status.toLowerCase())
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
		<div class="hamburger" on:click={menuModal.showModal()} class:disabled={awaitingResponse}>
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
						{#if ['awaiting design', 'design in progress'].includes(project.status.toLowerCase())}
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
						{#if ['pending quotes'].includes(project.status.toLowerCase())}
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
		<Auth
			redirectUrl={`solar-proposals/energiser`}
			bind:authenticated={isAuthenticated}
			bind:supabaseAuth
		/>
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
</style>
