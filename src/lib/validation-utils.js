import addFormats from "ajv-formats";
import Ajv from 'ajv';
import AjvErrors from 'ajv-errors';


const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
AjvErrors(ajv);


export default function validate(jsonData, schemaPath) {
    // Check that parameters are valid
    if(jsonData === undefined || jsonData === null)
        throw new Error("jsonData is undefined or null");

    if(schemaPath === undefined || schemaPath === null)
        throw new Error("relativePathToSchema is undefined or null");

    // Load schema from file
    const schema = loadSchemaFrom(schemaPath);

    // Validate schema
    const validationFunction = ajv.compile(schema);
    const valid = validationFunction(jsonData);

    let requestErrors = [];

    if(!valid) {
        requestErrors = validationFunction.errors.map(error => error.message);
        return requestErrors;
    }

    return requestErrors;
}