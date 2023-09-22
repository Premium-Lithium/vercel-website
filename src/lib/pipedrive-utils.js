import pipedrive from 'pipedrive';


const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;

// todo: this request comes with pagination options. check that all results are returned
const pdDealFieldsApi = new pipedrive.DealFieldsApi(pd);
const dealFieldsRequest = await pdDealFieldsApi.getDealFields();


// Just get the field object
function getField(fieldName) {
    if(dealFieldsRequest.success === false) {
        console.log(`Could not read deal value for ${fieldName} because deal fields request failed.`);
        return null;
    }

    const allFields = dealFieldsRequest.data;

    const field = allFields.find(f => f.name === fieldName);

    if(field === undefined) {
        console.log(`Could not find deal field with name '${fieldName}'. Is this spelled correctly?`);
        return null;
    }

    return field;
}


// Return the id of an option for a given field
function getOptionIdFor(optionName, fieldObject) {
    const options = fieldObject.options;
    const option = options.find(o => o.label === optionName);

    if(option === undefined) {
        console.log(`Could not find option with name '${optionName}'. Is this spelled correctly?`);
        return null;
    }

    return option.id;
}


// Get the field and read it's contents
function readCustomDealField(fieldName, dealData) {
    if(dealFieldsRequest.success === false) {
        console.log(`Could not read deal value for ${fieldName} because deal fields request failed.`);
        return null;
    }

    const allFields = dealFieldsRequest.data;

    const field = allFields.find(f => f.name === fieldName);

    if(field === undefined) {
        console.log(`Could not find deal field with name '${fieldName}'. Is this spelled correctly?`);
        return null;
    }

    // The field exists, now we need to read it
    const key = field.key;
    let value = dealData[key];

    // If the field type is an enum, we still need to map the field's value to its readable name
    if(field.field_type === "enum")
        value = field.options.find(option => option.id === parseInt(value)).label;

    return value;
}


export { pd, readCustomDealField, dealFieldsRequest, getField, getOptionIdFor };