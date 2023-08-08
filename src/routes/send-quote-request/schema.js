const quoteRequestSchema = {
    type: "object",
    properties: {
        for_deal: {
            type: "integer",
            minimum: 0,
            errorMessage: "for_deal should be a deal id (as found on Pipedrive)"
        },
        to_installers: {
            type: "array",
            items: {
                type: "string",
                format: "email"
            },
            errorMessage: "to_installers should be an array of valid email addresses"
        },
    },
    required: [ "for_deal", "to_installers" ]
}

export default quoteRequestSchema;