<script lang="typescript">
	import { afterUpdate, onMount } from "svelte";
    import { slide, blur } from "svelte/transition";
    export let price = 12345;
    export let yearlySavings = 1234;
    export let expandText = ["You invest", "You save"];
    // import from svelte material icons
    import ChevronDoubleUp from "svelte-material-icons/ChevronDoubleUp.svelte"
    import ChevronDoubleDown from "svelte-material-icons/ChevronDoubleDown.svelte"
    import ChevronUp from "svelte-material-icons/ChevronUp.svelte"
	import { afterNavigate } from "$app/navigation";

    

    // change tariff rates
	import SavingsRefineParams from "./SavingsRefineParams.svelte";

    export let params;
    export let fixedOpen = false;

    $: if (fixedOpen) expandOpen = true;
    
    const currency = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    let refineOpen;
    refineOpen = false;

    let expandOpen;
    $: expandOpen = fixedOpen;

    let barHeight;
    
    function expandClicked() {
        expandOpen = !expandOpen;
    }

    function refineClicked() {
        refineOpen = !refineOpen;
    }

</script>

<div id="savings-bar"class="main-bar" bind:clientHeight={barHeight}>

{#if !expandOpen}
<div class=body out:blur={{amount:10, delay:100}}>
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
<div class=long-body transition:slide={{delay: 50, duration: 350, axis: "y"}}>
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
    <div class="expand-assumptions">
        <h2>Based on ..</h2>
        <p class="assumption-text">
            £0.30 / kwh average energy cost<br>
            £0.08 solar energy tariff<br>
            Maximum delivery discount

        </p>
    </div>
    <div class="adjust-savings">
        
        {#if refineOpen}
        <div class="refine-div">
            <SavingsRefineParams params={params}/>
        </div>
        {/if}
        <button class="expand-adjust" on:click={refineClicked}>
            <ChevronUp width="100px"/><br>
            Refine my quote
        </button>
        
        
        <!--
            <SavingsRefineParams params={params}/>
        -->
    </div>
   
    <div class=bottom-div>
        <div>
            <p class="disclaimer">Estimates are dependent on the accuracy of information supplied,
                and are subject to change based on a thorough survey of your property
            </p>
        </div>
        {#if !fixedOpen}
        <div class=expand-icon-spacing></div>
        {/if}
    </div>
   
</div>
{/if}

{#if !fixedOpen}
    <button class="expand-icon" on:click={expandClicked}>
        {#if expandOpen}
            <ChevronDoubleDown height=100% width=100% color=#e6e6e6/>
        {:else}
            <ChevronDoubleUp height=100% width=100% color=#e6e6e6 class=chevron/>
        {/if}
    </button>
{/if}

</div>
<style>
    .refine-div {
        width: 100%;
        z-index:1;
        position: absolute;
        background: grey;
        bottom: 100%;
        border-radius: 5px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }
    .expand-adjust {
        height: 3em;
        width: 100%;
        margin: auto;
        text-align: center;
        background: none;
        border: none;
        border-radius: 5px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }
    .adjust-savings {
        position: relative;
        margin: auto;
        width: 90%;
        text-align: center;
        height: 3em;
        overflow: visible;

    }
    .disclaimer {
        font-size: 0.8em;
        text-align: center;
    }
    .assumption-text {
        opacity: 0.8;
    }
    .expand-assumptions {
        width: 100%;
        text-align: center;
    }
    h2 {
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
        border-bottom: 1px solid var(--divider-shadow-color);
        font-size: 1em;
        font-weight: normal;
        color: var(--text-color);
        text-align: center;

    }
    .bottom-div {
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        height: 84px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }
    .main-bar {
        position: relative;
        width: 100%;
    }

    #savings-bar {
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
        width: 10vh;
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
        flex: 0 0 10vh;
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
