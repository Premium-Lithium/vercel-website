function solarSavings(options){ //how much they save per year using solar panels
    let energySavings = 0;
    let energyCost = 0;
    let energyLeftOver = 0;

    if (options.tariffType == "off-peak"){
        energyCost = options.energyUse * options.offPeakTariff;
        energyLeftOver = (options.energyUse - options.solarEnergy) * options.offPeakTariff;
    } else{
        energyCost = (options.energyUse *(1-options.offPeakRatio) * options.peakTariff) + (options.energyUse * options.offPeakRatio * options.offPeakTariff); //working out off peak and on peak cost
        energyLeftOver = options.energyUse - options.solarEnergy;
        energyLeftOver = (energyLeftOver * (1-options.offPeakRatio) * options.peakTariff) + (energyLeftOver * options.offPeakRatio * options.offPeakTariff);
    }
    energySavings = energyCost - energyLeftOver;
    return energySavings
}

function energyBuying(options, energyLeftOver){ 
    // savings from buying off peak and using battery instead of buying on peak
    let peakUsage = 1-options.offPeakRatio;
    let batterySavings = (options.peakTariff * energyLeftOver * peakUsage) - (options.offPeakTariff * energyLeftOver * peakUsage );
    return batterySavings
}

function segExport(options){ 
    // sell extra energy from solar panels 
    if (options.solarEnergy > options.energyUse){
        let extraEnergy = options.solarEnergy - options.energyUse;
        let soldEnergy = extraEnergy * options.sellTariff; 
        return soldEnergy
    }
    return 0
}

function calcPayback(totalSavings, totalCost){
    const payback = totalCost/totalSavings;
    return payback 
}

export function energySavings(options){
    let energyLeftOver = options.energyUse - options.solarEnergy;
    let solarEnergySavings = solarSavings(options)
    let batteryEnergySavings = 0;
    if (options.solarEnergy < options.energyUse){
        batteryEnergySavings = energyBuying(options, energyLeftOver);
    }
    let soldEnergy = segExport(options);
    let totalSavings = solarEnergySavings + batteryEnergySavings + soldEnergy;
    let payback = calcPayback(totalSavings, options.totalCost);
    return [solarEnergySavings.toFixed(2), batteryEnergySavings.toFixed(2), soldEnergy.toFixed(2), totalSavings.toFixed(2), payback.toFixed(2)]
}

function getSegRateFromSupplier(options){
    // average from https://solarenergyuk.org/resource/smart-export-guarantee/
    const rates = new Map([
        ["octopus", 0.15],
        ["tesla", 0.11],
        ["british gas", 0.064],
        ["bulb energy", 0.0557],
        ["eon", 0.055],
        ["scottish power", 0.055],
        ["ovo", 0.04],
        ["sse", 0.035],
        ["shell", 0.035],
        ["edf", 0.03]
    ])
    options.sellTariff = rates.get(options.supplier)
}