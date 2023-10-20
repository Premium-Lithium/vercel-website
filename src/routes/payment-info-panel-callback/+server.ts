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
    
    oAuth2.clientId = "384bd950042db8e0";
    oAuth2.clientSecret = "a80006aaa7d7c247e4a726d5a4f706aa617b6b85";
    oAuth2.redirectUri = "https://6fe0-62-232-61-90.ngrok-free.app/payment-info-panel-callback";
    if (accessToken)
        oAuth2.accessToken = accessToken;

    if (refreshToken)
        oAuth2.refreshToken = refreshToken;

    return client;
};
