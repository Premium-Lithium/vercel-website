// Calculate all the information that would be included in a customer quote,
// given their chosen solution
export default function priceOf(customerSolution) {
    // todo: validate customer solution object passed in (ajv here or before call?)

    let price = {
        total: 0
    };

    // todo: load pricing model parameters from spreadsheet/settings/elsewhere
    switch(customerSolution.batterySize_kWh) {
        case 5:
            price.total = 2698;
            break;
        case 10:
            price.total = 4498;
            break;
        case 20:
            price.total = 8093;
            break;
        default:
            price.total = 0;
    }

    // todo: complete pricing model

    if (customerSolution.evCharger)
        price.total += 235;

    // todo: break down the price into its components

    return price;
}