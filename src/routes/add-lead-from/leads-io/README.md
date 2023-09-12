This endpoint is responsible for processing inbound lead data supplied by
[Leads.io](https://leads.io/) provided in the format below:

```
{
    "firstname": "Alex",
    "lastname": "Smith",
    "email": "test@test.com",
    "phone1": "0123456789",
    "postcode": "YO17HF",
    "prid": "01234567",
    "answers": {
        "HomeOwner": "Yes",
        "InterestedIn": "Solar and batteries",
        "Age": "30-40"
    }
}
```

These are added to the Inbound Leads column in Pipedrive.