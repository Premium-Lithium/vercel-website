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

    oAuth2.clientId = process.env.PIPEDRIVE_EXTENSION_CLIENT_ID;
    oAuth2.clientSecret = process.env.PIPEDRIVE_EXTENSION_CLIENT_SECRET;
    oAuth2.redirectUri = process.env.PIPEDRIVE_EXTENSION_REDIRECT_URI;

    if (accessToken)
        oAuth2.accessToken = accessToken;

    if (refreshToken)
        oAuth2.refreshToken = refreshToken;

    return client;
};


// todo: include register account credentials in database and use them to get
// access token The following example code came from a github repo I found, but
// I've lost the link - Lewis

// const handler = async (req, res) => {
//   try {
//     const { code } = req.query;
//     // Get the access token
//     const client = initAPIClient({});
//     const token = await client.authorize(code);
//     updateTokens(client, token);
//     // Get the currently logged in user
//     const user = await getLoggedInUser(client);
//     const me = user.data;
//     // Persist this information
//     const credentials = {
//       accessToken: token.access_token,
//       refreshToken: token.refresh_token,
//       expiresAt: String(Date.now() + token.expires_in * 1000),
//     };
//     await db.user.upsert({
//       where: {
//         accountId: String(me.id),
//       },
//       update: credentials,
//       create: {
//         accountId: String(me.id),
//         name: me.name, // Can lookup via users/me for more info
//         ...credentials,
//       },
//     });
//     res.status(200).json('Successfully authorized');
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };