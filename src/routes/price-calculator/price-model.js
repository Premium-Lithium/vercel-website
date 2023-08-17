// Given a:
// * description of the system that premium lithium will provide
// * the month that the customer wants the system installed
// generate a quote

function quoteToInstall(solution, installMonth) {
    // todo: validate customer solution object passed in (ajv here or before call?)

    // todo: define this as typescript interface?
    let quote = {
        price: {
            total: 0,
            total_after_discount: 0,
            breakdown: []
        },
        discount: {
            value: 0,
            multiplier: 0
        }
    };

    let battery = {
        name: "",
        quantity: 0,
        price: 0
    };

    // todo: load pricing model parameters from spreadsheet/settings/elsewhere
    switch(solution.batterySize_kWh) {
        case 5:
            battery.price = 2698;
            break;
        case 10:
            battery.price = 4498;
            break;
        case 20:
            battery.price = 8093;
            break;
    }

    battery.name = `${solution.batterySize_kWh} kWh Battery`;
    battery.quantity = 1;
    quote.price.breakdown.push(battery)

    // todo: complete pricing model
    if (solution.evCharger.included) {
        const chargerPrice = getEVChargerPrice(solution.evCharger);
        quote.price.total += chargerPrice;

        // todo: add ev charger to component list
        const charger = {
            name: "EV Charger",
            quantity: 1,
            price: chargerPrice,
        };
        quote.price.breakdown.push(charger);
    }

    // Calculate total of components
    quote.price.breakdown.forEach(component => {
        quote.price.total += component.price;
    });

    quote.price.total_after_discount = quote.price.total;

    // Apply pre-order discount
    const discountMultiplier = calculateDiscountFrom(installMonth);

    quote.discount.multiplier = discountMultiplier;
    quote.discount.value = quote.price.total * discountMultiplier;
    quote.price.total_after_discount -= quote.discount.value;

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
    const monthsInFuture = monthsUntil(installMonth, earliest);
    const discountMultiplier = Math.min(monthsInFuture, 11) * DISCOUNT_PER_MONTH;

    return discountMultiplier;
}


function earliestInstallMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
  return nextMonth;
}


// Function to return a Date object `numberOfMonthsWait` months after the earliest install date
function inMonths(numberOfMonthsWait) {
    const earliest = earliestInstallMonth();
    const target = new Date(earliest.getFullYear(), earliest.getMonth() + numberOfMonthsWait, 2);
    return target;
}


function monthsUntil(target, earliest) {
    if(earliest === null || earliest === undefined)
        throw new Error("earliest date is not defined");

    if(target === null || target === undefined)
        throw new Error("target date is null or undefined");

    const monthsDifference = (target.getFullYear() - earliest.getFullYear()) * 12 + (target.getMonth() - earliest.getMonth());
    if (monthsDifference <= 0)
        return 0;

    return monthsDifference;
}


export { earliestInstallMonth, quoteToInstall, inMonths };