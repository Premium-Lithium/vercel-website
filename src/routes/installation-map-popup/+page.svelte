<script>
    import { onMount, tick } from 'svelte';
    import { page } from '$app/stores'
    import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

    let sdk;
    onMount(async () => {
        sdk = await new AppExtensionsSDK().initialize();
        await sdk.execute('resize', { height: 100 });
    });

</script>

<div style="padding: 0px 15px;">
    <button class="map-button"><b>Open Map</b></button>
</div>

<style>
    .map-button {
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

    .map-button:hover {
        background-color: #1c8cb9;
    }
</style>