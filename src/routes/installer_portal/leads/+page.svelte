<script>
    import { DealStatus } from '@prisma/client';

    export let data
    let installer_id = 1;
    console.log(data);

    let acceptedDeals = data.data.Deals
        .filter((deal) => deal.status == DealStatus.ACCEPTED)
    let pendingDeals = data.data.Deals
        .filter((deal) => deal.status == DealStatus.PENDING)
</script>

<div>Hello {data.data.name},</div>
<div>your installer id is: {installer_id}</div>
<input type="number" bind:value={installer_id}/>
<div>New Leads:</div>
<ul>
{#each pendingDeals as deal}
    <li><a href="/installer_portal/leads/{deal.id}">Deal at {deal.Job.postcode}</a></li>
{/each}
</ul>
<div>Accepted Leads:</div>
<ul>
{#each acceptedDeals as deal}
    <li><a href="/installer_portal/leads/{deal.id}">Deal at {deal.Job.postcode}</a></li>
{/each}
</ul>

