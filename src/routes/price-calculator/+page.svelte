<script>
    import { page } from '$app/stores'
    import priceOf from './price-model';

    // todo: add default options here if they're not provided in query params
    let batterySize_kWh = `${$page.url.searchParams.get('battSize_kWh')}`;
    let evCharger = `${$page.url.searchParams.get('evCharger')}` == "1";
    let price = "Calculating...";

    function fetchPrice() {
        // todo: build complete description of customer solution using form input
        const customerSolution = {
            batterySize_kWh,
            evCharger
        };

        price = `$${priceOf(customerSolution)}`;
    }

    $: fetchPrice();
</script>

<div>
    <form on:change={fetchPrice}>
        <select bind:value={batterySize_kWh}>
            <option value="5">5 kWh</option>
            <option value="10">10 kWh</option>
            <option value="20">20 kWh</option>
        </select>

        <input type="checkbox" bind:checked={evCharger}> Add EV charger
    </form>

    <p>Total price: {price}</p>
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