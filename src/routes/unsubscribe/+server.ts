import { MICROSOFT_GRAPHS_API_TOKEN } from "$env/static/private";
import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function POST({ request }) {
        const { email, reason } = await request.json();
        console.log("this is prisma -->",prisma);

        const unsubscribedEmail = await prisma.UnsubscribedEmails.create({
            data: {
                email: email,
                reason: reason,
            }
        });

        if (unsubscribedEmail === undefined) return json({}, {status:500})

        return json({}, { status: 200 })
}
