

// sample price calculator

export function priceCalc(dayCost, nightCost, energyUse, nightRatio) {
    let dayPrice = dayCost * energyUse * (1 - nightRatio);
    let nightPrice = nightCost * energyUse * nightRatio;
    let totalCost = dayPrice + nightPrice;
    return Number(totalCost.toFixed(2)) + 1;
}