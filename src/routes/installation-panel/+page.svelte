<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	import pipedrive from 'pipedrive';
	import { json } from '@sveltejs/kit';

	let sdk;
	let checkListData = {};
	let selectedPhase = {};
	let selectedTasks = {};
	const dealId = $page.url.searchParams.get('dealId');

	const fieldNames = {
		assigned: 'Assigned Checklist',
		inProgress: 'In Progress Checklist'
	};

	let checkListTemplate = {
		assigned: [
			{
				id: 999,
				label:
					'Once initial desktop investigation has been completed call client to advise on next steps'
			},
			{
				id: 1000,
				label: 'Arrange follow up call with client'
			}
		],
		inProgress: [
			{
				id: 1002,
				label: 'Update Ticket details with outcome of discussion with client'
			},
			{
				id: 1003,
				label: 'Resolve ticket remotely where possible'
			},
			{
				id: 1004,
				label: 'Liaise with installer to arrange rectification visit as required'
			},
			{
				id: 1005,
				label: 'Order any new materials required'
			},
			{
				id: 1006,
				label: 'Book site visit in with client'
			}
		]
	};

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 100 });
	});
	//  http://localhost:3000/installation-panel?dealId=7083

	onMount(() => {
		if (dealId) {
			retrieveDealChecklist();
		}
	});
	// TODO - show current checked checklist and display it on the Panel.
	async function retrieveDealChecklist() {
		try {
			const response = await fetch('/installation-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId
				})
			});
			if (response.ok) {
				checkListData = await response.json();
				console.log('Received:', checkListData);

				// Initialize selectedPhase and push initially checked checkboxes to selectedTasks
				Object.keys(checkListData).forEach((stage) => {
					if (!Array.isArray(checkListData[stage])) {
						checkListData[stage] = []; // Set the stage to be an empty array if returned response is null
					}
					checkListData[stage].forEach((label) => {
						selectedPhase[label] = true;

						// Check if the checkbox is initially checked
						if (selectedPhase[label]) {
							// Find the corresponding task in checkListTemplate and push it to selectedTask
							const taskList = checkListTemplate[stage];
							if (taskList) {
								// Find task in the list where label == task.label
								const task = taskList.find((task) => task.label === label);
								if (task) {
									if (!selectedTasks[stage]) {
										selectedTasks[stage] = [];
									}
									selectedTasks[stage].push({ id: task.id, label: task.label });
								} else {
									console.log(`Task not found for label: ${label}`);
								}
							} else {
								console.log(`Task list not found for stage: ${stage}`);
							}
						}
					});
				});
			}
		} catch (error) {
			console.log('Error', error);
		}
	}
	function handleCheckbox(event, checkList) {
		const taskId = Number(event.target.value);
		const taskLabel = event.target.name;
		const stageName = checkList;

		if (event.target.checked) {
			if (!selectedTasks[stageName]) {
				selectedTasks[stageName] = [];
			}
			selectedTasks[stageName].push({ id: taskId, label: taskLabel });
		} else {
			// Remove the task from selectedTask if unchecked
			selectedTasks[stageName] = selectedTasks[stageName].filter((task) => task.id !== taskId);
		}
		// Call the function to send PUT request (you need to implement this)
		updateChecklist(stageName, selectedTasks);
	}

	// TODO - linked checkbox to Pipedrive deals in both direction, retrieve and updating
	async function updateChecklist(stageName, selectedTasks) {
		console.log('Updated', selectedTasks);
		// "In Progress", 1005, "In Progress", 1006
		//https://api.pipedrive.com/v1/deals/7083?api_token=77a5356773f422eb97c617fd7c37ee526da11851
		// PUT Request Body: {{assigned: [], inprogress: []}})
		try {
			const response = await fetch('/installation-panel', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ [stageName]: selectedTasks[stageName] , dealId: dealId
                })
			});
			const data = await response.json();
			return JSON.stringify(data);
		} catch (error) {
			console.log('Error', error);
		}
	}
</script>

<div class="project-panel">
	{#each Object.entries(checkListTemplate) as [stage, tasks]}
		<h3>{fieldNames[stage]}</h3>
		{#each tasks as task}
			<li>
				<label>
					<input
						type="checkbox"
						value={task.id}
						name={task.label}
						bind:checked={selectedPhase[task.label]}
						on:change={(e) => handleCheckbox(e, stage)}
					/>
					{task.label}
				</label>
			</li>
		{/each}
	{/each}
</div>

<style>
	.project-panel {
		list-style: none;
		padding: 0px 15px;
	}
</style>
