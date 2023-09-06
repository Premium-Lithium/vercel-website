import { PIPEDRIVE_API_TOKEN } from '$env/static/private';

// TODO implement OAuth instead of using token
const companyDomain = 'https://api.pipedrive.com/v1/leads?api_token='+PIPEDRIVE_API_TOKEN;

/**
 * TODO implement some form of validation
 *  - check theres an organisation and/or person attached to the lead
 * also get it working
 * @param request The request to send to pipedrive
 * @returns The response from pipedrive
 */
export async function POST({ request }) {
    let req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(await request.json())
    };
    // console.log(req);
    let res = await fetch(companyDomain, req);
    console.log(res);
    return (new Response(JSON.stringify(await res.json())));
}
