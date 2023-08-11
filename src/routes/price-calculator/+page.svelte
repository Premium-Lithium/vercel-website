<script>
    import { page } from '$app/stores'
    import priceOf from './price-model';

    // todo: add default options here if they're not provided in query params
    let batterySize_kWh = `${$page.url.searchParams.get('battSize_kWh')}`;
    let evCharger = `${$page.url.searchParams.get('evCharger')}` == "1";
    let priceText = "Calculating..."

    // todo: handle invalid input in the url e.g battery size that doesn't exist? init with nearest?

    function fetchPrice() {
        // todo: build complete description of customer solution using form input
        const customerSolution = {
            batterySize_kWh: parseInt(batterySize_kWh, 10),
            evCharger: evCharger
        };

        priceText = `$${priceOf(customerSolution).total}`;
    }

    $: fetchPrice();
</script>

<div>
    <!-- todo: build form options from product database -->
    <form on:change={fetchPrice}>
        <select bind:value={batterySize_kWh}>
            <option value="5">5 kWh</option>
            <option value="10">10 kWh</option>
            <option value="20">20 kWh</option>
        </select>

        <input type="checkbox" bind:checked={evCharger}> Add EV charger
    </form>

    <p>Total price: {priceText}</p>
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