import { PrismaClient } from "@prisma/client";
import { json } from '@sveltejs/kit';
const prisma = new PrismaClient();

export async function GET( response ){
    const quotes = await prisma.quote.findMany();
      return json({
        status: 200,
        headers: {
            "Content-Type": "application/csv",
            "Content-Disposition": `attatchment; filename*=quotes.csv`
        },
        body: quotes
    })
}
