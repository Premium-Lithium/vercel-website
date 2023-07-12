<script>
    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";

    import Check from "svelte-material-icons/Check.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    import Timeline from "./timeline.svelte";
    import Accordian from "./Accordian.svelte";


    export let data
    let installer_id = 1;
    console.log(data);

    let acceptedDeals;
    let pendingDeals;

    $: acceptedDeals = data.data.Deals
        .filter((deal) => deal.status === 'ACCEPTED')
    $: pendingDeals = data.data.Deals
        .filter((deal) => deal.status === 'PENDING')

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

<style>
  /* Global Styles */
  body {
    background-color: #fcfcfc;
    padding: 20px;
    font-weight: 200
  }

  /* Container Styles */
  .container {
    max-width: 400px;
    margin: 0 auto;
    background-color: #fcfcfc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Title Styles */
  .title {
    font-family: 'Roboto', sans-serif;
    font-size: 24px;
    font-weight: 500;
    color: #333333;
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
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .deal-link {
    color: #007bff;
    text-decoration: none;
  }

  .divider {
    margin-left: -20px;
    margin-right: -20px;
    margin-top: 15px;
    margin-bottom: 30px;
    border: 2px solid #ededed;
  }
</style>

<div class="container">
  <div class="title">Hello {data.data.name},</div>

  <div class="title">New Leads:</div>
    {#each pendingDeals as deal}
    <div class="deal-container">
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
    {/each}

  <div class="title">Accepted Leads:</div>
    {#each acceptedDeals as deal}
    <div class="deal-container">
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
    {/each}
</div>

