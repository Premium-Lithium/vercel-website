<script>
    import Check from "svelte-material-icons/Check.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    import { DealStatus } from '@prisma/client';
    

    export let data
    let installer_id = 1;
    console.log(data);

    let acceptedDeals = data.data.Deals
        .filter((deal) => deal.status == DealStatus.ACCEPTED)
    let pendingDeals = data.data.Deals
        .filter((deal) => deal.status == DealStatus.PENDING)
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
    margin: 10px;
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
              <Close/>
              <Check/>
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
          Deal location
      </div>
    </div>
    {/each}
</div>

