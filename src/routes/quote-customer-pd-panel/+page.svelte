<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

    let sdk;
    let customerName;

    onMount(async () => {
        const dealId = $page.url.searchParams.get('selectedIds');
        customerName = "todo: load name using dealId";

        sdk = await new AppExtensionsSDK().initialize();
    });

    async function sendQuoteEmail() {
        const dealId = 6193;
        // const dealId = $page.url.searchParams.get('selectedIds');

        await fetch('/quote-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deal_id: dealId
            })
        });
    }
</script>

<div>
    custom deal panel here
    <br>
    customer name: {customerName}
    <br>
    <button on:click={sendQuoteEmail}>Send Quote</button>
</div>

<style>
</style>