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
    $: expandOpen = false;

    let barBody;
    let infoPane;

    $: infoPane && infoPane.style.setProperty('bottom', pos + "px")
    let pos;
    afterUpdate(() => {
        pos = barBody.offsetHeight * 2;
    });

    function expandClicked() {
        if (expandOpen) {
            // close
        } else {
            // open
        }
        expandOpen = !expandOpen;
    }

    
</script>
<div class="main-bar" bind:this={barBody}>

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
        
    <button class="expand-icon" on:click={expandClicked}>
        {#if expandOpen}
            <ChevronDoubleDown height=100% width=100% color=#e6e6e6/>
        {:else}
            <ChevronDoubleUp height=100% width=100% color=#e6e6e6 class=chevron/>
        {/if}
        
    </button>

</div>
</div>
<style>
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
        width: 99%;
        height: 99%;
        margin: 0.5%;
        border-radius: 10px;
    }

    .open {
        bottom: 0;
        position: absolute;
        height: auto;
        display: flex;
        background-color: var(--expand-bg-color);
        width: 99%;
        margin: 0.5%;
        border-radius: 10px;
    }

    .expand-icon {
        background-color: var(--plblue);
        height:100%;
        width: 5rem;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        border-radius: 5px;
        box-shadow: none;
        border: none;
        transition: 0.1s;
        bottom: 0;

    }
    .expand-icon:active {
        box-shadow: inset 0 0 2px 2px var(--expand-active-shadow);
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
    .info-pane {
        width: 99%;
        height: 20em;
        background-color: var(--expand-bg-color);
        position: absolute;
        border-radius: 5px;
        box-shadow: inset 0 0 2px 2px var(--infobox-highlight-color);
        margin: 0.5%;
    }

    p {
        color: var(--text-color);
        margin: auto;
    }
</style>
