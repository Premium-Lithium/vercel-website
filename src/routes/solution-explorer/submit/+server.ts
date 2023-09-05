import { PIPEDRIVE_API_TOKEN } from '$env/static/private';

const companyDomain = 'https://premiumlithium.pipedrive.com/v1/leads?api_key='+PIPEDRIVE_API_TOKEN;

/**
 * TODO implement some form of validation
 *  - check theres an organisation and/or person attached to the lead
 * also get it working
 * @param request The request to send to pipedrive
 * @returns The response from pipedrive
 */
export async function POST({ request }) {
    let submitDeposit = await request.json();
    let res = await fetch(companyDomain, submitDeposit);
    return res;
}
