<script>
    import { page } from "$app/stores";
    import { DealStatus } from '@prisma/client';

    export let data;
    console.log(data)
    let status = data.data.status;
    let dealId = data.deal_id;

    async function acceptLead() {
        const acceptUrl = `${$page.url.origin}/api/installer/leads/accept-lead`

        const res = await fetch(acceptUrl, {
            method: 'POST',
            body: JSON.stringify({
                "deal_id": dealId,
            }),
        })
    }

    async function rejectLead() {
        const rejectUrl = `${$page.url.origin}/api/installer/leads/reject-lead`

        console.log("Before the fetch")
        const res = await fetch(rejectUrl, {
            method: 'POST',
            body: JSON.stringify({
                "deal_id": dealId,
            }),
        })
    }

</script>
this is the deal page for {data.data.deal_id}
<div>
    <ul>
        <li>Customer Name: {data.data.Job.customerName}</li>
        <li>Address: {data.data.Job.address}</li>
        <li>Postcode: {data.data.Job.postcode}</li>
        {#if status === DealStatus.PENDING}
            <button type="button" on:click={acceptLead}>Accept</button>
            <button type="button" on:click={rejectLead}>Reject</button>
        {/if}
        
    </ul>
</div>
