<script lang="typescript">
	import { afterUpdate, onMount } from "svelte";
    export let price = 12345;
    export let yearlySavings = 1234;
    export let expandText = ["You invest", "You save"];
    // import from svelte material icons
    import ChevronDoubleUp from "svelte-material-icons/ChevronDoubleUp.svelte"

    const currency = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });


    
</script>

<div class=body>
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
        
    <div class="expand-icon">
        <ChevronDoubleUp height=100% width=100% color=#e6e6e6 class=chevron/>
        
    </div>

</div>

<style>
    /* should fill div it is placed in */
    .body {
        display: flex;
        background-color: #6d6c6c;
        width: 99%;
        height: 99%;
        margin: 0.5%;
        border-radius: 10px;
    }

    .expand-icon {
        background-color: var(--plblue);
        height:100%;
        width: 5rem;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
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
        box-shadow: 0 0 1px 2px rgba(40, 170, 226, 0.4);
    }

    .bottom-text {
        text-align: center;
        margin: 0.4em;

    }

    p {
        color: white;
        margin: auto;
    }
</style>
