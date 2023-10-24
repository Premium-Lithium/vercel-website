import { json } from '@sveltejs/kit';
import { ApiClient } from 'pipedrive';

export async function GET({ request }) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    const client = initAPIClient({});
    const token = await client.authorize(code);

    console.log(token);

    // TODO: save account info with tokens to database

    return json({}, {status: 200})
}

function initAPIClient({ accessToken = '', refreshToken = '' }) {
    const client = new ApiClient();
    const oAuth2 = client.authentications.oauth2;

    //oAuth2.clientId = process.env.PIPEDRIVE_SS_PANEL_CLIENT_ID;
    //oAuth2.clientSecret = process.env.PIPEDRIVE_SS_PANEL_CLIENT_SECRET;
    //oAuth2.redirectUri = process.env.PIPEDRIVE_SS_PANEL_REDIRECT_URI;
    oAuth2.clientId = "caceda3f2e17e511"
    oAuth2.clientSecret = "b42dec4831e659b7de50f067f70d81f339753d93"
    oAuth2.redirectUri = "https://3b6d-82-26-3-127.ngrok-free.app/site-survey-panel-callback"
    if (accessToken)
        oAuth2.accessToken = accessToken;
    if (refreshToken)
        oAuth2.refreshToken = refreshToken;

    return client;
};