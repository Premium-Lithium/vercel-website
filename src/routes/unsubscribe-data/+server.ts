import { PrismaClient } from "@prisma/client";
import { json } from '@sveltejs/kit';
const prisma = new PrismaClient();

export async function GET( response ) {
    const unsubed = await prisma.unsubscribedEmails.findMany();
    const unsubcolumns = ['email', 'reason']
    const unsubedData = `${unsubcolumns.join(',')}\n${unsubed
        .map((row) => unsubcolumns.map((col) => row[col]).join(','))
        .join('\n')}`;
    return json({
        status: 200,
        headers: {
            "Content-Type": "application/csv",
            "Content-Disposition": `attatchment; filename*=unsubed.csv`
        },
        body: unsubed
    });
}
