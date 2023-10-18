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

    oAuth2.clientId = "4481e66b04925a66";
    oAuth2.clientSecret = "7b212b78ebac2effb210c3e7fc980971bed71b2d";
    oAuth2.redirectUri = "https://0720-62-232-61-90.ngrok-free.app/payment-info-panel-callback";
    if (accessToken)
        oAuth2.accessToken = accessToken;

    if (refreshToken)
        oAuth2.refreshToken = refreshToken;

    return client;
};
