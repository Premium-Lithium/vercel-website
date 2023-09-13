import { json } from '@sveltejs/kit';
import validate from '../../lib/validation-utils.js';
import { sendMail } from './logic.js';

const schema = {
    // Your schema definition here...
};

export async function POST({ request }) {
    if (!request.body)
        return json({ message: "No request body found" }, { status: 400 });

    const requestData = await request.json();
    const validationErrors = validate(requestData, schema);

    // Check that the request body obeys the schema
    if (validationErrors.length) {
        const message = validationErrors.join(", ");
        return json({ message: `${message}` }, { status: 400 });
    }

    try {
        const mailAttempt = await sendMail(...Object.values(requestData));
        console.log(mailAttempt);

        return json(
            { message: mailAttempt.message },
            { status: mailAttempt.success ? 200 : 500 }
        );
    } catch (error) {
        // Handle the error here, or log it if needed.
        console.error("Error sending mail:", error);
        return json({ message: "Internal server error" }, { status: 500 });
    }
}