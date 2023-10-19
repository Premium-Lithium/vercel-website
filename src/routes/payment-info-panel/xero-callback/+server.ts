import { XeroClient } from 'xero-node';
import { json } from '@sveltejs/kit';
import querystring from 'querystring';
import { redirect } from '@sveltejs/kit';
import { isAuthenticated, accessToken } from '$lib/payment-info-panel/sessionStore.js';
const XERO_CLIENT_ID = "58566968C54B401F82854F6C633E43B5"
const XERO_CLIENT_SECRET = "xHotLIrz1eeZqG3Ggeny7SNISo3XcLkFuwC9hMewAGmJodD2"
const XERO_REDIRECT_URI = "http://localhost:3000/payment-info-panel/xero-callback"

export async function GET({ request }) {
    //Receive the temporary code
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const token = await exchangeToken(code)
    accessToken.set(token)
    throw redirect(302, '/payment-info-panel?selectedIds=7142') //for now its hardcoded to redirect to a deal
    //Exchange the code with Token
    return json({ code: code }, { status: 200 })
}

async function exchangeToken(code) {
    const data = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: XERO_REDIRECT_URI
    }
    const payload = querystring.stringify(data)

    const headers = {
        'Authorization': "Basic " + btoa(XERO_CLIENT_ID + ":" + XERO_CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const options = {
        method: 'POST',
        headers: headers,
        body: payload
    }
    try {
        const response = await fetch("https://identity.xero.com/connect/token", options)
        const data = await response.json();

        if (data.access_token) {
            const token = data.access_token;
            return token;
        } else {
            console.log('Error exchanging token');
            return null;
        }
    } catch (error) {
        console.log("Error fetching")
    }
}