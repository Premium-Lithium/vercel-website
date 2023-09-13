
import querystring from 'querystring';
import { json } from '@sveltejs/kit';

// todo: at some point we want to ideally use this javascript client provided by microsoft to simplify the logic here slightly
// See documentation here: https://github.com/microsoftgraph/msgraph-sdk-javascript/tree/dev
import { Client } from "@microsoft/microsoft-graph-client";
import { MICROSOFT_GRAPHS_API_TOKEN } from '$env/static/private';


async function sendMail(sender, recipients, subject, mail_body, content_type) {
    const authProvider= (callback) => {
        // Your logic for getting and refreshing accessToken
        const accessToken = await getNewAPIToken();
        // Error should be passed in case of error while authenticating
        // accessToken should be passed upon successful authentication
        callback("error", accessToken);
    const client = Client.init({authProvider});
    let mailAttempt = {
        "success": true,
        "message": `Email sent successfully from ${sender} to ${recipients}`
    };

    // Make sure we're sending from a Premium Lithium email address
    if(!sender.endsWith("@premiumlithium.com")) {
        mailAttempt.success = false;
        mailAttempt.message = `Error: Sender '${sender}' is not a Premium Lithium email address.`;
        console.log(mailAttempt.message);
        return mailAttempt;
    }

    const messagePayload = {
        message: {
            subject: subject,
            body: {
                contentType: content_type,
                content: mail_body
            },
            toRecipients: recipients.map(email => ({ emailAddress: { address: email } }))
        }
    };
    try {
        let response = await client.api(`/${sender}/sendMail`).post({ message: messagePayload });
        console.log(response);
    } catch (error) {
        throw error;
    }
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
            return data.error;
        }
    } catch (error) {
        console.error(`Fetch error: ${error}`);
        return json({status: 500, message: "error getting api token"});
    }
}


export {
    getNewAPIToken, // todo: remove this - only exposing for testing
    sendMail
};
