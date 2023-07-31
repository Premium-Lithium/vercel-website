import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

const FILE_PATH = 'all_installers.xlsx';
const WORKSHEET_NAME = 'Quotes';

export async function POST({ request }) {

    const { values } = await request.json();
    const [
        installerId,
        dealId,
        totalQuote,
        quoteLabour,
        quoteScaffolding,
        quoteMaterials,
        quoteCertification,
        dateOfCompletion,
        currTime,
    ] = values;
    

    const newQuote = await prisma.quote.create({
      data: {
        installerId: 1, // Replace with the actual installerId value
        dealId: 1, // Replace with the actual dealId value
        totalQuote: 1000.0, // Replace with the actual totalQuote value
        quoteLabour: 500.0, // Replace with the actual quoteLabour value
        quoteScaffolding: 200.0, // Replace with the actual quoteScaffolding value
        quoteMaterials: 250.0, // Replace with the actual quoteMaterials value
        quoteCertification: 50.0, // Replace with the actual quoteCertification value
        dateOfCompletion: new Date('2023-07-28T00:00:00'), // Replace with the actual dateOfCompletion value
        currTime: new Date(), // Replace with the actual currTime value (current date/time)
      },
    });

    if (newQuote === undefined) return json({}, {status:500})

    return json({}, {status: 200})

}
