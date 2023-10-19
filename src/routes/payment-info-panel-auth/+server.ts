import { XeroClient } from 'xero-node';

const XERO_CLIENT_ID = "58566968C54B401F82854F6C633E43B5"
const XERO_CLIENT_SECRET = "xHotLIrz1eeZqG3Ggeny7SNISo3XcLkFuwC9hMewAGmJodD2"
const XERO_REDIRECT_URI = "http://localhost:3000/payment-info-panel/xero-callback"

const xero = new XeroClient({
    clientId: XERO_CLIENT_ID,
    clientSecret: XERO_CLIENT_SECRET,
    redirectUris: [XERO_REDIRECT_URI],
    scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
    state: 'hastalavista', // custom params (optional)
    httpTimeout: 3000, // ms (optional)
    clockTolerance: 10 // seconds (optional)
  });

export async function GET({ request }){
    try {
        let consentUrl = await xero.buildConsentUrl();
        return(new Response(JSON.stringify(consentUrl)))
    } catch (error) {
        console.log("Error Getting")
    }
}