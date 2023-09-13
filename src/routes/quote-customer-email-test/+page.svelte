<script>
    import { supabase } from '$lib/supabase.ts';
    async function sendQuoteEmail(){
        console.log("getting email template")
        const { data, error } = await supabase
        .storage
        .from('email-template')
        .createSignedUrl('customer-quote-template.mjml', 1000);
        console.log(data, error)
    }

</script>
<div style="padding: 0px 15px;">
    <button on:click={sendQuoteEmail} class="quote-button"><b>Generate Quote Draft</b></button>
</div>

<style>
    .quote-button {
        background-color: #28AAE2;
        border-color: #a4c1ce;
        border-width: 1.5px;
        border-radius: 5px;
        border-style: solid;
        color: white;
        padding: 7px 15px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
        transition: background-color 0.1s ease-in-out;
    }

    .quote-button:hover {
        background-color: #1c8cb9;
    }
</style>