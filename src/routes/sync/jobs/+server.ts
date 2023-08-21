import { syncJobs } from "$lib/pipedrive/syncJobs"
import { json } from '@sveltejs/kit';

export async function POST(response) {
    await syncJobs();
    return json({ status: 200 });
}

