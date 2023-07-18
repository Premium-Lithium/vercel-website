<script>
    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";

    import Check from "svelte-material-icons/Check.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    import Timeline from "./timeline.svelte";
    import Accordian from "./Accordian.svelte";
    import { slide } from "svelte/transition"; 

    export let data;

    let acceptedDeals;
    let pendingDeals;
    let possibleFilters = ["ACCEPTED","REJECTED","PENDING"];
    let filters = [...possibleFilters];

    let failedLoad = (data.data === null);
    if (failedLoad) {
        console.log("failed to load")
    } else {
        $: acceptedDeals = data.data.Deals
            .filter((deal) => deal.status === 'ACCEPTED')
        $: pendingDeals = data.data.Deals
            .filter((deal) => deal.status === 'PENDING')
    }



    async function acceptLead(dealId) {
        const acceptUrl = `${$page.url.origin}/api/installer/leads/accept-lead`

        const res = await fetch(acceptUrl, {
            method: 'POST',
            body: JSON.stringify({
                "deal_id": dealId,
            }),
        })

        invalidateAll();
    }

    async function rejectLead(dealId) {
        const rejectUrl = `${$page.url.origin}/api/installer/leads/reject-lead`

        console.log("Before the fetch")
        const res = await fetch(rejectUrl, {
            method: 'POST',
            body: JSON.stringify({
                "deal_id": dealId,
            }),
        });

        const data = await res.json();

        invalidateAll();
    }
</script>

This is the lead view
{#if failedLoad}
    Failed Load
{:else}
<div class="container">
  <div class="filter-container">
    {#each possibleFilters as filter}
    <div class="filter">
      <label>
        <input type="checkbox" bind:group={filters} name="filters" value={filter} checked="checked"/>
        <span class="checkmark"></span>
      </label>
    </div>
    {/each}
  </div>
  

  <div class="title">New Leads:</div>
    {#each pendingDeals as deal}
    {#if filters.includes(deal.status)}
    <div class="deal-container" transition:slide>
        <div class="deal-header">
            <a href="/installer_portal/leads/{deal.id}" class="deal-link">{deal.Job.customerName ?? "Customer"} at {deal.Job.postcode.toString().toUpperCase()} ...</a>
          <div>
              <a href="" on:click={async () => await rejectLead(deal.id)}>
                  <Close/>
              </a>
              <a href="" on:click={async () => await acceptLead(deal.id)}>
                  <Check/>
              </a>
          </div>
        </div>
    </div>
    {/if}
    {/each}

  <div class="title">Accepted Leads:</div>
    {#each acceptedDeals as deal}
    {#if filters.includes(deal.status)}
    <div class="deal-container" transition:slide>
      <Accordian>
      <div class="deal-header" slot="head">
        <a href="/installer_portal/leads/{deal.id}" class="deal-link">{deal.Job.customerName ?? "Customer"} at {deal.Job.postcode.toString().toUpperCase()}</a>
      </div>
      <div slot="details">
          <hr class="divider">
          <div>
            <Timeline/>
          </div>
      </div>
      </Accordian>
    </div>
    {/if}
    {/each}
</div>
{/if}

<style>
  /* Container Styles */
  .container {
    max-width: 400px;
    margin: 0 auto;
    background-color: #E3F4FB;
    border-radius: 8px;
    padding: 20px;
  }

  .filter {
    display: block;
    position: relative;
    height: 25px;
    width: 25px;
    border-radius: 50%;
    margin: 10px;
    display: inline-block;
    background-color: #28AAE2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .filter input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    border-radius: 50%;
  }

  .filter:hover input ~ .checkmark {
     background-color: #248fbd;
  }

  .filter input:checked ~ .checkmark {
    background-color: #248fbd
  }
  

  /* Title Styles */
  .title {
    font-family: 'Roboto', sans-serif;
    font-size: 24px;
    font-weight: 500;
    color: #1C2428;
    margin-bottom: 10px;
  }

  /* List Styles */
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  /* Deal Styles */
  .deal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .deal-container {
    max-width: 400px;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #cccccc;
    padding: 20px;
    padding-bottom: 0px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .deal-link {
    color: #007bff;
    text-decoration: none;
  }

  .divider {
    margin-top: 15px;
    margin-bottom: 30px;
    border: 1px solid #ededed;
  }
</style>
