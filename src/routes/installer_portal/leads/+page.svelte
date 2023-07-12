<script>
    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";

    import Check from "svelte-material-icons/Check.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    import Timeline from "./timeline.svelte";


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
  .logo {
    max-width: 400px;
    display: flex;
    margin: 0 auto;
    align-self: center;
  }

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
</style>

<img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
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
      <div class="deal-header">
        <a href="/installer_portal/leads/{deal.id}" class="deal-link">{deal.Job.customerName ?? "Customer"} at {deal.Job.postcode.toString().toUpperCase()}</a>
      </div>
      <hr class="divider">
      <div>
        <Timeline/>
      </div>
    </div>
    {/each}
</div>

