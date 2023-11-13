import type { Config } from '@sveltejs/adapter-vercel';
import type { RequestHandler } from '@sveltejs/kit';
import { getSummary } from './logic/summaryReportLogic.server';
import { emailSummaryReport } from './summaryReport.server';


export const config: Config = {
    runtime: "edge"
}

// recieve a get request from vercel cron
// send all the emails needed

// need to look more into how vercel serverless functions interface with sveltekit

// first iteration will just construct the reprot and send it in the response body
// then requests will trigger an email

export const GET: RequestHandler = async ({url}) => {
    const origin = url.origin;
    // current: send daily overall report to me for evaluation
    const dailyReport = await emailSummaryReport(origin, "yesterday", "day");

    // TODO: if it is monday generate report for last week
    // if it is 1st, generate report for last month
    
    let msgBody = "Test message please ignore"

    //const monthReport = await emailSummaryReport(origin, "yesterday", "month")
    
    msgBody = JSON.stringify(dailyReport)
    return new Response(msgBody, {
        
    });
}