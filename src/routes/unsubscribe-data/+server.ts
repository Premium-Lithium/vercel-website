import { PrismaClient } from "@prisma/client";
import { json } from '@sveltejs/kit';
const prisma = new PrismaClient();

export async function GET( response ) {
    const unsubed = await prisma.unsubscribedEmails.findMany();
    return json({
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: unsubed
    });
}
