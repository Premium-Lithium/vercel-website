import { PrismaClient } from "@prisma/client";
import { json } from '@sveltejs/kit';
const prisma = new PrismaClient();

export async function GET( response ){
    const quotes = await prisma.quote.findMany();
    const columns = ['installerId', 
      'dealId',
      'totalQuote', 
      'quoteLabour',
      'quoteScaffolding',
      'quoteMaterials',
      'quoteCertification',
      'dateOfCompletion',
      'currTime'];
  
    const quoteData = `${columns.join(',')}\n${quotes
      .map((row) => columns.map((col) => row[col]).join(','))
      .join('\n')}`;
    
      return json({
        status: 200,
        headers: {
            "Content-Type": "application/csv",
            "Content-Disposition": `attatchment; filename*=quotes.csv`
        },
        body: quoteData
    })
}
