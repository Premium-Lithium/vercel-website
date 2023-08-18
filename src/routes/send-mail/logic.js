import { json } from '@sveltejs/kit';
import querystring from 'querystring';


export default async function sendMail(recipients, sender, subject, mail_body, content_type) {
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

    const apiToken = await getNewAPIToken();

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

    fetch(`https://graph.microsoft.com${apiUrl}`, options)
        .then(res => {
            if (res.status !== 202) {
                mailAttempt.success = false;
                mailAttempt.message = `Error: Microsoft Graph API request failed with status ${res.status} ${res.statusText}`;
                console.log(mailAttempt.message);
            }
        })
        .catch(error => {
            mailAttempt.success = false;
            mailAttempt.message = `Error: Failed to send email: ${error.message}`;
            console.log(mailAttempt.message);
        });

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