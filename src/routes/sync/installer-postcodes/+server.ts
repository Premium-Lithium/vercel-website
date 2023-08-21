import { syncInstallerPostcodes } from "$lib/pipedrive/syncInstallerPostcodes"
import { json } from '@sveltejs/kit';

export async function POST(response) {
    await syncInstallerPostcodes();
    return json({ status: 200 });
}

