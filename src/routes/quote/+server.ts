import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function POST({ request }) {
    let newQuote = undefined;
    const { values } = await request.json();
    const [[
        installerId,
        dealId,
        totalQuote,
        quoteLabour,
        quoteScaffolding,
        quoteMaterials,
        quoteCertification,
        dateOfCompletion,
        currTime,
    ]] = values;

    try {
      newQuote = await prisma.Quote.create({
      data: {
        installerId: parseInt(installerId),
        dealId: parseInt(dealId),
        totalQuote: parseFloat(totalQuote), 
        quoteLabour: parseFloat(quoteLabour),
        quoteScaffolding: parseFloat(quoteScaffolding),
        quoteMaterials: parseFloat(quoteMaterials),
        quoteCertification: parseFloat(quoteCertification),
        dateOfCompletion: dateOfCompletion,
        currTime: currTime, 
      },
    });
    } catch (e) {
      newQuote = await prisma.Quote.update({
        data: {
          installerId: parseInt(installerId),
          dealId: parseInt(dealId),
          totalQuote: parseFloat(totalQuote), 
          quoteLabour: parseFloat(quoteLabour),
          quoteScaffolding: parseFloat(quoteScaffolding),
          quoteMaterials: parseFloat(quoteMaterials),
          quoteCertification: parseFloat(quoteCertification),
          dateOfCompletion: dateOfCompletion,
          currTime: currTime, 
        },
      where:{
        installerId_dealId: {
          installerId: parseInt(installerId),
          dealId: parseInt(dealId),
        }
    }});
    }

    if (newQuote === undefined) return json({}, {status:500})

    return json({}, {status: 200})

}
