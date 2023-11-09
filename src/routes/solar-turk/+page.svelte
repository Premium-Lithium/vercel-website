<script>
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	let uniqueIdentifier = 1234
	let projects = []
	let numOfProjects = 25

	onMount(async () => {
		const { data, error } = await supabase
			.from('south_facing_houses')
			.select('*')
			.limit(numOfProjects)
		console.log(data)
		data?.forEach((x) => {
			projects = [...projects, { projectId: x.id, address: x.address, latLon: x.lat_lon }]
		})
	})

	async function onListClick(project) {
		await fetch(`https://api.opensolar.com/api/orgs/52668/projects/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer s_IK65BN2IG56EVZ2GSH5NI5APGMKBCY5H'
			},
			body: JSON.stringify({
				identifier: project.projectId,
				lat: project.latLon.lat,
				lon: project.latLon.lon,
				address: project.address,
				notes: `userId: ${uniqueIdentifier}`
			})
		})
	}
</script>

{#key projects}
	<ul>
		{#each projects as project}
			<li on:click={() => onListClick(project)}>{project.address}</li>
		{/each}
	</ul>
{/key}

<style>
</style>
