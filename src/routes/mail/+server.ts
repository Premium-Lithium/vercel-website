import { json } from '@sveltejs/kit';


export async function POST({ request }) {
    const { subject, recipients, body, sender } = await request.json();

    const messagePayload = {
        message: {
            subject: subject,
            body: {
                contentType: "HTML",
                content: body
            },
            toRecipients: []
        }
    };

    recipients.forEach(email => {
        messagePayload.message.toRecipients.push({
            emailAddress: {
                address: email
            }
        });
    });

    const api_token = await getNewAPIToken();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + api_token
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(messagePayload)
    };

    const apiUrl = "/v1.0/users/noreply@premiumlithium.com/sendMail";

    fetch(`https://graph.microsoft.com${apiUrl}`, options)
        .then(res => {
            if (res.status === 202) {
                return {
                    statusCode: 202
                };
            } else {
                console.log(`API request failed with status ${res.status} ${res.statusText}`);
                return {
                    statusCode: res.status,
                    body: res.statusText
                };
            }
        })
        .catch(error => {
            console.error(`Fetch error: ${error.message}`);
        });

    return json({}, { status: 200 })
}


async function getNewAPIToken() {
    const mailClientID = "997bbe8e-997a-4fbb-94b7-19a04c35a646";
    const mailClientSecret = "Qv28Q~fSvYfE7ShDxJXwoyguHfPYzBTui570Odgi";

    const payload = `grant_type=client_credentials&client_id=${encodeURIComponent(mailClientID)}&client_secret=${encodeURIComponent(mailClientSecret)}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default`;

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const apiUrl = "/ec4a16f7-9397-4fb3-9bb0-392911e75904/oauth2/v2.0/token";

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

