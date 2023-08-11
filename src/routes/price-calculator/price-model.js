// Calculate all the information that would be included in a customer quote,
// given their chosen solution
export default function priceOf(customerSolution) {
    // todo: validate customer solution object passed in (ajv here or before call?)

    let totalPrice;

    switch(customerSolution.batterySize_kWh) {
        case "5":
            totalPrice = 2698;
            break;
        case "10":
            totalPrice = 4498;
            break;
        case "20":
            totalPrice = 8093;
            break;
        default:
            totalPrice = 0;
    }

    // todo: complete pricing model

    if (customerSolution.evCharger)
        totalPrice += 235;

    return totalPrice;
}