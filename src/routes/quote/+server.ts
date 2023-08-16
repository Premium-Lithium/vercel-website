import { json } from '@sveltejs/kit';
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
    const { error } = async () => {
        try{ return await supabase
            .from('quote')
            .insert({
                installerId: installerId,
                dealId: dealId,
                totalQuote: totalQuote, 
                dateOfCompletion: dateOfCompletion,
                currTime: currTime, 
            }, {returning: "minimal"})
        } catch (error) {
            try {
                return await supabase
                .from('quote')
                .update({
                    installerId: installerId,
                    dealId: dealId,
                    totalQuote: totalQuote, 
                    dateOfCompletion: dateOfCompletion,
                    currTime: currTime, 
                }, {returning: "minimal"})
            } catch (error){
                console.log(error);
            }        
        }}

    if (error) return json({}, {status:500})
    getNewQuotes(values);
    return json({}, {status: 200})

}