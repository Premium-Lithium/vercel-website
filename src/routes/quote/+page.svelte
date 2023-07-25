<script>
    import { page } from '$app/stores'
    
    const installerId = $page.url.searchParams.get('installerId');
    let quote;
</script>

<div class=body>        
    <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
    <div class="quote-input">
        <h2>Please enter your quote in GBP:</h2>
        <input type="number" min="0" on:blur={() => {quote = Math.max(0,quote.toFixed(2))}} step="0.01" bind:value={quote}>
        <input type='submit' on:click={() => {console.log("Installer " + installerId + " has submitted quote " + quote)}}>

    </div>
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
        display: block;
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
    }

    .quote-input > input[type="submit"] {
        font-size: 2em;
        font-family: 'Roboto', sans-serif;
        border: 1px solid #000;
        height: auto;
        padding: 10px 5px
    }
</style>