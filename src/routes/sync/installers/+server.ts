import { syncInstallers } from "$lib/pipedrive/syncInstallers"
import { json } from '@sveltejs/kit';

export async function POST(response) {
    await syncInstallers();
    return json({ status: 200 });
}

