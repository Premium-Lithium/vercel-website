import { solarQuote, quoteToInstall, earliestInstallMonth, getAddOnCost } from '$lib/services/price-model.js';

let minPannelOutput = 0;
let maxPannelOutput = 0;
let minPannelCost = 0;
let maxPannelCost = 0;
const averageElectricityCost =  0.34; // taken from octopus energy 
let energyUsage = 5000;
let result = {minSaving: 0, maxSaving: 10000, minPayback: 0, maxPayback:0, minEnergy: 0, maxEnergy: 0}


function getAverage(){
    const url = "https://data.gov.uk/api/action/" // url for dataset 
    // POST request 
    // todo find national dataset api thing
    return 2000
}

function getAverageFromHousehold(household){
    return 3000
}
  
function getAverageFromHouseType(houseType){
    return 3000
}

function getAverageFromPostcode(postcode){
    return 25000
}


function calculateUpfrontCost(solution){
    // cost = (pannel + battery + installation) - pre order%
    let installationDate = earliestInstallMonth(); 
    let batteryCost = 0;
    let addOnCost = 0; 

    if (solution.battery == true){
        solution.batterySize_kWh = 5;
        batteryCost = quoteToInstall(solution, installationDate).price.total;
    }

    if (solution.solar.selected == true){
        if (solution.solar.selectedPannels == 0){
            const pannelCosts = solarQuote(solution, installationDate);
            console.log("pannel costs: ", pannelCosts)
            addOnCost = getAddOnCost(solution.addOns, solution.solar.minPannels);
            minPannelCost = batteryCost + pannelCosts[0].price + addOnCost;
            addOnCost = getAddOnCost(solution.addOns, solution.solar.maxPannels);
            maxPannelCost = batteryCost + pannelCosts[1].price + addOnCost;
            return [minPannelCost, maxPannelCost]
        }else{
            console.log("getting price of ", solution.solar.selectedPannels, " pannels")
            const pannelCost  = solarQuote(solution, installationDate);
            addOnCost = getAddOnCost(solution.addOns, solution.solar.selectedPannels);
            const minCost = batteryCost + pannelCost[0].price + addOnCost;
            console.log("prices", pannelCost, batteryCost)
            return [minCost, 0]

        }
    }
}

function calculateSavings(){
    // money savings = how much less they have to spend on electricity?????
    // savings = normal energy output * avg  cost - (energy usage with solar *cost + energy usage with battery * cost)
}

function calculatePaybackTime(){
    // how many years til cost - saving/year = 0 
    // maybe add of savings from selling to the grid
}

function calculateEnergyUse(){
    // if they dont know their energy consumption...
    // energy consumption:
                //typeof house
                //# perople in house
                //# wfh
                //electricity only -> more possible savings?
                // more savings if solar + battery --> might hqave to calc both sepparately 
    if (solution.usage == "unknown"){
        // get average consumptuions somehow ??????
        // get average consumption from some national database 
        if (solution.postcode != ""){
            // get mean energy based on postcode
            const postcodeAverage = getAverageFromPostcode(solution.postcode);
        }
        if (solution.peopleInHouse != 0){
            // get mean based on people in house
            const householdAverage = getAverageFromHousehold(solution.peopleInHouse);
        }
        if (solution.houseType != ""){
            // get mean based on house type
            const houseTypeAverage = getAverageFromHouseType(solution.houseType);
        }
        //get basic average 
        const basicAverage = getAverage();
        //do average of all averages we got
        // solution.usage = add averages / no of averages 
        
    }else {
        return solution.usage;
    }
}

export {calculateUpfrontCost }
