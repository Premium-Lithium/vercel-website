import { syncAll } from "$lib/pipedrive/syncAll"
import { json } from '@sveltejs/kit';

export async function POST(response) {
    await syncAll();
    return json({ status: 200 });
}
