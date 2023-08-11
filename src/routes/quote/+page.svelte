<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte'
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
    import QuoteInput from './QuoteInput.svelte';
    import { fade } from 'svelte/transition';
    import { supabase } from '$lib/supabase.ts'

    const installerId = $page.url.searchParams.get('installerId');
    const dealId = $page.url.searchParams.get('dealId');
    let response;
    let quote = {labour:0, scaffolding:0, materials:undefined, certification:0};
    let successfulQuote = false;
    let submitDialog, submitModal;
    let totalQuote = 0
    let quoteIsValid = true;
    let dateIsValid = true;
    let dateOfCompletion;
    let currentDate;
    let loading = false;

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
                        [installerId, dealId, totalQuote, new Date(dateOfCompletion), new Date(currTime)]
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
    <!-- <div class="split-screen"> -->
        <!-- <div class="quote-details">
            <h1>test</h1>
            <h2>details will go here</h2>
            <ul>
                <li>1</li>
                <li>2</li>
            </ul>
        </div> -->
        <div class="quote-input disable-select">
            <div class="material-text">
                <h3>How much will this job cost you?<br><br>Accounting for Labour, Materials, Scaffolding if necessary, Certifications if necessary<br><br>Please note that <span style="color: var(--plblue);">we provide the following materials</span>:</h3>
                <h3 style="text-align: left;">For <span style="color: var(--plblue);">battery</span> only jobs:</h3>
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
                <h3 style="text-align: left;">For <span style="color: var(--plblue);">solar</span>  jobs:</h3>
                <ul>
                    <li>Solar panels</li>
                </ul>
                <p style="text-align: left;">If the job incldes <span style="color: var(--plblue);">Immersion Controllers</span> or <span style="color: var(--plblue);">EV Chargers</span>, these will be provided by us.</p>
            </div>
            <ConfirmationModal
                bind:showModal={submitModal}
                bind:dialog={submitDialog}
                yesFunc={
                    async () => {submitDialog.close();
                    await postInstallerQuote(installerId, dealId);
                    successfulQuote = true;

                }}
                noFunc={() => {submitDialog.close()}}>
                <h2 slot="header">
                    Confirm quote of £{totalQuote}?
                </h2>
            </ConfirmationModal>

            
            
            <div class="inputs">
                <h2>Please enter your quote in GBP:</h2>
                <QuoteInput bind:quote={quote.materials} placeholder={"0"}/>

                <h3>Proposed quote: £{totalQuote}</h3>
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
            </div>

            {#if !quoteIsValid && Object.keys(quote).filter(key => quote[key] == null).length !== 0}
                <label class="error-label" 
                for="submit-quote" >
                {Object.keys(quote).filter(key => quote[key] == null).map((str) => " " + str[0].toUpperCase() + str.slice(1))} must be a valid amount (e.g 159.99)
            </label>
            {/if}

            
            
            {#if loading}
                <h2>Sending quote...</h2>
            {/if}
            
    <!-- </div> -->
    </div>
    {:else} 
    <div class="quote-gone-through">
        <h2>Quote successful!<br>You may now close this page!</h2>
    </div>
    {/if}
</div>

<style>
    :root {
        --padding: 16px;
        overflow: unset;
    }

    .body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;  
    }

    .split-screen {
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-columns: 2fr 1fr;

    }

    .quote-details {
        grid-column-start: 1;
    }

    label{
        font-size: 1.5em; 
        min-width: 150px;
        margin: 5px;
        text-align: left;
        display: inline-block;
    }

    .logo{
        position: absolute;
        align-self: center;
        align-items: center;
        top: 0;
    }

    .material-text {
        color: #000;
        text-align: center;
        padding: 30px 10px;
        z-index: 1;
    }
    .quote-input {
        position: absolute;
        margin: 20px 10px 20px 5px;
        display: flex;
        width: 70%;
        align-items: center;
        flex-direction: row;
        justify-content:space-evenly;
        top: 15%;
        overflow: hidden;
        grid-column-start: 2;
    }

    .inputs {
        margin-left: 20px;
        display:flex;
        flex-direction: column;
        align-items:center
    }

    .quote-input > h2, .quote-gone-through > h2, input[type="submit"] {
            font-size: 2em; 
            text-align:center
    }

    .quote-gone-through {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100vh;
    }

    input[type="submit"] {
            border:solid #000 1px; 
            height:auto; 
            width:200px; 
            align-self:center; 
            padding:10px 5px; 
            margin:30px; 
            border-radius:5px
    }

    input[type="date"] {
            outline:none; 
            width:-webkit-fit-content; 
            width:-moz-fit-content; 
            align-self:center; 
            letter-spacing:2px; 
            font-size:1.2em; 
            text-align:center
    }

    input[type="date"]:valid {
            border:solid #28AAE2 2px; 
            transition:border-color .6s ease-in-out
    }

    input[type="date"]:invalid {
            border:solid #000 1px; 
            transition:border-color .1s ease-in-out
    }

    .error-label {
            color:#D61919; 
            font-size:.85em
    }
    li, p {text-align:left}
    .disable-select {
        -webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none
    }

    @media screen and (max-width: 950px) {
        .quote-input {
            flex-direction: column;
        }
    }


</style>
