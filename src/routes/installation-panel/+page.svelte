<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	import pipedrive from 'pipedrive';
	import { json } from '@sveltejs/kit';

	let sdk;
	let selectedPhase = [];
	let currentStage = 'In Progress Checklist';
	let checkListData;
	let allTask = [];
	const dealId = $page.url.searchParams.get('dealId');

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 100 });
	});
	//  http://localhost:3000/installation-panel?dealId=7083
	let checkListTemplate = {
		'Assigned Checklist': [
			{
				id: 999,
				label:  'Once initial desktop investigation has been completed call client to advise on next steps'	
			},
			{
				id: 1000,
				label: 'Arrange follow up call with client'
			}
		],
		'In Progress Checklist': [
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
					dealId: dealId,
					currentStage: currentStage
				})
			});
			if (response.ok) {
				checkListData = await response.json();
				console.log("CheckListData:",checkListData);
                allTask = Object.values(checkListData).flat()
                allTask.forEach((task) => {
                    //Issue with apply "checked" on input therefore have to manually
                    const checkboxes = document.querySelectorAll(`input[name='${task}']`);
                    if (checkboxes.length > 0) {
                        checkboxes[0].click();
                    } else {
                        console.log('Error finding checkboxes, ');
                    }
                });
			}
		} catch (error) {
			console.log('Error', error);
		}
	}
	// TODO - update the stage of the deal when all checklists are checked.
	function updateSelectedPhase(task) {
        console.log("updateSelected", task)
		updateChecklist(task);
	}

	// TODO - linked checkbox to Pipedrive deals in both direction, retrieve and updating
	async function updateChecklist(selectedPhase) {
        console.log(selectedPhase)
		//https://api.pipedrive.com/v1/deals/7083?api_token=77a5356773f422eb97c617fd7c37ee526da11851
		// PUT Request Body: {"field name keyed": [options_id, options_id]})
		let phaseArr = [];
        /*
		for (const [key, value] of Object.entries(selectedPhase)) {
			console.log(key)
		}*/
		//console.log('PhaseArr', phaseArr);
		try {
			const response = await fetch('/installation-panel', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ [currentStage]: selectedPhase })
			});
			const data = await response.json();
			return JSON.stringify(data);
		} catch (error) {
			console.log('Error', error);
		}
	}
</script>

<div class="project-panel">
	{dealId}
	{currentStage}
	<p>selected: {selectedPhase}</p>
	{#each Object.entries(checkListTemplate) as [checkList, tasks]}
        <h3>{checkList}</h3>
        {#each tasks as task}
            <li>
                <label>
                    <input
                        type="checkbox"
                        value={task.id}
                        name={task.label}
                        bind:checked={selectedPhase[task.label]}
                        on:change={() => updateSelectedPhase(task.id)}
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
