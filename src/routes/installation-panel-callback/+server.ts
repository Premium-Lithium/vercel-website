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

    oAuth2.clientId = process.env.PIPEDRIVE_INST_PANEL_CLIENT_ID;
    oAuth2.clientSecret = process.env.PIPEDRIVE_INST_PANEL_CLIENT_SECRET;
    //oAuth2.redirectUri = process.env.PIPEDRIVE_INST_PANEL_REDIRECT_URI;
    oAuth2.redirectUri = "https://28c6-148-252-140-35.ngrok-free.app/installation-panel"
    if (accessToken)
        oAuth2.accessToken = accessToken;

    if (refreshToken)
        oAuth2.refreshToken = refreshToken;

    return client;
};
