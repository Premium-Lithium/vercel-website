<script>
    import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
    let authUrl;
    onMount(() => {
        getAuthLink()
	});
	async function getAuthLink(){
        try {
            //Get the Auth login link
            const response = await fetch('/payment-info-panel-auth')
            const responseData = await response.json()
            authUrl = responseData
        } catch (error) {
            console.log("Error")
        }
    }
</script>

<a href={authUrl}>Connect to Xero</a>

<style>
</style>
