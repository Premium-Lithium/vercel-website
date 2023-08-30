function solarSavings(energyUsage, solarOutput, peakCost, offPeakCost, offPeakRatio, tariffType){ //how much they save per year using solar panels
    let energySavings = 0;
    let energyCost = 0;
    let energyLeftOver = 0;

    if (tariffType == "offPeak"){
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
    let batterySavings = (peakCost * energyLeftOver * peakUsage) - (offPeakCost * energyLeftOver * peakUsage ); //??????????????????????
    return batterySavings
}

function segExport(energyUsage, solarOutput, supplier){ 
    // sell extra energy from solar panels 
    if (solarOutput > energyUsage){
        let extraEnergy = solarOutput - energyUsage;
        let segRates = getSegRateFromSupplier(supplier)
        let soldEnergy = extraEnergy * segRates; 
        return soldEnergy
    }
    return 0
}

function calcPayback(totalSavings, totalCost){
    const payback = totalCost/totalSavings;
    return payback 
}

export function energySavings(energyUsage, solarOutput, batterySize, totalCost, peakCost, offPeakCost, tariffType, offPeakRatio, supplier){
    let energyLeftOver = energyUsage - solarOutput;
    let solarEnergySavings = solarSavings(energyUsage, solarOutput, peakCost, offPeakCost, offPeakRatio, tariffType)
    let batteryEnergySavings = 0;
    if (solarOutput < energyUsage){
        batteryEnergySavings = energyBuying(energyLeftOver, batterySize, peakCost, offPeakCost, offPeakRatio);
    }
    let soldEnergy = segExport(energyUsage, solarOutput);
    let totalSavings = solarEnergySavings + batteryEnergySavings + soldEnergy;
    let payback = calcPayback(totalSavings, totalCost);
    return [solarEnergySavings.toFixed(2), batteryEnergySavings.toFixed(2), soldEnergy.toFixed(2), totalSavings.toFixed(2), payback.toFixed(2)]
}

function getSegRateFromSupplier(supplier){
    let segTariff = 0.08 // average from https://solarenergyuk.org/resource/smart-export-guarantee/
    // todo get this form somewhere 
    switch(supplier) {
        case "octopus":
            segTariff = 0.15;
            break;
        case "tesla":
            segTariff = 0.11;
            break;
        case "british gas":
            segTariff = 0.064;
        case "bulb energy":
            segTariff = 0.0557;
            break;
        case "eon":
            segTariff = 0.055;
            break;
        case "scottish power":
            segTariff = 0.055;
            break;
        case "ovo":
            segTariff = 0.04;
            break;
        case "sse":
            segTariff = 0.035;
            break;
        case "shell":
            segTariff = 0.035;
            break;
        case "edf":
            segTariff = 0.03;
            break; 
    }
    return segTariff;
}