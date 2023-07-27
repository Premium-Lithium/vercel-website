import { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET } from "$env/static/private";
import { json } from '@sveltejs/kit';

const FILE_PATH = 'all_installers.xlsx';
const WORKSHEET_NAME = 'Quotes';

async function getNewApiToken() {
    const url = "https://login.microsoftonline.com/ec4a16f7-9397-4fb3-9bb0-392911e75904/oauth2/v2.0/token";
    const payload = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default'
    });

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    const res = await fetch(url, {
        method: "POST",
        body: payload,
        headers
    });

    const data = await res.json();
    console.log(data);
    const apiToken = data['access_token'];
    console.log(apiToken);
    return apiToken;
}

export async function POST({ request }) {
    const apiToken = await getNewApiToken();

    const headers = {'Authorization': `Bearer ${apiToken}` };
    const apiURL = `https://graph.microsoft.com/v1.0/me/drive/root:/${FILE_PATH}:/workbook/worksheets/${WORKSHEET_NAME}/tables/QuotesTable/rows/add`;
    
    const { values } = await request.json();
    if(values[0].some((x) => {return x === null})){
        return json({message: "Not enough values to send request "}, {status: 400})
    }

    const response = await fetch(apiURL, { 
        method: "POST",
        body: JSON.stringify({
            "index": null,
            "values": [
                values[0]
            ]
        }),
        headers
    });
    console.log(response);
    if(response.ok) {
        return json({ message: "Quote inserted into spreadsheet"}, {status: 200});
    } else {
        return json({statusText: response.statusText}, {status: response.status})
    }
}