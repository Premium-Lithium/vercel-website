// Given a:
// * description of the system that premium lithium will provide
// * the month that the customer wants the system installed
// generate a quote

function quoteToInstall(solution, installMonth) {
    // todo: validate customer solution object passed in (ajv here or before call?)
    console.log(solution);
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
    console.log(quote)
    return quote;
}


function solarQuote(solution, installationDate){
    let minSolar = {
        quantity: 0,
        price: 0, 
    }

    let maxSolar = {
        quantity: 0,
        price: 0,
    }

    console.log("calculating solar price");
    // Typical Size Solar Panel Arrays Based On R esidential Property Type	
    // From spreadsheet
    if (solution.solar.selectedPannels == 0){
        switch(solution.houseType) {
            case "mid_terrace":
                minSolar.quantity = 8;
                maxSolar.quantity = 12;
                break;
            case "end_terrace":
                minSolar.quantity = 8;
                maxSolar.quantity = 14;
                break;
            case "semi_detatched":
                minSolar.quantity = 12;
                maxSolar.quantity = 18;
                break;
            case "detatched":
                minSolar.quantity = 14;
                maxSolar.quantity = 20;
                break;
        }
    } else{
        const solar = {
            price: 0,
            quantity: solution.solar.selectedPannels,
        }
        return getSolarPrice(solar)
    }
    const minSolarPrice = getSolarPrice(minSolar);
    const maxSolarPrice = getSolarPrice(maxSolar);
    minSolar.price = minSolarPrice;
    maxSolar.price = maxSolarPrice;
    return [minSolar, maxSolar]
}


function getSolarPrice(solar, installMonth){
    let price  = 0;
    price += 5995; // price of 6 pannels
    const additionalPannels = solar.quantity - 6;
    price += 500 * additionalPannels; // each one after is £500
    if (installMonth){
        price = price * calculateDiscountFrom(installMonth);
    }
    return price;
}

function getEVChargerPrice(evCharger) {
    // todo: get ev charger price from pipedrive products api
    // Use evCharger.type to look up the price

    return 1300; // for now, this is just the price of the 7kW charger
}


function calculateDiscountFrom(installMonth) {
    const DISCOUNT_PER_MONTH = 0.05;

    const numMonthsInFuture = monthsFromNowUntil(installMonth);
    const discountMultiplier = Math.min(numMonthsInFuture, 11) * DISCOUNT_PER_MONTH;

    return discountMultiplier;
}


function earliestInstallMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
  return nextMonth;
}


function monthsFromNowUntil(installMonth) {
    const earliest = earliestInstallMonth();

    if(installMonth === null || installMonth === undefined)
        throw new Error("installMonth month is null or undefined");

    const numMonths = (installMonth.getFullYear() - earliest.getFullYear()) * 12 + (installMonth.getMonth() - earliest.getMonth());
    if (numMonths <= 0)
        return 0;

    return numMonths;
}

// Given a:
// * description of the system that premium lithium will provide
// * the month that the customer wants the system installed
// generate a quote

function quoteToInstall(solution, installMonth) {
    // todo: validate customer solution object passed in (ajv here or before call?)
    console.log(solution);
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
    console.log(quote)
    return quote;
}


function solarQuote(solution, installationDate){
    let minSolar = {
        quantity: 0,
        price: 0, 
    }

    let maxSolar = {
        quantity: 0,
        price: 0,
    }

    console.log("calculating solar price");
    // Typical Size Solar Panel Arrays Based On R esidential Property Type	
    // From spreadsheet   
    switch(solution.houseType) {
        case "mid_terrace":
            minSolar.quantity = 8;
            maxSolar.quantity = 12;
            break;
        case "end_terrace":
            minSolar.quantity = 8;
            maxSolar.quantity = 14;
            break;
        case "semi_detatched":
            minSolar.quantity = 12;
            maxSolar.quantity = 18;
            break;
        case "detatched":
            minSolar.quantity = 14;
            maxSolar.quantity = 20;
            break;
    }
    const minSolarPrice = getSolarPrice(minSolar);
    const maxSolarPrice = getSolarPrice(maxSolar);
    minSolar.price = minSolarPrice;
    maxSolar.price = maxSolarPrice;
    return [minSolar, maxSolar]
}


function getSolarPrice(solar, installMonth){
    let price  = 0;
    price += 5995; // price of 6 pannels
    const additionalPannels = solar.quantity - 6;
    price += 500 * additionalPannels; // each one after is £500
    if (installMonth){
        price = price * calculateDiscountFrom(installMonth);
    }
    return price;
}

function getEVChargerPrice(evCharger) {
    // todo: get ev charger price from pipedrive products api
    // Use evCharger.type to look up the price

    return 1300; // for now, this is just the price of the 7kW charger
}


function calculateDiscountFrom(installMonth) {
    const DISCOUNT_PER_MONTH = 0.05;

    const numMonthsInFuture = monthsFromNowUntil(installMonth);
    const discountMultiplier = Math.min(numMonthsInFuture, 11) * DISCOUNT_PER_MONTH;

    return discountMultiplier;
}


function earliestInstallMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
  return nextMonth;
}


function monthsFromNowUntil(installMonth) {
    const earliest = earliestInstallMonth();

    if(installMonth === null || installMonth === undefined)
        throw new Error("installMonth month is null or undefined");

    const numMonths = (installMonth.getFullYear() - earliest.getFullYear()) * 12 + (installMonth.getMonth() - earliest.getMonth());
    if (numMonths <= 0)
        return 0;

    return numMonths;
}

