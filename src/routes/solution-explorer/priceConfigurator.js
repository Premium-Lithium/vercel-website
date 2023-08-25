import { solarQuote, quoteToInstall, earliestInstallMonth } from '$lib/services/price-model.js';

let minPannelOutput = 0;
let maxPannelOutput = 0;
let minPannelCost = 0;
let maxPannelCost = 0;
const averageElectricityCost =  0.34; // taken from octopus energy 
let solution = {houseType: "detatched", solar: {selected: true, minPannels: 0, maxPannels:20, selectedPannels: 0}, battery: true, batterySize_kWh: 5, evCharger: {selected: true}, usage: "unknown", peopleInHouse: 4, wfh: 0, postcode: ""};
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

    if (solution.battery == true){
        solution.batterySize_kWh = 5;
        batteryCost = quoteToInstall(solution, installationDate).price.total;
    }

    if (solution.solar.selected == true){
        if (solution.solar.selectedPannels == 0){
            console.log("aaaaaaaaaaaaaaaaaaaa");
            const pannelCosts = solarQuote(solution, installationDate);
            console.log("pannel costs: ", pannelCosts)
            minPannelCost = pannelCosts[0].price;
            maxPannelCost = pannelCosts[1].price;
            solution.solar.minPannels = pannelCosts[0].quantity;
            solution.solar.maxPannels = pannelCosts[1].quantity;
        }else{
            console.log("aaaaa");
            const pannelCost  = solarQuote(solution, installationDate);
            console.log(pannelCost);
            const minCost = batteryCost + pannelCost;
            return [minCost]

        }
    }
    
    console.log("battery price: ", batteryCost);
    console.log("min solar: ", minPannelCost, " max solar: ", maxPannelCost);
    // energyUsage =  calculateEnergyUse();
    const energyCost = solution.usage * averageElectricityCost;
    // minEnergySavings = energyOutput- (batterySize + minPannelOutput);
    // maxEnergySavings = energyOutput - (batterySize + maxPannelOutput)
    const minCost = batteryCost + minPannelCost; 
    const maxCost = batteryCost + maxPannelCost;
    return [minCost, maxCost, minSolar.quantity, maxSolar.quantity];
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
