// complete and email summary report

import { getSummary } from "./logic/summaryReportLogic.server";

import nunjucks from 'nunjucks';
import { supabase } from "$lib/supabase";

import type { MatomoAPIOpts } from "../scripts/matomoTypes";


enum Sites {
    DEV = 1,
    WEB = 2,
    STORE = 3,
}

// construct summary report

// create email for summary report

// send to relevent people

export async function emailSummaryReport(origin: string, date: MatomoAPIOpts["date"], period: MatomoAPIOpts["period"]) {
    // use graph API to send an email to everyone on recipients list

    const njkString = await (await fetch(origin + "/email-templates/summaryTemplate.njk")).text()
    // get recipients from supbase and log details to console

    // get emails for people who should recieve the energiser summary report
    let { data: recipients, error } = await supabase
        .from('analytics_report_recipients')
        .select("name, email")
        .eq("energiser_report", true)

    if (error) {
        console.log(error)
    }
    // construct email template
    const { summaryHeader, storeSummary, siteSummary } = await constructSummaryReport(date, period);

    if (recipients === null) {
        return "No recipients found";
    }
    for (const recipient of recipients) {

        // send email

        nunjucks.configure({ autoescape: true });
        const nunjucksData = {
            name: recipient.name,
            energiserModeString: "overall energiser performance",
            date: date,
            period: period,
            summaryHeader: summaryHeader,
            storeReport: storeSummary,
            siteReport: siteSummary,
        }

        const renderedEmail = nunjucks.renderString(njkString, nunjucksData);
        const mailBody = `
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
        `
        const emailData = {
            sender: "andrew.packer@premiumlithium.com",
            recipients: [recipient.email],
            subject: "Test email",
            mail_body: renderedEmail,
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


async function constructSummaryReport(date: MatomoAPIOpts["date"], period: MatomoAPIOpts["period"]) {
    // get energiser data
    // get store data
    // calculate key values from them
    // iterate through to build full results table

    const storeSummary = await getSummary(Sites.STORE, date, period);
    const siteSummary = await getSummary(Sites.WEB, date, period);


    // header data
    const summaryHeader = {
        totalRevenue: {
            prefix: storeSummary.totalRevenue.prefix,
            val: storeSummary.totalRevenue.value + siteSummary.totalRevenue.value,
            title: "Revenue"
        },
        consultations: {
            val: storeSummary.consultationsBooked.value + siteSummary.consultationsBooked.value,
            title: "Consultations"
        },
        surveys: {
            val: storeSummary.surveysBooked.value + siteSummary.surveysBooked.value,
            title: "Surveys"
        },
        preorders: {
            val: storeSummary.preorderNum.value + siteSummary.preorderNum.value,
            title: "Pre-orders"
        },
        expressOrders: {
            val: storeSummary.expressNum.value + siteSummary.expressNum.value,
            title: "Express orders"
        },
    }

    return { summaryHeader, storeSummary, siteSummary };
}