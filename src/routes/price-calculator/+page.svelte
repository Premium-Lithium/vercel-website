<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'

    import { earliestInstallMonth, quoteFor } from './price-model';

    let earliestInstall = earliestInstallMonth();
    let plOffering = loadOffering();
    let installDateStr = plOffering.installMonth.toISOString().slice(0, 7);
    let quote = quoteFor(plOffering);
    let discountStr = "Calculating discount...";


    function updateQuote() {
        plOffering.installMonth = new Date(installDateStr);
        quote = quoteFor(plOffering); // Move this line below the above line.
        discountStr = (Number(quote.discount.multiplier) * 100).toFixed(0)
    }

    $: updateQuote();

    onMount(() => {
        earliestInstall = earliestInstallMonth();
        plOffering = loadOffering();
        installDateStr = plOffering.installMonth.toISOString().slice(0, 7);

        updateQuote();
    });


    function loadOffering() {
        // Load price calculator settings, using url param options where available
        let offering = defaultOffering();

        // If any url params are set, override the default settings
        const battSizeOption = `${$page.url.searchParams.get('batterySize_kWh')}`;
        if(battSizeOption) {
            const requestedCapacity = parseInt(battSizeOption, 10)

            // todo: handle case where requested battery size is, for now just get nearest

            offering.batterySize_kWh = requestedCapacity;
        }

        const evChargerOption = `${$page.url.searchParams.get('evCharger')}`;
        if(evChargerOption)
            offering.evCharger.included = evChargerOption === '1' ? true : false;

        const chargerCapacityOption = `${$page.url.searchParams.get('evChargerCapacity_kW')}`;
        if(chargerCapacityOption)
            offering.evCharger.capacity_kwh = parseInt(chargerCapacityOption, 10);

        const installMonthOption = $page.url.searchParams.get('installMonth');
        if(installMonthOption) {
            const targetInstallMonth = new Date(installMonthOption);

            if (targetInstallMonth >= earliestInstall)
                offering.installMonth = targetInstallMonth;
        }

        return offering;
    }


    function defaultOffering() {
        // todo: this should ideally be calculated to be set to a configuration that the majority of customers will prefer
        // heuristic calculation might be possible using sales history?
        // If we can initialise this such that customers can get a price **without having to change anything**, we should do this.

        const defaultOffering = {
            batterySize_kWh: 5,
            evCharger: {
                included: true,
                capacity_kwh: 7
            },
            installMonth: earliestInstall
        }

        return defaultOffering;
    }


    function priceStr(priceValueFloat) {
        return priceValueFloat.toFixed(2);
    }
</script>

<div>
    <!-- todo: build form options from product database -->
    <form on:change={updateQuote}>
        Battery capacity:

        <select bind:value={plOffering.batterySize_kWh}>
            <option value={5}>5 kWh</option>
            <option value={10}>10 kWh</option>
            <option value={20}>20 kWh</option>
        </select>

        <br>

        Add EV charger <input type="checkbox" bind:checked={plOffering.evCharger.included}>

        <br>

        <label for="install-month">Installation Date:</label>
        <input bind:value={installDateStr} type="month" id="install-month" name="install-month" min={earliestInstall.toISOString().slice(0, 7)}>
        <br>
        <br>
    </form>

    {#if quote.discount.value}
        Preorder discount: {discountStr}% off
    {/if}
    <p>Total price: £

    {#if quote.discount.value}
        <s>{priceStr(quote.price.earliestInstall)}</s>
    {/if}

    {priceStr(quote.price.total)}</p>
</div>

<style>
    div {
        font-family: Arial, sans-serif;
        font-size: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    select {
        padding: 5px;
        font-size: inherit;
    }
</style>