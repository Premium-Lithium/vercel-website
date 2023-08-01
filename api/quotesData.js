import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function GET(request, response) {
    const quotes = await prisma.quote.findMany();
    const columns =   ['installerId', 
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
    response.writeHead(200, { 'Content-Type': 'apllication/json' });
    response.end(quoteData);
    console.log(quoteData);
    return response;
}
