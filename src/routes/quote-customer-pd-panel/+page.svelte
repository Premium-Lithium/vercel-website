<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'

    let userId;

    onMount(() => {
        // Get the code from the url query params
        userId = `${$page.url.searchParams.get('userId')}`;
        console.log(`userId: ${userId}`);

        // Use this code to get an auth token by making request to pipedrive
    });
</script>

<div>
    custom deal panel here
    userId: {$userId}
</div>

<style>
</style>