import { sync } from "$lib/pipedrive/sync"
import { json } from '@sveltejs/kit';

export async function POST(response) {
    await sync();
    return json({ status: 200 });
}
