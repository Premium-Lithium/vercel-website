<script lang="typescript">
	import { afterUpdate, onMount } from "svelte";
    export let price = 12345;
    export let yearlySavings = 1234;
    export let expandText = ["You invest", "You save"];
    // import from svelte material icons
    import ChevronDoubleUp from "svelte-material-icons/ChevronDoubleUp.svelte"
    import ChevronDoubleDown from "svelte-material-icons/ChevronDoubleDown.svelte"

    const currency = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    let expandOpen;
    $: expandOpen = true;

    let barHeight;

    function expandClicked() {
        if (expandOpen) {
            // close
        } else {
            // open
        }
        expandOpen = !expandOpen;
    }

</script>
<div class="main-bar" bind:clientHeight={barHeight}>

{#if !expandOpen}
<div class=body >
    <div class="expandText">
        <div class=left-text>
            <p class="bottom-text">{expandText[0]}</p>
            <p class=bottom-text>{currency.format(price) }</p>
        </div>
        <div class="divider">
        </div>
        <div class=right-text>
            <p class="bottom-text">{expandText[1]}</p>
            <p>{currency.format(yearlySavings)} / yr</p>
        </div>
    </div>
    <div class=expand-icon-spacing>

    </div>
        
    

</div>

{:else}
<div class=long-body>
    <div class="expandText">
        <div>
            <p class="bottom-text">{expandText[0]}</p>
            <p class="bottom-text">{currency.format(price) }</p>
            <br>
            <p class="bottom-text">Payback time</p>
            <p class="bottom-text">12 years 13 months</p>
        </div>
        <div class="divider">
        </div>
        <div>
            <p class="bottom-text">{expandText[1]}</p>
            <p class="bottom-text">{currency.format(yearlySavings)} / yr</p>
            <br>
            <p class="bottom-text">Expected delivery</p>
            <p class="bottom-text">May 2025</p>
        </div>
    </div>
    <div class=bottom-div>
        <div>
            <p>These are estimates based on national averages
                To get a more detailed estimate, do something idk
            </p>
        </div>
        <div class=expand-icon-spacing></div>
    </div>
   
</div>
{/if}
<button class="expand-icon" on:click={expandClicked}>
    {#if expandOpen}
        <ChevronDoubleDown height=100% width=100% color=#e6e6e6/>
    {:else}
        <ChevronDoubleUp height=100% width=100% color=#e6e6e6 class=chevron/>
    {/if}
    
</button>
</div>
<style>
    .bottom-div {
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        height: 84px
    }
    .main-bar {
        position: relative;
        width: 100%;
    }

    :root {
        --expand-bg-color: #6d6c6c;
        --infobox-highlight-color: var(--plblue);
        --expand-active-shadow: #6d6c6c;
        --divider-shadow-color: rgba(40, 170, 226, 0.4);
        --text-color: white;
    }
    
    .body {
        display: flex;
        bottom: 0;
        background-color: var(--expand-bg-color);
        height: 100%;
        border-radius: 10px;
        margin: 0 0.5%;
    }

    .long-body {
        position: absolute;
        display: flex;
        bottom: 0;
        background-color: var(--expand-bg-color);
        width: 99%;
        margin: 0 0.5%;
        border-radius: 10px;
        flex-direction: column;
        
    }

    .expand-icon {
        background-color: var(--plblue);
        width: 5rem;
        height: 100%;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        border-radius: 5px;
        box-shadow: none;
        border: none;
        transition: 0.1s;
        bottom: 0;
        position: absolute;
        right: 0;
        margin-right: 0.5%;;
    }
    .expand-icon:active {
        box-shadow: inset 0 0 2px 2px var(--expand-active-shadow);
    }
    .expand-icon-spacing {
        flex: 0 0 5rem;
        display: inline;
    }

    .expandText {
        width:100%;
        display: grid;
        grid-template-columns: 1fr 1px 1fr;
        place-items: center;
    }

    .divider {
        background-color: var(--plblue);
        width: 1px;
        height: 75%;
        border-radius: 1px;
        box-shadow: 0 0 1px 2px var(--divider-shadow-color);
    }

    .bottom-text {
        text-align: center;
        margin: 0.4em;

    }
    p {
        color: var(--text-color);
        margin: auto;
    }
</style>
