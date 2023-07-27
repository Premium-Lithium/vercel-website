import { MICROSOFT_GRAPHS_API_TOKEN } from "$env/static/private";
import { json } from '@sveltejs/kit';

const FILE_PATH = 'all_installers.xlsx';
const WORKSHEET_NAME = 'Quotes';

export async function POST({ request }) {
    const headers = { Authorization: `Bearer ${MICROSOFT_GRAPHS_API_TOKEN}` };
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
    if(response.ok) {
        return json({ message: "Quote inserted into spreadsheet"}, {status: 200});
    } else {
        return json({statusText: response.statusText}, {status: response.status})
    }
}