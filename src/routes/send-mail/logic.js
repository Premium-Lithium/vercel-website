import querystring from 'querystring';

// todo: at some point we want to ideally use this javascript client provided by microsoft to simplify the logic here slightly
// See documentation here: https://github.com/microsoftgraph/msgraph-sdk-javascript/tree/dev
// import { Client } from "@microsoft/microsoft-graph-client";


//If system_time is provided, schedule mail to be sent on that system_time 
//Format Time 2019-01-29T20:00:00"
async function sendMail(sender, recipients, subject, mail_body, content_type, system_time) {
    console.log("sending mail")
    let mailAttempt = {
        "success": true,
        "message": `Email sent successfully from ${sender} to ${recipients}`
    };

    // Make sure we're sending from a Premium Lithium email address
    if (!sender.endsWith("@premiumlithium.com")) {
        mailAttempt.success = false;
        mailAttempt.message = `Error: Sender '${sender}' is not a Premium Lithium email address.`;
        console.log(mailAttempt.message);
        return mailAttempt;
    }   

    let messagePayload = {
        message: {
            subject: subject,
            body: {
                contentType: content_type,
                content: mail_body
            },
            toRecipients: recipients.map(email => ({ emailAddress: { address: email } }))
        }
    };

    //If system_time is provided, schedule mail to be sent on that system_time 
    //Format Time 2019-01-29T20:00:00"
    if(system_time != undefined){
        console.log("Email is going to be send on ", system_time)
        messagePayload.message.singleValueExtendedProperties = [{
            id: "SystemTime 0x3FEF",
            value: system_time
        }]
    }

    try {
        const apiToken = await getNewAPIToken();

        if (!apiToken) {
            mailAttempt.success = false;
            mailAttempt.message = "Error: Failed to obtain API token.";
            console.log(mailAttempt.message);
            return mailAttempt;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiToken
        };

        const options = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(messagePayload)
        };

        const apiUrl = `/v1.0/users/${sender}/sendMail`;

        const response = await fetch(`https://graph.microsoft.com${apiUrl}`, options);

        if (response.status !== 202) {
            mailAttempt.success = false;
            mailAttempt.message = `Error: Microsoft Graph API request failed with status ${response.status} ${response.statusText}`;
            console.log(mailAttempt.message);
        }
    } catch (error) {
        mailAttempt.success = false;
        mailAttempt.message = `Error: Failed to send email: ${error.message}`;
        console.log(mailAttempt.message);
    }

    console.log(mailAttempt.message);
    return mailAttempt;
}


async function getNewAPIToken() {
    const mailClientID = process.env.MICROSOFT_CLIENT_ID;
    const mailClientSecret = process.env.MICROSOFT_CLIENT_SECRET;

    const data = {
        grant_type: "client_credentials",
        client_id: mailClientID,
        client_secret: mailClientSecret,
        scope: "https://graph.microsoft.com/.default"
    };
    const payload = querystring.stringify(data);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const apiUrl = `/${process.env.AUTH0_TENANT_ID}/oauth2/v2.0/token`;

    const options = {
        method: 'POST',
        headers: headers,
        body: payload
    };

    try {
        const response = await fetch(`https://login.microsoftonline.com${apiUrl}`, options);
        const data = await response.json();

        if (data.access_token) {
            const token = data.access_token;
            return token;
        } else {
            console.log('Error:', data.error_description || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error(`Fetch error: ${error.message}`);
        return null;
    }
}


export {
    getNewAPIToken, // todo: remove this - only exposing for testing
    sendMail
};