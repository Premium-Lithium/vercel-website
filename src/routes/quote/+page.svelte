<script>
    import { page } from '$app/stores'
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
    const installerId = $page.url.searchParams.get('installerId');
    const dealId = $page.url.searchParams.get('dealId');
    let quote, response;
    let successfulQuote = false;

    async function postInstallerQuote(installerId, installerQuote, dealId) {
        let currTime = String(new Date());
        const response = await fetch('quote/', { 
            method: "POST",
            body: JSON.stringify({
                "values": [
                    [installerId, installerQuote, dealId, currTime]
                ]
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            return {
                statusCode: 200
            };
        } else {
            console.log(`API request failed with status ${response.status} ${response.statusText}`);
            return {
                statusCode: response.status,
                body: response.statusText,
            };
        }
    }

    let submitDialog, submitModal;

    const openSubmitModal = (installerId, installerQuote, dealId) => {

    }

</script>

<div class=body>        
    <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
    {#if !successfulQuote}
    <div class="quote-input">

        <ConfirmationModal
            bind:showModal={submitModal}
            bind:dialog={submitDialog}
            yesFunc={
                async () => {submitDialog.close();
                response = await postInstallerQuote(installerId, quote, dealId);
                successfulQuote = response.statusCode === 200? true : false}
            }
            noFunc={() => {submitDialog.close()}}>
            <h2 slot="header">
                Confirm quote of £{quote}?
            </h2>
        </ConfirmationModal>

        <h2>Please enter your quote in GBP:</h2>
        <input type="number" 
            autofocus
            placeholder=required
            id="submit-quote"
            required
            min=0
            max=999999999.99
            on:blur={() => {if(quote) {quote = Math.max(0,quote.toFixed(2))}}}
            step="0.01"
            bind:value={quote}
        >
        <input type='submit' value="Submit" on:click={
            () => {
                if(quote){
                    submitModal=true;
                }
            }
        }>
        <label class="submit-label" for="submit-quote" style="color: rgb(214, 25, 25)">Invalid quote</label>
        

    </div>
    {:else} 
    <div class="quote-gone-through">
        <h2>Quote successful, you may now close this page!</h2>
    </div>
    {/if}
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

    .body > h1 {
        font-size: 4em;
        text-align: center;
    }
    .quote-input > h2 {
        font-size: 2em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
    }
    .logo{
        position: absolute;
        align-self: center;
        top: 0;
    }
    .quote-input {
        margin: auto;
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: 30vh;   
    }
    
    .quote-input > input[type="number"] {
        margin-top: 10px;
        border: 1px solid #000;
        height: 80px;
        align-self: center;
        text-align: center;
        font-size: 3em;   
        font-family: 'Roboto', sans-serif;
        border-radius: 5px;
    }

    .quote-input > input[type="submit"] {
        font-size: 2em;
        font-family: 'Roboto', sans-serif;
        border: 1px solid #000;
        height: auto;
        width: 200px;
        align-self: center;
        padding: 10px 5px;
        margin-top: 10px;
        border-radius: 5px;
    }

    .quote-input > input ~ .submit-label {
        top:0;
        position:relative;
        right: 0;
        font-size: 1.5em;
    }

    .quote-input > input:valid ~ .submit-label {
        opacity: 0;
        transition: opacity 0.25s ease-in-out;

    }

    .quote-input > input:invalid:not(:placeholder-shown) ~ .submit-label {
        opacity: 1;
        transition: opacity 0.25s ease-in-out;
    }

    .quote-gone-through > h2 {
        font-size: 2em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
    }
</style>