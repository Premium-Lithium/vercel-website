import { syncJobPostcodes } from "$lib/pipedrive/syncJobPostcodes"
import { json } from '@sveltejs/kit';

export async function POST(response) {
    await syncJobPostcodes();
    return json({ status: 200 });
}

