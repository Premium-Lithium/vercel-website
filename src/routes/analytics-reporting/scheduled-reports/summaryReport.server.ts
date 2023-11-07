// complete and email summary report
import { page } from "$app/stores"
import { get } from "svelte/store";
import { getSummary } from "./logic/summaryReportLogic.server";
import { summary } from './recipients.json'
import nunjucks from "nunjucks"

enum Sites {
    DEV = 1,
    WEB = 2,
    STORE = 3,
}

// construct summary report

// create email for summary report

// send to relevent people

export async function emailSummaryReport(origin: string) {
    // use graph API to send an email to everyone on recipients list

    // construct email template
    const {summaryHeader, storeSummary, siteSummary} = await constructSummaryReport();
    for (const recipient of summary) {
        // send email
        console.log(recipient)
        
        const emailData = {
            sender: "andrew.packer@premiumlithium.com",
            recipients: [recipient.email],
            subject: "Test email",
            mail_body: `
                total: ${summaryHeader.totalRevenue}<br>
                consultations: ${summaryHeader.consultations}<br>
                surveys: ${summaryHeader.surveys}<br>
                preorders: ${summaryHeader.preorders}<br>
                express orders: ${summaryHeader.expressOrders}<br>
                <br><br>
                the summary json blobs:<br>
                Store summary ${JSON.stringify(storeSummary)}<br><br>
                Site summary ${JSON.stringify(siteSummary)}<br><br>
                All the best,
                Me
            `,
            content_type: "HTML"
        }
        const options = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        }
        const mailEndpoint = origin + "/send-mail"
        const mailAttempt = await fetch(mailEndpoint, options)
        if (mailAttempt.status === 200) {
        } else {
            console.log(mailAttempt);
            return mailAttempt
        }
        
    }

    
    return [summaryHeader, storeSummary, siteSummary];
}


async function constructSummaryReport() {
    // get energiser data
    // get store data
    // calculate key values from them
    // iterate through to build full results table

    const storeSummary = await getSummary(Sites.DEV, "yesterday", "month");
    const siteSummary = await getSummary(Sites.WEB, "yesterday", "month");

    
    // header data
    const summaryHeader = {
        totalRevenue: storeSummary.totalRevenue.value + siteSummary.totalRevenue.value,
        consultations: storeSummary.consultationsBooked.value + siteSummary.consultationsBooked.value,
        surveys: storeSummary.surveysBooked.value + siteSummary.surveysBooked.value,
        preorders: storeSummary.preorderNum.value + siteSummary.preorderNum.value,
        expressOrders: storeSummary.expressNum.value + siteSummary.expressNum.value,
    }
    
    // store summary data
    // use MJML 
   
    // site summary data
    

    // construct MJML file

    return {summaryHeader, storeSummary, siteSummary};
}