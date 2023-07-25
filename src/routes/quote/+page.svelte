<script>
    import { page } from '$app/stores'
    
    const installerId = $page.url.searchParams.get('installerId');
    const dealId = $page.url.searchParams.get('dealId');
    let quote;

    const FILE_PATH = 'all_installers.xlsx';
    const WORKSHEET_NAME = 'In';
    const API_TOKEN = "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImN3dnl0MGptbUg2WVotT0IzY2ZnLUgtNkRnUVZrd3FFWkUtTzNsRlhZeVkiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9lYzRhMTZmNy05Mzk3LTRmYjMtOWJiMC0zOTI5MTFlNzU5MDQvIiwiaWF0IjoxNjkwMjExMzIxLCJuYmYiOjE2OTAyMTEzMjEsImV4cCI6MTY5MDI5ODAyMSwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhVQUFBQU50TnZjcUs2bkZIZkpxcUpjNWZLdDExZEdabGt3TmJGRW1IbjdXQVQrTzErMlBpV3Qvd1BIeUJKZDBWdXVoZ28iLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6IkdyYXBoIEV4cGxvcmVyIiwiYXBwaWQiOiJkZThiYzhiNS1kOWY5LTQ4YjEtYThhZC1iNzQ4ZGE3MjUwNjQiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IkxvbnNkYWxlIiwiZ2l2ZW5fbmFtZSI6IkpvZSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjE4OC42NS45Ny4xMDgiLCJuYW1lIjoiSm9lIExvbnNkYWxlIiwib2lkIjoiYTNjOTFmMmUtOGM0Mi00YWNhLTlmM2EtNmUxNDZjNzFkYTRmIiwicGxhdGYiOiI4IiwicHVpZCI6IjEwMDMyMDAyQzJBMUUxQTMiLCJyaCI6IjAuQVlJQTl4Wks3SmVUczAtYnNEa3BFZWRaQkFNQUFBQUFBQUFBd0FBQUFBQUFBQUNDQUcwLiIsInNjcCI6IkZpbGVzLlJlYWQgb3BlbmlkIHByb2ZpbGUgVXNlci5SZWFkIGVtYWlsIEZpbGVzLlJlYWRXcml0ZSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6ImlOSVRyT2xnVFVvUS1Oc0RXU3BCWU5HUDd1bWxjME9VU3pJWTljMTU4Z3ciLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiRVUiLCJ0aWQiOiJlYzRhMTZmNy05Mzk3LTRmYjMtOWJiMC0zOTI5MTFlNzU5MDQiLCJ1bmlxdWVfbmFtZSI6ImpvZS5sb25zZGFsZUBwcmVtaXVtbGl0aGl1bS5jb20iLCJ1cG4iOiJqb2UubG9uc2RhbGVAcHJlbWl1bWxpdGhpdW0uY29tIiwidXRpIjoibjBxalFLWEQ4MFNGdW5nX2gyVTdBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19jYyI6WyJDUDEiXSwieG1zX3NzbSI6IjEiLCJ4bXNfc3QiOnsic3ViIjoiRm44RHdqbVVyckowMzVpTm9Bakx4eURETjR5R0djQWlCT0IydndxQjJ0TSJ9LCJ4bXNfdGNkdCI6MTYxNDk1MTQ5OH0.LMx6UclH060SAUZxCIrWsXIfjshQWXDKgWEurGd5p5ya1VkJhab7xoI14yAByxJ37KRl-GmgpG_G8cYGJfhOrCGYuTG0Uy1AR-j_I3_tLyv6uB7yGvtMVYLetZwJoAwZfACi_UAu3DY1Jp6JDX4hj7eZrZ9P3bMEpdB7VJhMJYPol1EsYZ3w_4BTEbGembKYntiReOxLw-DY1DTkfdN6s_ey5LidoCe5JOHj0BW7YgW7qcMLGnSmuwqq-klCMGlYIxS9g5kDoPfLFWHJ2_0t6f-J5LHGAAk1bd3q4O5U96_y7ShLFQ0ir69IZK29g25eYM-SZtGMwPjUMKrHSVdMIQ";

    async function postInstallerQuote(apiToken, installerId, installerQuote, dealId) {
        let currTime = String(new Date());
        const headers = { Authorization: `Bearer ${apiToken}` };
        const apiURL = `https://graph.microsoft.com/v1.0/me/drive/root:/${FILE_PATH}:/workbook/worksheets('${WORKSHEET_NAME}')/tables/QuotesTable/rows/add`;
        const response = await fetch(apiURL, { 
            method: "POST",
            body: JSON.stringify({
                "index": null,
                "values": [
                    [installerId, installerQuote, dealId, currTime]
                ]
            }),
            headers
        });
        if (response.ok) {
            const data = await response.json();
            const installerDetails = data.values.slice(1); // Ignore the header row
            return {
            statusCode: 200,
            body: JSON.stringify(installerDetails),
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

    const openSubmitModel = (apiToken, installerId, installerQuote, dealId) => {

    }

</script>

<div class=body>        
    <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
    <div class="quote-input">
        <h2>Please enter your quote in GBP:</h2>
        <input type="number" autofocus placeholder=required id="submit-quote" required min=0 max=999999999.99 on:blur={() => {if(quote) {quote = Math.max(0,quote.toFixed(2))}}} step="0.01" bind:value={quote}>
        <input type='submit'  on:click={
            () => {
                if(quote){
                    console.log("Installer " + installerId + " has submitted quote " + quote);
                    postInstallerQuote(API_TOKEN, installerId, quote, dealId);
                }
            }
        }>

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
        display: flex;
        flex-direction: column;
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
</style>