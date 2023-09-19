// take in all the other data and calculate the bestmove for maximium profit/savings


// takes as input "current" time, forecasted variables: of energy usage, genreation and price
    // next horizons worth (currently array of 48)
// sends target charge capacity to inverter

import { json } from '@sveltejs/kit';
export async function POST({url, request}) {
    const instruction = "";

    const arbitrageCalculationDest = "/energy-arbitrage/inverter/arbitrage-calculation"
    let targetUrl = url.origin + arbitrageCalculationDest;
    const timestep = await request.json();
    console.log(timestep)

    // Expert User Model goes here
    if (timestep >=7 && timestep <= 10) {
        return json("Charge (buy energy)")
    } else if (timestep >= 34 && timestep <= 36) {
        return json("Discharge (Sell energy)")
    } else {
        return json("Normal Operation")
    }
    

}