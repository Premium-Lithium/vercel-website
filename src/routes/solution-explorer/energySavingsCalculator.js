function solarSavings(energyUsage, solarOutput, peakCost, offPeakCost, offPeakRatio, tariffType){ //how much they save per year using solar panels
    let energySavings = 0;
    let energyCost = 0;
    let energyLeftOver = 0;

    if (tariffType == "off-peak"){
        energyCost = energyUsage * offPeakCost;
        energyLeftOver = (energyUsage - solarOutput) * offPeakCost;
    } else{
        energyCost = (energyUsage *(1-offPeakRatio) * peakCost) + (energyUsage * offPeakRatio * offPeakCost); //working out off peak and on peak cost
        energyLeftOver = energyUsage - solarOutput;
        energyLeftOver = (energyLeftOver * (1-offPeakRatio) * peakCost) + (energyLeftOver * offPeakRatio * offPeakCost);
    }
    energySavings = energyCost - energyLeftOver;
    return energySavings
}

function energyBuying(energyLeftOver, batterySize, peakCost, offPeakCost, offPeakRatio){ 
    // savings from buying off peak and using battery instead of buying on peak
    let peakUsage = 1-offPeakRatio;
    let batterySavings = (peakCost * energyLeftOver * peakUsage) - (offPeakCost * energyLeftOver * peakUsage );
    return batterySavings
}

function segExport(energyUsage, solarOutput, sellTariff){ 
    // sell extra energy from solar panels 
    if (solarOutput > energyUsage){
        let extraEnergy = solarOutput - energyUsage;
        let soldEnergy = extraEnergy * sellTariff; 
        return soldEnergy
    }
    return 0
}

function calcPayback(totalSavings, totalCost){
    const payback = totalCost/totalSavings;
    return payback 
}

export function energySavings(energyUsage, solarOutput, batterySize, totalCost, peakCost, offPeakCost, tariffType, offPeakRatio, sellTariff){
    let energyLeftOver = energyUsage - solarOutput;
    let solarEnergySavings = solarSavings(energyUsage, solarOutput, peakCost, offPeakCost, offPeakRatio, tariffType)
    let batteryEnergySavings = 0;
    if (solarOutput < energyUsage){
        batteryEnergySavings = energyBuying(energyLeftOver, batterySize, peakCost, offPeakCost, offPeakRatio);
    }
    let soldEnergy = segExport(energyUsage, solarOutput, sellTariff);
    let totalSavings = solarEnergySavings + batteryEnergySavings + soldEnergy;
    let payback = calcPayback(totalSavings, totalCost);
    return [solarEnergySavings.toFixed(2), batteryEnergySavings.toFixed(2), soldEnergy.toFixed(2), totalSavings.toFixed(2), payback.toFixed(2)]
}

function getSegRateFromSupplier(supplier){
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
    let segTariff = rates.get(supplier)
    return segTariff;
}