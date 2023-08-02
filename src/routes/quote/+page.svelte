<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte'
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
    import QuoteInput from './QuoteInput.svelte';
    import { fade } from 'svelte/transition';

    const installerId = $page.url.searchParams.get('installerId');
    const dealId = $page.url.searchParams.get('dealId');
    let response;
    let quote = {labour:undefined, scaffolding:undefined, materials:undefined, certification:undefined};
    let successfulQuote = false;
    let submitDialog, submitModal;
    let totalQuote = 0
    let quoteIsValid = true;
    let dateIsValid = true;
    let dateOfCompletion;
    let currentDate;
    let loading = false;
    let showMaterialBreakdown = false;


    onMount(async () => {
        // Get current date in datetime format for min datepicker value
        const date = new Date();   
        currentDate = date.toISOString().split('T')[0];
    });

    async function postInstallerQuote(installerId, dealId) {
        console.log("posting installer quote")
            let currTime = new Date();
            loading = true;
            const response = await fetch('quote/', { 
                method: "POST",
                body: JSON.stringify({
                    "values": [
                        [installerId, dealId, totalQuote, quote.labour, quote.scaffolding, quote.materials, quote.certification, new Date(dateOfCompletion), new Date(currTime)]
                    ]
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            loading = false;
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

    $: {
        totalQuote = 0;
        for(let prop in quote) {
            if(quote[prop]) totalQuote += parseFloat(quote[prop]);
        }
        totalQuote = totalQuote.toFixed(2);
        };    

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
                response = await postInstallerQuote(installerId, dealId);
                successfulQuote = response.statusCode === 200? true : false}
            }
            noFunc={() => {submitDialog.close()}}>
            <h2 slot="header">
                Confirm quote of £{totalQuote}?
            </h2>
        </ConfirmationModal>

        <h2>Please enter your quote in GBP:</h2>
        <div class="inputs">
            <div class="block">
                <label>Labour:</label>
                <QuoteInput bind:quote={quote.labour} autofocus={true} placeholder={"0.00"}/>
            </div>
            <div class="block">
                <label>Scaffolding:</label>
                <QuoteInput bind:quote={quote.scaffolding} placeholder={"0.00"}/>
            </div>
            <div class="block">
                <label on:mouseenter={() => {showMaterialBreakdown=true;}} on:mouseleave={() => {showMaterialBreakdown = false;}}>Materials 
                    <div style="color: blue;" class="tooltip" >(?)
                        <span class="tooltiptext">
                            <h3>How much will additional materials cost? Please note that we provide the following:</h3>
                            <h3>For battery only jobs:</h3>
                            <ul>
                               <li>Batteries</li> 
                               <li>Inverters</li>
                               <li>Isolators</li>
                               <li>DC Isolator</li>
                               <li>AC Isolator</li>
                               <li>Fuses</li>
                               <li>DC cables</li>
                               <li>Communication cables</li>
                            </ul>
                            <h3>For solar jobs:</h3>
                            <ul>
                               <li>Solar panels</li>
                            </ul>
                            <p>If the job incldes Immersion Controllers or EV Chargers, these will be provided by us.</p>
                        </span>
                    </div>:</label>
                <QuoteInput bind:quote={quote.materials} placeholder={"0.00"}/>
            </div>
            <div class="block">
                <label>Certifications:</label>
                <QuoteInput bind:quote={quote.certification} placeholder={"0.00"}/>
            </div>
        </div>

        {#if !quoteIsValid && Object.keys(quote).filter(key => quote[key] == null).length !== 0}
            <label class="error-label" 
            for="submit-quote" >
            {Object.keys(quote).filter(key => quote[key] == null).map((str) => " " + str[0].toUpperCase() + str.slice(1))} must be a valid amount (e.g 159.99)
        </label>
        {/if}

        

        <h3>Total quote: £{totalQuote}</h3>
        <h3>Date of soonest completion</h3>
        <input type='date' name='submit-date' bind:value={dateOfCompletion} required min={currentDate}>
        {#if !dateIsValid && dateOfCompletion == undefined}
            <label class="error-label"
            for='submit-date'>Provide a valid date</label>
        {/if}
        <input type='submit' value="Submit" on:click={
            () => {
                if(loading) return;
                quoteIsValid = false
                if(Object.values(quote).some((x) => {return x == null})) quoteIsValid = false;
                else if(totalQuote < 0) quoteIsValid = false;
                else quoteIsValid = true;
    
                dateIsValid = false;
                if(Date.parse(dateOfCompletion) >= Date.parse(currentDate)) dateIsValid = true;
                
                if(quoteIsValid && dateIsValid){
                    submitModal=true;
                }
            }
        }>
        {#if loading}
            <h2>Sending quote...</h2>
        {/if}
    </div>
    {:else} 
    <div class="quote-gone-through">
        <h2>Quote successful, you may now close this page!</h2>
    </div>
    {/if}
</div>

<style>
    .body {
        margin: 0px;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        
    }
    .quote-input > h2 {
        font-size: 2em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
    }

    .quote-input > h3 {
        font-size: 1.2em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
    }
    
    label{
        font-size: 1.5em; 
        min-width: 150px;
        margin: 5px;
        text-align: left;
        display: inline-block;
        font-family: 'Roboto', sans-serif;
      }

    .block {
        align-items: center;
    }

    .logo{
        position: absolute;
        align-self: center;
        top: 0;
    }

    .tooltip {
        position: relative;
        display: inline-block;
    }

    .tooltip .tooltiptext {
        background-color: white;
        color: #000;
        text-align: center;
        padding: 10px 30px;
        border: 3px solid var(--plblue); 
        border-radius: 6px;
        visibility: hidden;
        position: absolute;
        opacity: 0;
        transition: opacity 0.2s ease-in-out, visibility 0s linear 0.2s;
        z-index: 1;
        width: 40vw;
        top: 100%;
        left: 50%;
        margin-left: -20vw;
    }

    .tooltip:hover .tooltiptext {
        opacity: 1;
        transition: opacity 0.4s ease-in-out, visibility 0s linear 0s;
        visibility: visible;
    }

    .quote-input {
        margin: auto;
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: 15%;    
    }

    .quote-input > input[type="submit"] {
        font-size: 2em;
        font-family: 'Roboto', sans-serif;
        border: 1px solid #000;
        height: auto;
        width: 200px;
        align-self: center;
        padding: 10px 5px;
        margin: 30px;
        border-radius: 5px;
    }


    .quote-gone-through > h2 {
        font-size: 2em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
        position: relative;
        top: 40vh;
    }

    .quote-input > input[type="date"] {
        outline: none;
        letter-spacing: 2px;
        font-size: 1.2em;
        text-align: center;
        font-family: 'Roboto', sans-serif;
    }
    .quote-input > input[type="date"]:valid {
        border: 2px solid #28AAE2;
        transition: border-color 0.6s ease-in-out;
    }

    .quote-input > input[type="date"]:invalid {
        border: solid 2px black;
        transition: border-color 0.1s ease-in-out;
    }
    .error-label {
        color: rgb(214, 25, 25);
        font-family: 'Roboto', sans-serif;
        font-size: 0.85em;
    }
    li{
        text-align: left;
        font-family: 'Roboto', sans-serif;
    }

    p {
        text-align: left;
        font-family: 'Roboto', sans-serif;   
    }

    .tooltiptext > h3 {
        text-align: left;
        font-family: 'Roboto', sans-serif;  
    }

</style>
