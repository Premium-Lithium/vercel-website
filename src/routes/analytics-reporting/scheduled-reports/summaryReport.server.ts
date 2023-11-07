// complete and email summary report

import { getSummary } from "./logic/summaryReportLogic.server";
import { summary } from './recipients.json'

enum Sites {
    DEV = 1,
    WEB = 2,
    STORE = 3,
}

// construct summary report

// create email for summary report

// send to relevent people

export async function emailSummaryReport() {
    // use graph API to send an email to everyone on recipients list

    // construct email template
    const {summaryHeader, storeSummary, siteSummary} = await constructSummaryReport();

    for (const recipient of summary) {
        // send email
        console.log(recipient)
        const emailData = {
            sender: "info@premiumlithium.com",
            recipients: ["andrew.packer@premiumlithium.com"],
            subject: "Test email",
            content_type: "HTML",
            mail_body: `
                total: ${summaryHeader.totalRevenue}<br>
                consultations: ${summaryHeader.consultations}<br>
                surveys: ${summaryHeader.surveys}<br>
                preorders: ${summaryHeader.preorders}<br>
                express orders: ${summaryHeader.expressOrders}<br>
                <br><br>
                the summary json blobs:<br?
                ${JSON.stringify(storeSummary)}<br><br>
                ${JSON.stringify(siteSummary)}<br><br>
                All the best,
                Me
            `
        }
        const options = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        }

        const mailAttempt = await fetch("https://vercel-website-liart.vercel.app/send-mail", options)
        if (mailAttempt.status === 200) {
            return {string: "OK"}
        } else {
            console.log(mailAttempt);
        }
        return mailAttempt
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
        totalRevenue: storeSummary.totalRevenue + siteSummary.totalRevenue,
        consultations: storeSummary.consultationsBooked + siteSummary.consultationsBooked,
        surveys: storeSummary.surveysBooked + siteSummary.surveysBooked,
        preorders: storeSummary.preorderNum + siteSummary.preorderNum,
        expressOrders: storeSummary.expressNum + siteSummary.expressNum,
    }
    
    // store summary


    // site summary

    return {summaryHeader, storeSummary, siteSummary};
}