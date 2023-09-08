import { json } from '@sveltejs/kit';

export async function GET( response ) {
    // TODO: Reimplement for supabase
    return json({
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: unsubed
    });
}
