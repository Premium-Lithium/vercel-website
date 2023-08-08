const quoteRequestSchema = {
    type: "object",
    properties: {
        for_deals: {
            type: "array",
            items: {
                type: "number",
                errorMessage: "for_deals should be an array of deal id numbers (as found on Pipedrive)"
            }
        },
        to_installers: {
            type: "array",
            items: {
                type: "string",
                format: "email"
            },
            errorMessage: "to_installers should be an array of valid email addresses"
        },
        preview: {
            type: "string",
            format: "email",
            errorMessage: "preview should be a valid email address"
        }
    },
    required: [ "for_deals", "to_installers" ]
}

export default quoteRequestSchema;