import type { Config } from '@sveltejs/adapter-vercel';
import type { RequestHandler } from '@sveltejs/kit';
import { getSummary } from './logic/summaryReportLogic.server';


export const config: Config = {
    runtime: "edge"
}

// recieve a get request from vercel cron
// send all the emails needed

// need to look more into how vercel serverless functions interface with sveltekit

// first iteration will just construct the reprot and send it in the response body
// then requests will trigger an email

export const GET: RequestHandler = async ({url}) => {


    let msgBody = "Test message please ignore"

    msgBody = JSON.stringify(await getSummary(1, "yesterday", "month"));

    return new Response(msgBody, {
        
    });
}