<script lang="ts">
    import { slide, fly, scale, fade } from 'svelte/transition';
    
    export let params;
    $: console.log($params.offPeakTariff);
    
</script>


<div class="refine-body">
    <p>Refine your quote</p>
    <table>
        <tr>
            <td colspan="2">
                <label>Off peak tariff<br><input type="checkbox" bind:checked={$params.offPeakTariff}></label>
            </td>
        </tr>
        <tr>
            {#if $params.offPeakTariff === true}
            
                <td in:fly={{x: "30%"}}>
                    <label>Day rate<br>£<input type="number" step=0.01 bind:value={$params.dayTariffRate}> /kWh</label>
                </td>
                <td in:fly={{x: "-30%"}}>
                    <label>Night rate<br>£<input type="number" step=0.01 bind:value={$params.nightTariffRate}> /kWh</label>
                </td>
            {:else if $params.offPeakTariff === false}
                <td colspan="2" in:scale={{}}>
                    <label>Tariff rate<br>£<input type="number" step=0.01 bind:value={$params.dayTariffRate}> /kWh</label>
                </td>
            {/if}
        </tr>
        <tr>
            <td>
                <label>Solar tariff type
                    <input type="checkbox" bind:checked={$params.solarTariffSEG}>
                </label>
            </td>
            <td>
                <label>Solar tariff rate<br>
                    <input type="number" step=0.01 bind:value={$params.solarTariffType}>

                </label>
                
            </td>
            </tr>
        <tr>
            <td colspan="2">
                <label>Installation date
                    <input>
                </label>
                
            </td>
        </tr>
    </table>
    
</div>

<style>
    .refine-body {
        width: 100%;
        height: auto;
        text-align: center;
        border-top: 1px solid black
    }

    p, label {
        color: white;
        transition-duration: 0.5s;
    }

    input {
        appearance: textfield;
        min-width: 40%;
        width: 40%;
        border-radius: 0.4em;
        font-size: large;
        text-align: center;
    }
    table, tr, td {
        text-align: center;
        margin: auto;
        transition-duration: 0.5s;
    }

</style>