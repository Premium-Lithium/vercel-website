<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
    import toastr from 'toastr';
    import 'toastr/build/toastr.min.css';
	import { json } from 'stream/consumers';

    let sdk;
    let dealId;

    onMount(async () => {
        dealId = $page.url.searchParams.get('selectedIds');
        sdk = await new AppExtensionsSDK().initialize();
        await sdk.execute('resize', { height: 100 });
    });

    async function sendQuoteEmail() {
        const  dealId = $page.url.searchParams.get('selectedIds');
        try{
            const response = await fetch('/quote-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deal_id: dealId
            })
            });
            if (response.status === 200) {
                toastr.success('Quote draft generated successfully!', '', {
                "positionClass": "toast-bottom-center",
                "timeOut": "5000",
                });
            } else {
                toastr.fail('Failed to send quote draft', '', {
                    "positionClass": "toast-bottom-center",
                    "timeOut": "5000",
                })
                console.log('Error:', response.status);
                return null;
        }
    } catch (error) {
        console.error(`Fetch error: ${response.status}`);
        return null;
    }
}
</script>

<div style="padding: 0px 15px;">
    <button on:click={sendQuoteEmail} class="quote-button"><b>Generate Quote Draft</b></button>
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
        transition: background-color 0.1s ease-in-out;
    }

    .quote-button:hover {
        background-color: #1c8cb9;
    }
</style>