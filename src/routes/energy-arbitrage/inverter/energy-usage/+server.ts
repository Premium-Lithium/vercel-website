//serve energy usage data

import { json } from '@sveltejs/kit';

export async function GET({url}) {
    // static value: last timestep generation value
    // energy random value between 0.5 and 4 kWh
    let energy = Math.round((Math.random() * 3.5 + 0.5) * 100) / 100;
    let timestep = 0.5; // hours

    return json([energy, timestep]);
}