import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function GET() {
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
    const csvData = `${columns.join(',')}\n${quotes
      .map((row) => columns.map((col) => row[col]).join(','))
      .join('\n')}`;
      console.log(csvData);
    return csvData;

}
