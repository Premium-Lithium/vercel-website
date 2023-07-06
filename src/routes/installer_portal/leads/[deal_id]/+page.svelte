<script>
    export let data;
    console.log(data)
    let accepted = data.data.accepted;

</script>
this is the deal page for {data.data.deal_id}
<div>
    <ul>
        <li>Customer Name: {data.data.Job.customerName}</li>
        <li>Address: {data.data.Job.address}</li>
        <li>Postcode: {data.data.Job.postcode}</li>
        <li>Accepted: <input type="checkbox" bind:checked={accepted}></li>
        
    </ul>
</div>
