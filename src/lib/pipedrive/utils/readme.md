# Pipedrive Utils
This provides a simple TypeScript interface for several common pipedrive functions
Each item in this module will fetch something specific that can be used for whatever purpose needed.

Some functions aim to fetch data that otherwise would need basic processing. Others can be used to get a list of information that isn't easily accessible

If there is any missing functionality, please add it in a way that can be generically called and used for any purpose.

## Important info
This module can only be used server side. The pipedrive module doesn't exist client side, any attempt to run it will fail

## Typescript restructuring
This is a refactor of the original pipedrive utils in "$lib/pipedrive-utils.js". It aims to reproduce the functionality of that 

## Pagination
Pipedrive data is paginated, meaing only a set number of resutls are returned per call. The `additional_data.pagination` object has this information
``` JSON
<data>.additional_data.pagination = {
    limit: number - max number returned per request,
    more_items_in_collection: boolean - whether there are more items to get,
    start: number - position in the list to start from,
    next_start?: number - position in the list of the next item if paginated
}
```

Each call provides a start and pagination limit. The start is the number on the total list that is started at, and the pagination limit is the maximium number of results. The API will return paginiation data.

## Options
Each function can have options passed to it. These vary by function (see [pipedrive API](https://developers.pipedrive.com/docs/api/v1)). If none are passed, default pagination options will be used to minimise the number of requests made.

## API usage optimisation
The API is very slow and rate limited. This means we should only make calls once if possible. To help with this, results of an API call will be stored and reset when the `resetPipedriveApiData()` function is called (to ensure data is refreshed). This is done by setting an object to store results in and resetting this object when needed
Internal functions that should reset the dat aare prefixed by "_".

It may be that the pipedrive client contains these optimisations already, but I doubt it.

# Reference

**getFieldData(name)** - return data object for field with that name

**getAllLeads(options)** - return a list of all leads in an object with the default pipedrive metadata. See pipedrive API reference for options

**getAllDeals(options)** - return a list of all deals in an object with the default pipedrive metadata. See pipedrive API reference for options

**filterDealsByFieldName(deals_or_leads, field_name, field_value)** - for a given list of deals or leads, filter to only those where the stated field name matches the stated value

**filterDealsByFieldKey(deals_or_leads, field_key, field_value)** - for a given list of deals or leads, filter to only those where the stated field key matches the stated value

**getFieldKey(field_name)** - for a named field, get the key that represents that field in a deal

**getFieldData(fieldName)** - for a named field, get the data associated

**getAllFields(options)** - return a list of all deal fields with all thier associated data

**fetchAllPaginated(pipedrive_api_function, options?)** - for a given pipedrive API function, return all results with pagination concatenated and metadata from the last paginated request. 