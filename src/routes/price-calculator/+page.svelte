<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'

    import { earliestInstallMonth, quoteFor } from './price-model';

    let earliestInstall = earliestInstallMonth();

    let customerSolution = loadSolution();
    let installDateStr = customerSolution.installMonth.toISOString().slice(0, 7);
    let quote = quoteFor(customerSolution);
    let discountStr = "Calculating discount...";


    function updateQuote() {
        quote = quoteFor(customerSolution);
        customerSolution.installMonth = new Date(installDateStr);
        discountStr = (Number(quote.discount.multiplier) * 100).toFixed(0)

        // todo: construct table of components here
    }

    $: updateQuote();

    onMount(() => {
        earliestInstall = earliestInstallMonth();
        customerSolution = loadSolution();
    });


    function loadSolution() {
        // Load price calculator settings, using url param options where available
        let solution = defaultSolution();

        // If any url params are set, override the default settings
        const battSizeOption = `${$page.url.searchParams.get('batterySize_kWh')}`;
        if(battSizeOption)
            solution.batterySize_kWh = parseInt(battSizeOption, 10);

        const evChargerOption = `${$page.url.searchParams.get('evCharger')}`;
        if(evChargerOption)
            solution.evCharger.included = evChargerOption === '1' ? true : false;

        const chargerCapacityOption = `${$page.url.searchParams.get('evChargerCapacity_kW')}`;
        if(chargerCapacityOption)
            solution.evCharger.capacity_kwh = parseInt(chargerCapacityOption, 10);

        const installMonthOption = `${$page.url.searchParams.get('installMonth')}`;
        if(installMonthOption)
            solution.installMonth = new Date(installMonthOption);

        return solution;
    }


    function defaultSolution() {
        // todo: this should ideally be calculated to be set to a configuration that the majority of customers will prefer
        // heuristic calculation might be possible using sales history?
        // If we can initialise this such that customers can get a price **without having to change anything**, we should do this.

        console.log(`earliestInstall: ${earliestInstall}`);

        const defaultSolution = {
            batterySize_kWh: 5,
            evCharger: {
                included: true,
                capacity_kwh: 7
            },
            installMonth: earliestInstall
        }

        return defaultSolution;
    }
</script>

<div>
    <!-- todo: build form options from product database -->
    <form on:change={updateQuote}>
        Battery capacity:

        <select bind:value={customerSolution.batterySize_kWh}>
            <option value={5}>5 kWh</option>
            <option value={10}>10 kWh</option>
            <option value={20}>20 kWh</option>
        </select>

        <br>

        Add EV charger <input type="checkbox" bind:checked={customerSolution.evCharger.included}>

        <br>

        <label for="install-month">Preferred Installation Date:</label>
        <input bind:value={installDateStr} type="month" id="install-month" name="install-month" min={earliestInstall.toISOString().slice(0, 7)}>
        <br>
        <br>
    </form>

    {#if quote.discount.value > 0}
        Preorder discount: {discountStr}% off
        <br>
        -£{quote.discount.value.toFixed(2)}
    {/if}
    <p>Total price: £{quote.price.total.toFixed(2)}</p>
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