// reccomend battery based on how mu7ch their daily energy is 

export function getBatteryReccomendation(energyUsage){
    console.log("energy usage= : ", energyUsage)
    const dailyEnergy = energyUsage/365;
    if (dailyEnergy <=5){
        return 5
    }else if (dailyEnergy <=10){
        return 10
    }else if (dailyEnergy <=15){
        return 15
    }else if (dailyEnergy <=20){
        return 20
    }else if (dailyEnergy <=25){
        return 25
    }else{
        return 30;
    }
}