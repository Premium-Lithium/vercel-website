import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const { subject, recipient, body, sender, api_token } = await request.json();

    return json({}, {status: 200})
}