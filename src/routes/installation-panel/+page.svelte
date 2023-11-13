<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	let sdk;
	let currentStage;
	let checkListData = {};
	let selectedPhase = {};
	let selectedTasks = {};
	let counter = {
		assigned: 0,
		inProgress: 0
	};
	const dealId = $page.url.searchParams.get('selectedIds');

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

	
	onMount(() => {
		console.log(dealId)
		if (dealId) {
			retrieveDealChecklist();
			getHeight()
			console.log("Current Stage", currentStage)
		}
		
				
	});
	//Work on dynamic height based on number of items in the list.
	//e.g if each list item is 5px high, then set the div height to be (5px * number_of_items + padding)
	onMount(async () => {
		
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 100 });
	});

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
				const responseData = await response.json();
				checkListData = responseData[0]
				currentStage = responseData[1]
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
									counter[stage] += 1;
									selectedTasks[stage].push({ id: task.id, label: task.label });
								} else {
									console.log('Task not found');
								}
							} else {
								console.log('Task list not found for stage');
							}
						}
					});
				});
				console.log('Init counter:', counter);
			}
		} catch (error) {
			console.log('Error', error);
		}
	}
	function handleCheckbox(event, checkList) {
		const taskId = Number(event.target.value);
		const taskLabel = event.target.name;
		const stageName = checkList;
		console.log(counter);

		if (event.target.checked) {
			if (!selectedTasks[stageName]) {
				selectedTasks[stageName] = [];
			}
			counter[stageName] += 1;
			selectedTasks[stageName].push({ id: taskId, label: taskLabel });
		} else {
			// Remove the task from selectedTask if unchecked
			counter[stageName] -= 1;
			selectedTasks[stageName] = selectedTasks[stageName].filter((task) => task.id !== taskId);
		}
		// Call the function to send PUT request (you need to implement this)
		updateChecklist(stageName, selectedTasks);
	}

	// TODO - linked checkbox to Pipedrive deals in both direction, retrieve and updating
	async function updateChecklist(stageName, selectedTasks) {
		console.log('Updated', selectedTasks);

		//https://api.pipedrive.com/v1/deals/7083?api_token=77a5356773f422eb97c617fd7c37ee526da11851
		// PUT Request Body: {{assigned: [], inprogress: []}})
		try {
			const response = await fetch('/installation-panel', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ [stageName]: selectedTasks[stageName], dealId: dealId })
			});
			const data = await response.json();
			return JSON.stringify(data);
		} catch (error) {
			console.log('Error', error);
		}
	}

	function getHeight(){
		const divElement = document.getElementById("details-panel").clientHeight;
		console.log("Div Height:", divElement)
	}
</script>
<div class="project-panel" id="details-panel">
	{#each Object.entries(checkListTemplate) as [stage, tasks]}
		{#if fieldNames[stage].includes(currentStage)}
			<details class="details-pane" open>
				<summary>{fieldNames[stage]}</summary>
				<div class="progress-container">
					<!-- <p>{(counter[stage] / Object.keys(tasks).length)}</p>
					<CircleProgressBar progress="{(counter[stage] / Object.keys(tasks).length)*360}"/> -->
					<ProgressBar
						width="{(counter[stage] / Object.keys(tasks).length) * 100}%"
						stage="{counter[stage]} / {Object.keys(tasks).length}"
					/><!-- Progress % -->
				</div>

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
			</details>
		{/if}
	{/each}
</div>

<style>
	.project-panel {
		list-style: none;
		padding: 15px;
		border: 2px solid black;
		width: 450px;
	}
	details > summary {
		font-size: 18px;
		cursor: pointer;
		padding: 5px
	}

	.project-panel label {
		cursor: pointer;
	}

</style>
