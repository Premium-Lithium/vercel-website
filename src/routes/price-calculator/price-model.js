// Calculate all the information that would be included in a customer quote,
// given their chosen solution
function quoteFor(customerSolution) {
    // todo: validate customer solution object passed in (ajv here or before call?)

    // todo: define this as typescript interface?
    let quote = {
        price: {
            total: 0,
            breakdown: []
        },
        discount: {
            value: 0,
            multiplier: 0
        }
    };

    // todo: load pricing model parameters from spreadsheet/settings/elsewhere
    switch(customerSolution.batterySize_kWh) {
        case 5:
            quote.price.total = 2698;
            break;
        case 10:
            quote.price.total = 4498;
            break;
        case 20:
            quote.price.total = 8093;
            break;
        default:
            quote.price.total = 0;
    }

    // todo: complete pricing model
    if (customerSolution.evCharger.included) {
        const chargerPrice = getEVChargerPrice(customerSolution.evCharger);
        quote.price.total += chargerPrice;

        // todo: add ev charger to component list
    }

    // Apply pre-order discount
    const installMonth = new Date(customerSolution.installMonth);
    const discountMultiplier = calculateDiscountFrom(installMonth);

    quote.discount.multiplier = discountMultiplier;
    quote.discount.value = quote.price.total * discountMultiplier;
    quote.price.total -= quote.discount.value;

    // todo: break down the price into its components (so these can be tabulated in an email)

    return quote;
}


function getEVChargerPrice(evCharger) {
    // todo: get ev charger price from pipedrive products api
    // Use evCharger.type to look up the price

    return 1300; // for now, this is just the price of the 7kW charger
}


function calculateDiscountFrom(installMonth) {
    const DISCOUNT_PER_MONTH = 0.05;

    const earliest = earliestInstallMonth();
    const monthsAhead = monthsAheadOf(earliest, installMonth);
    const discountMultiplier = Math.min(monthsAhead, 11) * DISCOUNT_PER_MONTH;

    return discountMultiplier;
}


function earliestInstallMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
  return nextMonth;
}


function monthsAheadOf(earliest, target) {
  const monthsDifference = (target.getFullYear() - earliest.getFullYear()) * 12 + (target.getMonth() - earliest.getMonth());
  if (monthsDifference <= 0)
    return 0;

  return monthsDifference;
}



export { quoteFor, earliestInstallMonth };