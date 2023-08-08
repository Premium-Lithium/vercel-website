import { json } from '@sveltejs/kit';
//import prisma from '$lib/prisma.js';
import { supabase } from '$lib/supabase.js'
import { getNewQuotes } from '$lib/services/quoteBot.js';

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

    console.log("hi")

    const { error } = await supabase
      .from('Quote')
      .upsert({
          installerId: parseInt(installerId),
          dealId: parseInt(dealId),
          totalQuote: parseFloat(totalQuote), 
          quoteLabour: parseFloat(quoteLabour),
          quoteScaffolding: parseFloat(quoteScaffolding),
          quoteMaterials: parseFloat(quoteMaterials),
          quoteCertification: parseFloat(quoteCertification),
          dateOfCompletion: dateOfCompletion,
          currTime: currTime, 
      })

    if (newQuote === undefined) return json({}, {status:500})
    getNewQuotes(values);
    return json({}, {status: 200})

}
