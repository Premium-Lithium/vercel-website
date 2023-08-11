# Quote Customer
API for sending out a quote to a customer. This:

1. fetches the corresponding deal on Pipedrive
2. extracts pricing-relevant data and uses this to build a quote
3. populates a quote email template with the above data, including a link to price config page (initialised with the customers solution)
4. sends this email from the address of the BDM that last called the customer
5. updates the "Quote Issued" field for this customer