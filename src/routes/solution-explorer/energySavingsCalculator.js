function savings(energyUsage, energyCost, solarOutput){ //how much they save per year using solar panels
    let energySavings = 0;
    energySavings = (energyUsage - solarOutput) * energyCost;
}

function energyBuying(energyUsage){ // savings from buying off peak and using battery instead of buying on peak
     // todo figure out how to calc energy buying savings ????????????????
    let offPeakCost = 0.45; //get real numbers for this 
    let peakCost = 0.66; 
    let batterySavings = (peakCost*energyUsage) - (offPeakCost*energyUsage); //??????????????????????
}

function segExport(energyUsage, solarOutput){ // sell extra energy from solar panels 
    let extraEnergy = solarOutput - energyUsage;
    let segRates = 0.56 // todo get number from somewhere price per kWh
    let soldEnergy = extraEnergy * segRates; // todo find out how to calc extra energy 
    return soldEnergy
}

function payback(solarEnergySavings, batteryEnergySavings, soldEnergy, totalCost){
    const payback = (solarEnergySavings + batteryEnergySavings + soldEnergy)/totalCost;
    return payback 
}