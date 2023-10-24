import pipedrive from 'pipedrive';

const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;

// todo: this request comes with pagination options. check that all results are returned
const pdDealFieldsApi = new pipedrive.DealFieldsApi(pd);
const dealFieldsRequest = await pdDealFieldsApi.getDealFields();

// Just get the field object
function getField(fieldName) {
	if (dealFieldsRequest.success === false) {
		console.log(`Could not read deal value for ${fieldName} because deal fields request failed.`);
		return null;
	}

	const allFields = dealFieldsRequest.data;

	const field = allFields.find((f) => f.name === fieldName);

	if (field === undefined) {
		console.log(`Could not find deal field with name '${fieldName}'. Is this spelled correctly?`);
		return null;
	}

	return field;
}

// Return the id of an option for a given field
function getOptionIdFor(optionName, fieldObject) {
	const options = fieldObject.options;
	const option = options.find((o) => o.label === optionName);

	if (option === undefined) {
		console.log(`Could not find option with name '${optionName}'. Is this spelled correctly?`);
		return null;
	}

	return option.id;
}

// Get the field and read it's contents
function readCustomDealField(fieldName, dealData) {
	if (dealFieldsRequest.success === false) {
		console.log(`Could not read deal value for ${fieldName} because deal fields request failed.`);
		return null;
	}

	const allFields = dealFieldsRequest.data;

	const field = allFields.find((f) => f.name === fieldName);

	if (field === undefined) {
		console.log(`Could not find deal field with name '${fieldName}'. Is this spelled correctly?`);
		return null;
	}

	// The field exists, now we need to read it
	const key = field.key;
	let value = dealData[key];

	// If the field type is an enum, we still need to map the field's value to its readable name
	if (field.field_type === 'enum')
		value = field.options.find((option) => option.id === parseInt(value)).label;

	return value;
}

/** Process:
 * Get custom field key from name
 * Create opts - map of fieldKey: data
 * Call updateLead from pipedrive js api
 */
// Fields is a dictionary where the key is the field name and the data is the value to set the field to
function getKeysForCustomFields(fields) {
	// [field key:field] data pairs for adding custom fields
	let fieldKeys = [];

	for (const [fieldName, fieldData] of Object.entries(fields)) {
		if (dealFieldsRequest.success === false) {
			console.log(`Could not read deal value for ${fieldName} because deal fields request failed.`);
			return null;
		}
		const allFields = dealFieldsRequest.data;

		// TODO create object of all custom fields' needed - potentially store them in env?
		const fieldKey = allFields.find((f) => f.name === fieldName).key;

		fieldKeys.push([fieldKey, fieldData]);
	}

	return fieldKeys;
}

export { pd, readCustomDealField, dealFieldsRequest, getField, getOptionIdFor, getKeysForCustomFields };
