import { json } from '@sveltejs/kit';
import { ApiClient } from 'pipedrive';

console.log("TEST")
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

    //oAuth2.clientId = process.env.PIPEDRIVE_MAP_CLIENT_ID;
    //oAuth2.clientSecret = process.env.PIPEDRIVE_MAP_CLIENT_SECRET;
    //oAuth2.redirectUri = process.env.PIPEDRIVE_EXTENSION_REDIRECT_URI;
    oAuth2.clientId = "ef5e6f3326300586";
    oAuth2.clientSecret = "4144bf18049e77eec669fe54c248e23b6211167c";
    oAuth2.redirectUri = "https://734a-148-252-132-46.ngrok-free.app/";
    if (accessToken)
        oAuth2.accessToken = accessToken;

    if (refreshToken)
        oAuth2.refreshToken = refreshToken;

    return client;
};
