const emailSchema = {
    type: 'object',
    required: ['recipients', 'sender', 'subject', 'mail_body', 'content_type'],
    properties: {
        recipients: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            errorMessage: 'Recipients should be an array of valid email addresses'
        },
        sender: { type: 'string', format: 'email', errorMessage: 'Invalid sender email format' },
        subject: { type: 'string', errorMessage: 'Subject should be a string' },
        body: { type: 'string', errorMessage: 'mail_body should be a string' },
        content_type: {
            type: 'string',
            enum: ['HTML', 'TEXT'],
            errorMessage: 'Content type should be either \"HTML\" or \"TEXT\"'
        }
    }
};

export default emailSchema;