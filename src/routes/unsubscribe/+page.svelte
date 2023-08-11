<script>
    import { page } from '$app/stores'
    import { supabase } from '$lib/supabase.ts'

    let selected;
    let otherReason;
    let sent = false; 

    async function sendReason(email, reason){
        const { error } = await supabase
            .from('unsubscribed')
            .insert({
                email: email,
                reason: reason,
            })
    }

</script>

{#if sent === false}
    <div class=body>        
        <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
        <div class="unsub-text">
            <h2>Why would you like to unsubscribe?</h2>
        </div>
        <div class=select>
            <div>
            <input type="radio" id="reason1" name="reasons" value="too far away" bind:group={selected} />
            <label for="reason1">The Jobs are too far away from me.</label>
            </div>
            <div>
            <input type="radio" id="reason2" name="reasons" value="not qualified/certified" bind:group={selected} />
            <label for="reason2">I am not qualified / certified to do these jobs.</label>
         </div>
        <div>
            <input type="radio" id="reason3" name="reasons" value="no capacity for installing" bind:group={selected} />
            <label for="reason3">I have no capacity for installing with Premium Lithium.</label>
        </div>
        <div>
            <input type="radio" id="reason4" name="reasons" value="Like to speak before accepting a job" bind:group={selected} />
            <label for="reason4">I'd like to speak to Premium Lithium before accepting a job.</label>
        </div>
        <div>
            <input type="radio" id="reason5" name="reasons" value="prefer not to say" bind:group={selected} />
            <label for="reason5">Prefer not to say.</label>
        </div>
        <div>
            <input type="radio" id="reason6" name="reasons" value="other" bind:group={selected}/>
            <label for="reason6">Other:</label>
            {#if selected === "other"}
            <input type="text" bind:value={otherReason} placeholder={"Type your answer here."} />
            {/if}
        </div>
    </div>
    

        <input type='submit' value="Submit" on:click={
        async () => {
            const email = $page.url.searchParams.get('email');
            if (selected){
                if (selected === "other"){
                    if (otherReason){
                        await sendReason(email, otherReason);
                    }else{
                        await sendReason(email, "no reason given"); 
                    }
                }else{
                    await sendReason(email, selected);   
                }
            }else{
                await sendReason(email, "no reason given"); 
            }
            }
        }>
        </div>
{:else}
    <div class="unsubscribed">
        <h2>You have unsubscribed, you may now close this page!</h2>
    </div>
    {/if}


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

    .select {
            font-size: 1em;
            padding: 20px;
            color: #333;
            width: 800px;
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

    input[type="text"] {
        font-size: 1.5em;
        font-family: 'Roboto', sans-serif;
        border: 1px solid #000;
        height:10px;
        width: 500px;
        align-self: center;
        padding: 10px 5px;
        border-radius: 5px;
    }

    input[type="radio"] {
        margin-top: 30px;
    }

    .unsubscribed > h2 {
        font-size: 2em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
        position: relative;
        top: 40vh;
    }


</style>

   
