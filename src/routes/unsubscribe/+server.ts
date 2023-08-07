import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function POST({ request }) {
        const { email, reason } = await request.json();

        const unsubscribedEmail = await prisma.UnsubscribedEmails.create({
            data: {
                email: email,
                reason: reason,
            }
        });

        if (unsubscribedEmail === undefined) return json({}, {status:500})

        return json({}, { status: 200 })
}
