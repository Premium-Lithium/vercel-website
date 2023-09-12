<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
    import toastr from 'toastr';
    import 'toastr/build/toastr.min.css';
	import { json } from 'stream/consumers';

    let sdk;
    let dealId = $page.url.searchParams.get('selectedIds');

    onMount(async () => {
        sdk = await new AppExtensionsSDK().initialize();
        await sdk.execute('resize', { height: 100 });
    });

    async function sendQuoteEmail() {
        console.log("sending quote email....");
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
                toastr.error('Failed to send quote draft', '', {
                    "positionClass": "toast-bottom-center",
                    "timeOut": "5000",
                })
                return null;
        }
    } catch (error) {
        console.error("error");
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