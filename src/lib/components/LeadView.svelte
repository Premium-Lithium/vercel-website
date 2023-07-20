<script>
    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";

    import Check from "svelte-material-icons/Check.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    
    import Timeline from "./timeline.svelte";
    import Accordian from "./Accordian.svelte";
    import Filter from "./Filter.svelte";
    import Modal from "./Modal.svelte";

    import { slide } from "svelte/transition"; 

    export let data;
    
    let possibleFilters = ["REJECTED", "ACCEPTED", "PENDING"];
    let currentFilters = [...possibleFilters];
    let acceptedDeals;
    let pendingDeals;

    let rejectModal = false;
    let acceptModal = false;
    let rejectDialog = false;
    let acceptDialog = false;

    let currentDealId = -1;

    let failedLoad = (data.data === null);
    $: {
      if (failedLoad) {
        console.log("failed to load")
      } else {
        acceptedDeals = data.data.Deals
            .filter((deal) => deal.status === 'ACCEPTED')
        pendingDeals = data.data.Deals
            .filter((deal) => deal.status === 'PENDING')
      }
    }

    function openAcceptModal(deal) {
      acceptModal=true;
      currentDealId = deal.id;
    }

    function openRejectModal(deal) {
      rejectModal=true;
      currentDealId = deal.id;
    }

    async function acceptLead(dealId) {
      // Update the client-side acceptedDeals and pendingDeals list
      // while we wait for a response from server.
      acceptedDeals = acceptedDeals.concat(pendingDeals.filter((deal) => deal.id === dealId));
      pendingDeals = [...pendingDeals].filter((deal) => deal.id !== dealId);
      const acceptUrl = `${$page.url.origin}/api/installer/leads/accept-lead`

      const res = await fetch(acceptUrl, {
          method: 'POST',
          body: JSON.stringify({
              "deal_id": dealId,
          }),
      })

      const response = await res.json();
      await invalidateAll();
    }

    async function rejectLead(dealId) {
      // Update the client-side pendingDeals list, while we wait for a response from server.
      pendingDeals = [...pendingDeals].filter((deal) => dealId !== deal.id);
      const rejectUrl = `${$page.url.origin}/api/installer/leads/reject-lead`

      const res = await fetch(rejectUrl, {
          method: 'POST',
          body: JSON.stringify({
              "deal_id": dealId,
          }),
      });

      const response = await res.json();
      await invalidateAll();
    }
</script>

This is the lead view
{#if failedLoad}
    Failed Load
{:else}

<Modal bind:showModal={rejectModal} bind:dialog={rejectDialog}>
  <h2 slot="header" class="modal-header">
    Are you sure you want to reject this lead?
  </h2>
  <div class="modal-outer">
    <button on:click={() => {rejectDialog.close()}}>no</button>
    <button on:click={async () => {rejectDialog.close(); await rejectLead(currentDealId)}}>yes</button>
  </div>
</Modal>

<Modal bind:showModal={acceptModal} bind:dialog={acceptDialog}>
  <h2 slot="header" class="modal-header">
    Are you sure you want to accept this lead?
  </h2>
  <div class="modal-outer">
    <button on:click={() => {acceptDialog.close()}}>no</button>
    <button on:click={async () => {acceptDialog.close(); await acceptLead(currentDealId)}}>yes</button>
  </div>
</Modal>

<div class="container">
    <Filter bind:currentFilters bind:possibleFilters/> 

  <div class="title">New Leads:</div>
    {#each pendingDeals as deal (deal.id)}
    {#if currentFilters.includes(deal.status)}
    <div class="deal-container" transition:slide>
        <div class="deal-header">
            <a href="/installer_portal/leads/{deal.id}" class="deal-link">{deal.Job.customerName ?? "Customer"} at {deal.Job.postcode.toString().toUpperCase()} ...</a>
          <div>
              <a href="" on:click={() => {openRejectModal(deal)}}>
                  <Close/>
              </a>
              <a href="" on:click={() => {openAcceptModal(deal)}}>
                  <Check/>
              </a>
          </div>
        </div>
    </div>
    {/if}
    {/each}

  <div class="title">Accepted Leads:</div>
    {#each acceptedDeals as deal (deal.id)}
    {#if currentFilters.includes(deal.status)}
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
      <div slot="open">+</div>
      <div slot="close">-</div>

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

  .filter-container {
    margin-top:-20px;
  }

  /* Modal Styles */

  .modal-header {
    font-family: 'Roboto', sans-serif;
    font-size: 24px;
    font-weight: 500;
    color: #1C2428;
    margin-bottom: 10px;
  }

  .modal-outer {
    display: flex;
    justify-content: space-between;
    padding: 5px;
  }

</style>
