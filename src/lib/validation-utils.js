import addFormats from "ajv-formats";
import Ajv from 'ajv';
import AjvErrors from 'ajv-errors';


const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
AjvErrors(ajv);


export default function validate(jsonData, schema) {
    // Check that parameters are valid
    if(jsonData === undefined || jsonData === null)
        throw new Error("jsonData is undefined or null");

    if(schema === undefined || schema === null)
        throw new Error("schema is undefined or null");

    if(schema.type !== "object")
        throw new Error("schema is not a json object");

    // Validate schema
    const validationFunction = ajv.compile(schema);
    const valid = validationFunction(jsonData);

    let requestErrors = [];

    if(!valid)
        requestErrors = validationFunction.errors.map(error => error.message);

    return requestErrors;
}