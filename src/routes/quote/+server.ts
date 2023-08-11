import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';
import { getNewQuotes } from '$lib/services/quoteBot.js';
import { supabase } from '$lib/supabase.ts'

export async function POST({ request }) {
    const { values } = await request.json();
    const [[
        installerId,
        dealId,
        totalQuote,
        dateOfCompletion,
        currTime,
    ]] = values;
    const { error } = await supabase
            .from('quote')
            .upsert({
                installerId: installerId,
                dealId: dealId,
                totalQuote: totalQuote, 
                dateOfCompletion: dateOfCompletion,
                currTime: currTime, 
            })

    if (error) return json({}, {status:500})
    getNewQuotes(values);
    return json({}, {status: 200})

}