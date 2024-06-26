import { json } from '@sveltejs/kit';
import { ApiClient } from 'pipedrive';

console.log("TESTING")
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
    oAuth2.clientId = process.env.PIPEDRIVE_MAP_CLIENT_ID;
    oAuth2.clientSecret = process.env.PIPEDRIVE_MAP_CLIENT_SECRET;
    oAuth2.redirectUri = process.env.PIPEDRIVE_MAP_REDIRECT_URI;
    if (accessToken)
        oAuth2.accessToken = accessToken;

    if (refreshToken)
        oAuth2.refreshToken = refreshToken;

    return client;
};
