<script>
    import { page } from "$app/stores";

    export let data;
    console.log(data)
    let accepted = data.data.accepted;
    let dealId = data.deal_id;

    async function acceptLead() {
        const acceptUrl = `${$page.url.origin}/api/installer/leads/accept-lead`
        console.log(acceptUrl)

        const res = await fetch(acceptUrl, {
            method: 'POST',
            body: JSON.stringify({
                "deal_id": dealId,
            }),
        })
        const json = await res.json();
        //result = JSON.stringify(json)
    }

</script>
this is the deal page for {data.data.deal_id}
<div>
    <ul>
        <li>Customer Name: {data.data.Job.customerName}</li>
        <li>Address: {data.data.Job.address}</li>
        <li>Postcode: {data.data.Job.postcode}</li>
        {#if !accepted}
            <button type="button" on:click={acceptLead}>Accept lead</button>
        {/if}
        
    </ul>
</div>
