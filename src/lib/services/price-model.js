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
            battery.price = 3995;
            break;
        case 10:
            battery.price = 7990;
            break;
        case 15:
            battery.price = 11985
        case 20:
            battery.price = 15980;
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

    let solar = {
        name: "solar", 
        price: 0,
        quantity: 0,
    }
    if (solution.solar.selected){
        solar = solarQuote(solution);
        quote.price.breakdown.push(solar);
    }

    getAddOnCost(solution.addOns, solution.solar.selectedpanels, quote);

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

function solarQuote(solution){
    let minSolar = {
        name: "solar",
        quantity: 0,
        price: 0, 
    }

    let maxSolar = {
        name: "max solar",
        quantity: 0,
        price: 0,
    }
    let panels = getReccomendedSolarpanels(solution.houseType);
    solution.solar.minpanels = panels[0];
    solution.solar.maxpanels = panels[1];
    if (solution.solar.selectedpanels == 0){
        const minSolarPrice = getSolarPrice(minSolar);
        const maxSolarPrice = getSolarPrice(maxSolar);
        minSolar.price = minSolarPrice;
        maxSolar.price = maxSolarPrice;
    }else{
        minSolar.quantity = solution.solar.selectedpanels;
        const minSolarPrice = getSolarPrice(minSolar);
        minSolar.price = minSolarPrice;
    }
    return minSolar;
}

function getReccomendedSolarpanels(houseType){
    // Typical Size Solar Panel Arrays Based On R esidential Property Type	
    // From spreadsheet 
    let min = 0;
    let max = 0;
    switch(houseType) {
        case "mid_terrace":
            min = 8;
            max = 12;
            break;
        case "end_terrace":
            min = 8;
            max = 14;
            break;
        case "semi_detatched":
            min = 12;
            max = 18;
            break;
        case "detatched":
            min = 14;
            max = 20;
            break;
    }
    return [min, max]
}

function getSolarPrice(solar){
    let price  = 0;
    price += 5995; // price of 6 panels
    const additionalpanels = solar.quantity - 6;
    price += 500 * additionalpanels; // each one after is £500
    return price;
}

function getAddOnCost(addOns, panels, quote){
    if (addOns.evCharger == true){
        const evCharger =  { name: "EV Charger",
            quantity: 1,
            price: 695,
        }
        quote.price.breakdown.push(evCharger);
    }
    if (addOns.ups == true){
        const ups =  { name: "Upgrade of EPS to UPS",
            quantity: 1,
            price: 995,
        }
        quote.price.breakdown.push(ups);
    }
    if (addOns.smartBattery == true){
        const smartBattery = {
            name: "smart battery to existing solar array connection",
            quantity: 1,
            price: 495,
        }
        quote.price.breakdown.push(smartBattery);
    }
    if (addOns.birdGuard == true){
        const birdGuard = {
            name: "bird guard",
            quantity: panels,
            price: 79*panels,
        }
        quote.price.breakdown.push(birdGuard);
    }
    return quote
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

export {quoteToInstall, solarQuote, earliestInstallMonth, getAddOnCost}
