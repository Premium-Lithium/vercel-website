# Pipedrive Utils
This provides a simple JS interface for several common pipedrive functions
Each item in this module will fetch something specific that can be used for whatever purpose needed.

Some functions aim to fetch data that otherwise would need basic processing. Others can be used to get a list of information that isn't easily accessible

## Important info
This module can only be used server side. The pipedrive module doesn't exist client side, any attempt to run it will fail

## Typescript restructuring
These utilities are being re-built in typescript to be generically useable. Due to the varied use of the original JS version, the refactor will be located in "$lib/pipedrive/utils/pipedriveUtils.ts". It aims to reproduce the functions in a way that is well documented and uses typescript.

## API reference

**pd** - a generic pipedrive API client that can be used to implement pipedrive API functions as needed without initialising

**dealFieldsRequest** - the result of an API query to list all deal fields

**readCustomDealField(field_name, deal_data)**

**getField(field_name)**

**getOptionIdFor(option_name, field_object)** 

**getKeysForCustomFields()**