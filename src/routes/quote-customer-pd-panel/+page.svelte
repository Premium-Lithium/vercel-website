<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

    let sdk;
    let customerName;

    onMount(async () => {
        const dealId = $page.url.searchParams.get('selectedIds');
        customerName = `${dealId}`;

        sdk = await new AppExtensionsSDK().initialize();
    });

    async function sendQuoteEmail() {
        // REMOVE IN PRODUCTION
        const dealId = 6193;
        // REMOVE IN PRODUCTION

        // todo: uncomment this and make sure to gracefully handle case where deal is not found
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
    <button on:click={sendQuoteEmail} class="quote-button"><b>Send Quote</b></button>
</div>

<style>
    .quote-button {
        background-color: #28AAE2;
        border-color: #a4c1ce;
        border-width: 1.5px;
        border-radius: 5px;
        border-style: solid;
        color: white;
        padding: 7px 15px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
    }

    .quote-button:hover {
    background-color: #1c8cb9;
    }
</style>