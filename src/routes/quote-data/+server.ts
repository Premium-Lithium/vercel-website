import { json } from '@sveltejs/kit';

export async function GET( response ){
    // TODO: reimplement for supabase
    return json({
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: quotes
    })
}
