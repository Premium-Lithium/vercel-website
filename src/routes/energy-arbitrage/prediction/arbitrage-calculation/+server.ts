// take in all the other data and calculate the bestmove for maximium profit/savings


// takes as input "current" time, forecasted variables: of energy usage, genreation and price
// next horizons worth (currently array of 48)

// sends target charge capacity to inverter

import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const timestep = await request.json();
    
    // Expert User Model (basically just a lookup table)
    if (timestep >= 7 && timestep <= 10) {
        return json("Charge (buy energy)")
    } else if (timestep >= 34 && timestep <= 36) {
        return json("Discharge (Sell energy)")
    } else {
        return json("Normal Operation")
    }
}
