<script>
    import { page } from '$app/stores'
	// import { json } from '@sveltejs/kit';
    import { onMount } from 'svelte'

    // todo: fetch all price calculation options from the URL
    const batteryType = $page.url.searchParams.get('batteryType');

    onMount(async () => {
        // todo: Make fetch requests to load extra data

    });
</script>

<div>
battery type: {batteryType}
</div>

<style>
</style>