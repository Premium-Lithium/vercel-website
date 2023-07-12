<script>
	import Chevron from "./chevron.svelte";

  let showInfo = 'contact';
  let chevronParent;
  let transformStyle = '';
</script>

<div class="labels">

  <div class='done label' on:click={() => {
    showInfo = 'contact';
    transformStyle='translate(1%)';
  }}
  >Contact</div>

  <div class='done label' on:click={() => {
    showInfo = 'quote';
    transformStyle='translate(26%)';
  }}>Quote</div>

  <div class='done label' on:click={() => {
    showInfo = 'schedule';
    transformStyle='translate(51%)';
  }}>Schedule</div>

  <div class='done label' on:click={() => {
    showInfo = 'done';
    transformStyle='translate(77%)';
  }}>Done</div>

</div>

<div class="steps">
  <div class={showInfo === 'contact' ? 'done active' : 'done'}></div>
  <div class={showInfo === 'quote' ? 'done active' : 'done'}></div>
  <div class={showInfo === 'schedule' ? 'done active' : 'done'}></div>
</div>

<div on:bind={chevronParent} style="transform: {transformStyle};">
  <Chevron />
</div>

<div class="speech">
    {#if showInfo == 'contact'}
    <input type="checkbox" id="contacted" name="contacted" value="contacted">
    Customer has been called
    {:else if showInfo == 'quote'}
    <input type="checkbox" id="contacted" name="contacted" value="contacted">
    Quote has been provided
    {:else if showInfo == 'schedule'}
    <input type="checkbox" id="contacted" name="contacted" value="contacted">
    Installation has been scheduled
    {:else if showInfo == 'done'}
    <input type="checkbox" id="contacted" name="contacted" value="contacted">
    Installation complete
    {/if}
</div>

<style>
    body {
        font-size: 1em;
    }

    .steps {
        display: table;
        padding-bottom: 12px;
        table-layout: fixed;
        width: 75%;
        margin: auto;
        counter-reset: total 1 done 1;
    }
    .steps > * {
        counter-increment: total;
        position: relative;
        height: 0.25em;
        top: 0.375em;
        display: table-cell;
        background: lightGray;
    }
    .steps > *::before {
        content: "";
        background: lightGray;
        position: absolute;
        left: 0;
        top: -0.375em;
        height: 1em;
        width: 0.5em;
        border-radius: 0 1em 1em 0;
    }
    .steps > *::after {
        content: "";
        background: lightGray;
        position: absolute;
        top: -0.375em;
        right: 0;
        height: 1em;
        width: 0.5em;
        border-radius: 1em 0 0 1em;
    }
    .steps > *:first-child::before {
        background: #28AAE2;
        position: absolute;
        top: -0.375em;
        left: -0.5em;
        height: 1em;
        width: 1em;
        border-radius: 50%;
    }
    .steps > *:last-child::after {
        position: absolute;
        top: -0.375em;
        right: -0.5em;
        height: 1em;
        width: 1em;
        border-radius: 50%;
    }
    .steps > *.done {
        counter-increment: total done;
        background: #28AAE2;
    }
    .steps > *.done::before {
        background: #28AAE2;
    }
    .steps > *.done::after {
        background: #28AAE2;
    }
    .steps > *.done + *::before {
        background: #28AAE2;
    }

    .intervals {
        display: table;
        table-layout: fixed;
        width: 75%;
        margin: auto;
    }
    .intervals > * {
        display: table-cell;
        text-align: center;
    }
    .intervals > *.done {
        color: #28AAE2;
    }

    .labels {
        display: table;
        table-layout: fixed;
        width: 100%;
        margin: auto;
    }
    .labels > * {
        display: table-cell;
        text-align: center;
    }
    .labels > *.done {
        color: #28AAE2;
    }
    .labels > .label {
        padding-bottom: 0.5em;
    }

    .count {
        display: none;
        text-align: center;
        font-size: 3em;
    }
    .count .done-count::after {
        color: #28AAE2;
        content: counter(done);
    }
    .count .total-count::after {
        content: counter(total);
    }

    @media (max-width: 30em) {
        .steps {
            width: 0;
            overflow: hidden;
        }

        .count {
            display: block;
        }

        .intervals, .labels {
            display: none;
        }
    }

  .speech {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* border:#aaaaaa solid 1px; */
    font-size: 1.1em;
    color: black;
    background: #efefef;
    position: relative;
    padding: 15px;
    border-radius: 10px;
    margin-top: 0px;
    margin-left: -20px;
    margin-right: -20px;
  }
</style>