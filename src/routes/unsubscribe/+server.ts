import { MICROSOFT_GRAPHS_API_TOKEN } from "$env/static/private";
import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

const FILE_PATH = 'all_installers.xlsx';
const WORKSHEET_NAME = 'UnsubscribedEmails';

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
