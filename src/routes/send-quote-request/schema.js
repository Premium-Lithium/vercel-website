const quoteRequestSchema = {
    type: "object",
    properties: {
        for_deal: {
            type: "integer",
            minimum: 0,
            errorMessage: "for_deal should be a deal id (as found on Pipedrive)"
        },
        to: {
            type: "array",
            items: {
                type: "string",
                format: "email"
            },
            errorMessage: "'to' should be an array of valid email addresses"
        },
        to_nearest: {
            type: "integer",
            minimum: 0,
            errorMessage: "to_nearest should be a positive integer indicating the number of nearest installers"
        }
    },
    required: ["for_deal"],
    oneOf: [
        { required: ["to"] },
        { required: ["to_nearest"] }
    ],
    errorMessage: {
        oneOf: "The request should contain either 'to_nearest' or 'to' (not both)"
    }
}

export default quoteRequestSchema;