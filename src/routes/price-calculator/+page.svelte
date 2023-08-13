<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';

    import { earliestInstallMonth, quoteFor } from './price-model';

    const thisMonth = new Date();
    let customerSolution = loadSolution();
    let quote = quoteFor(customerSolution);
    let discountStr = "Calculating discount...";


    function updateQuote() {
        quote = quoteFor(customerSolution);
        discountStr = (Number(quote.discount.multiplier) * 100).toFixed(0)

        // todo: construct table of components here
    }

    $: updateQuote();

    onMount(() => {
        limitInstallDateRange();
    });


    function limitInstallDateRange() {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 2; // +1 to get next month, +1 because JS months are 0-indexed

        if (month > 12) {
            month = 1; // Reset to January
            year++;    // Move to the next year
        }

        const nextMonth = month.toString().padStart(2, '0');

        // Set the min attribute of the month input
        document.getElementById('install-month').setAttribute('min', `${year}-${nextMonth}`);

        // todo: handle case where user has selected a month that is now out of range
    }

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

        return solution;
    }

    function defaultSolution() {
        // todo: this should ideally be calculated to be set to a configuration that the majority of customers will prefer
        // heuristic calculation might be possible using sales history?
        // If we can initialise this such that customers can get a price **without having to change anything**, we should do this.

        const defaultSolution = {
            batterySize_kWh: 5,
            evCharger: {
                included: true,
                capacity_kwh: 7
            },
            installMonth: earliestInstallMonth()
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
        <input bind:value={customerSolution.installMonth} type="month" id="install-month" name="install-month">
        <br>
        <br>
    </form>

    Preorder discount: {discountStr}% off - £{quote.discount.value.toFixed(2)}
    <p>Total price: {quote.price.total}</p>
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