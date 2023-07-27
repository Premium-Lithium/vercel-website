<script>
    import { page } from '$app/stores'

    let selected;

    async function sendReason(email, reason){
        const unsubscribeUrl = `unsubscribe/`;
        const res = await fetch(unsubscribeUrl, {
            method: 'POST',
                headers: {
                   "Content-Type": "application/json"
                }, 
                body: JSON.stringify({
                    "values": [email, reason],
                }),
            });
            
            const response = await res.json();
            return response;
    }

</script>

<div class=body>        
    <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
    <div class="unsub-text">
        <h2>It appears you want to be removed from our 5list of approved installers who are interested in growing their bussiness</h2>
        <h2>Can you please tell us why this may be?</h2>
    </div>
    <select bind:value={selected} id="reason" name="reasons">
        <option value="too far away">The Jobs are too far away from me.</option>
        <option value="not qualified/certified">I am not qualified / certified to do these jobs</option>
        <option value="no capacity for installing">I have no capacity for installing Premium Lithium</option>
        <option value="Like to speak before accepting a job">I'd like to speak to premium lithium before accepting a job.</option>
        <option value="prefer not to say">Prefer not to say</option>
    </select>

    <input type='submit' value="Submit" on:click={
       async () => {
            const email = $page.url.searchParams.get('email');
            await sendReason(email, selected);
        }
    }>
</div>

<style>
    .body {
        margin: auto;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .unsub-text > h2 {
        font-size: 1.5em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
    }
  
    .logo{
        position: absolute;
        align-self: center;
        top: 0;
    }

    label{
        font-size: 1.5em;
        text-align: center;
        font-family: 'Roboto', sans-serif; 
    }

    select {
            font-size: 1.5em;
            padding: 10px;
            border: 2px solid #ccc;
            border-radius: 5px;
            background-color: #fff;
            color: #333;
            width: 700px;
            max-width: 100%;
        }

    input[type="submit"] {
        font-size: 2em;
        font-family: 'Roboto', sans-serif;
        border: 1px solid #000;
        height: auto;
        width: 200px;
        align-self: center;
        padding: 10px 5px;
        margin-top: 30px;
        border-radius: 5px;
    }


</style>

   