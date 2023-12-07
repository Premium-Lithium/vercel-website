type kWh = number;
type GBP = number;

type ElectricityRates = {
    unit: GBP,
    fluxMinImport: GBP,
    fluxMaxExport: GBP,
    export: GBP
}

type System = {
    annualSolarGen: kWh,
    annualBatteryCapacity: kWh
}

const peakEnergyUse_multiplier: any = {
    "In most of the day": 0.3,
    "In half the day": 0.5,
    "Out most of the day": 0.7
};

const startingElecRate: ElectricityRates = {
    unit: 0.34,
    fluxMinImport: 0.1756,
    fluxMaxExport: 0.2997,
    export: 0.055
};

const degredation_percent: any = {
    solar: 0.55,
    battery: 2.5
}
const solarUsageMultiplier: number = 0.5; // percentage of the generation you're expected to use directly from solar
const batteryUsageMultiplier: number = 0.4; // percentage of the battery that you expect to use
const numDaysBatteryUsedPerYear: number = 334;
const numYearsSimulated: number = 25;

const occupancy: string = Object.keys(peakEnergyUse_multiplier)[1];
const batteryPeakUseMultiplier_0_1: number = peakEnergyUse_multiplier[occupancy];
const priceInflation_percent: number = 7;

export async function POST ({ request }) {
    // annualEnergyDemand, initAnnualSolarGen, initBatteryCapacity
    const req = await request.json()
    
    return new Response;
}

// A function to return the amount that the customer should be paying in year `yearIdx`
function simulateSystem(annualEnergyDemand: kWh, year1AnnualSolarGen: kWh, year1BatteryCapacity: kWh): any {
    // Clear the simulation output data
    let output: any = {
        years: [],
        breakEvenYear: -1
    }

    // Reset starting conditions
    let elecRate: ElectricityRates = { ...startingElecRate };
    let netPosition: GBP = 0;

    const year1AnnualBatteryCapacity: kWh = year1BatteryCapacity * numDaysBatteryUsedPerYear;
    let currentSystem: System = {
        annualSolarGen: year1AnnualSolarGen,
        annualBatteryCapacity: year1AnnualBatteryCapacity
    };

    // Iterate over each year and simulate the behaviour of the system
    for(let yearIdx = 0; yearIdx < numYearsSimulated; yearIdx++) {

        const reservedBatteryCapacity: kWh = allocateReservedBatteryCapacity(annualEnergyDemand, elecRate, currentSystem);

        const solarUsage: kWh = Math.min(annualEnergyDemand, currentSystem.annualSolarGen);
        const annualIncome: GBP = calcTotalEarnings(annualEnergyDemand, reservedBatteryCapacity, elecRate, solarUsage, currentSystem);

        netPosition += annualIncome

        // Calculating payback year
        const hitBreakEven: boolean = output.breakEvenYear == -1 && netPosition >= 0;
        if(hitBreakEven)
            output.breakEvenYear = yearIdx;

        // Gather all data
        const year: any = {
            idx: yearIdx,
            annualIncome_gbp: annualIncome,
            netPosition_gbp: netPosition,
            systemStatus: currentSystem, // solar and battery condition

        }

        output.years.push(year);

        // End-of-year calculations
        currentSystem = degraded(currentSystem);
        elecRate = inflatedPriceOf(elecRate);
    }

    return output;
}

function allocateReservedBatteryCapacity(annualEnergyDemand: kWh, elecRate: ElectricityRates, currentSystem: System): any {
    const annualBatteryCapacity = currentSystem.annualBatteryCapacity;
    const annualSolarGen = currentSystem.annualSolarGen;

    // todo: consider expanding these functions into this function and reusing intermediate variables
    const solarGen: kWh = calcBatteryCapacityReservedForSolar(annualBatteryCapacity, annualEnergyDemand, annualSolarGen);
    const cheapRateGen: kWh = calcBatteryCapacityReservedForCheapRate(annualBatteryCapacity, annualEnergyDemand, annualSolarGen, elecRate, solarGen);
    const chargeToExport: kWh = calcBatteryCapacityReservedForExport(annualBatteryCapacity, solarGen, cheapRateGen);

    return {
        cheapRateGen_kWh: cheapRateGen,
        chargeToExport_kWh: chargeToExport
    }
}


function calcBatteryCapacityReservedForSolar(annualBatteryCapacity: kWh, annualEnergyDemand: kWh, currentAnnualSolarGen: kWh): kWh {
    let reservedCapacity: kWh = 0;

    const solarGenHighEnough: boolean = currentAnnualSolarGen * 0.9 > annualEnergyDemand;

    // todo: what does this variable mean?
    const batteryCapacityLimit: boolean = annualBatteryCapacity < currentAnnualSolarGen * batteryUsageMultiplier;

    const adjustedSolarGen: kWh = currentAnnualSolarGen * batteryUsageMultiplier;
    const adjustedEnergyDemand: kWh = annualEnergyDemand * batteryUsageMultiplier;

    if (solarGenHighEnough)
        reservedCapacity = adjustedEnergyDemand;
    else if (batteryCapacityLimit)
        reservedCapacity = annualBatteryCapacity;
    else
        reservedCapacity = Math.min(adjustedSolarGen, adjustedEnergyDemand);

    return reservedCapacity;
}


function calcBatteryCapacityReservedForCheapRate(
    annualBatteryCapacity: kWh,
    annualEnergyDemand: kWh,
    currentAnnualSolarGen: kWh,
    elecRate: ElectricityRates,
    batteryCapReservedForSolar: GBP
): kWh {
    let reservedCapacity: kWh = 0;

    const fluxMinImport: GBP = elecRate.fluxMinImport;
    const isRateFavorable: boolean = (elecRate.unit - fluxMinImport) >= (elecRate.fluxMaxExport - fluxMinImport);

    const isSolarGenSufficient: boolean = currentAnnualSolarGen <= annualEnergyDemand;
    const isDemandCoveredBySolar: boolean = (annualEnergyDemand * batteryPeakUseMultiplier_0_1) - batteryCapReservedForSolar >= 0;
    const isAnnualCapSufficient: boolean = (annualBatteryCapacity * batteryPeakUseMultiplier_0_1) - batteryCapReservedForSolar >= 0;

    if (isRateFavorable && isSolarGenSufficient && isDemandCoveredBySolar && isAnnualCapSufficient)
        reservedCapacity = (annualBatteryCapacity * batteryPeakUseMultiplier_0_1) - batteryCapReservedForSolar;

    return reservedCapacity;
}


function calcBatteryCapacityReservedForExport(annualBatteryCapacity: kWh, batteryCapReservedForSolar: kWh, batteryCapReservedForCheapRate: kWh): kWh {
    const freeCapacityNotYetReserved: kWh = annualBatteryCapacity - batteryCapReservedForSolar - batteryCapReservedForCheapRate;

    // If there's no excess capacity we can use for export, then don't reserve any
    const reservedForExport: kWh = Math.max(0, freeCapacityNotYetReserved);

    return reservedForExport;
}


function calcTotalEarnings(annualEnergyDemand: kWh, reservedBatteryCapacity: any, elecRate: ElectricityRates, solarUsage: kWh, currentSystem: System): GBP {
    const currentAnnualSolarGen = currentSystem.annualSolarGen;
    const annualBatteryCapacity = currentSystem.annualBatteryCapacity;

    const unitRate: GBP = elecRate.unit;

    const solarConsumption: GBP = solarUsage * solarUsageMultiplier * unitRate;

    const batteryUsage: kWh = calcBatteryUsage(annualEnergyDemand, solarUsage);
    const batteryConsumption: GBP = Math.min(batteryUsage, annualBatteryCapacity) * unitRate;

    const forceChargeSavings: GBP = calcSavingsFromForcedCharging(annualEnergyDemand, reservedBatteryCapacity.cheapRateGen_kWh, elecRate);

    const chargeToExport: GBP = reservedBatteryCapacity.chargeToExport_kWh * (elecRate.fluxMaxExport - elecRate.fluxMinImport);

    const solarExportEarning: GBP = (currentAnnualSolarGen - ((solarConsumption + batteryConsumption) / unitRate)) * elecRate.export;

    const earnings: GBP = solarConsumption + batteryConsumption + forceChargeSavings + chargeToExport + solarExportEarning;

    return earnings;
}


function calcBatteryUsage(energyDemand: kWh, solarUsage: kWh): kWh {
    const usage: kWh = Math.min(energyDemand, solarUsage) * batteryUsageMultiplier;
    return usage;
}


function calcSavingsFromForcedCharging(energyDemand: kWh, batteryCapReservedForCheapRate: kWh, elecRate: ElectricityRates): GBP {
    const peakEnergyDemand: kWh = energyDemand * batteryPeakUseMultiplier_0_1;
    const rateDifference: GBP = elecRate.unit - elecRate.fluxMinImport;
    const savings: GBP = Math.min(peakEnergyDemand, batteryCapReservedForCheapRate) * rateDifference;

    return savings;
}


function inflatedPriceOf(elecRate: ElectricityRates): ElectricityRates {
    const multiplier: number = 1 + (priceInflation_percent / 100);

    elecRate.unit *= multiplier;
    elecRate.fluxMinImport *= multiplier;
    elecRate.fluxMaxExport *= multiplier;

    return elecRate;
}


function degraded(system: System): System {
    system.annualSolarGen *= 1.0 - (degredation_percent.solar / 100);
    system.annualBatteryCapacity *= 1.0 - (degredation_percent.battery / 100);

    return system;
}