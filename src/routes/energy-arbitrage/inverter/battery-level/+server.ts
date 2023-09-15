// serve up current battery level

import { json } from '@sveltejs/kit';
let levels = 50;

// levels moves around between 20 and 80

function adjustLevel() {
    if(Math.random() > 0.5) {
        if (levels < 80) {
            ++levels;
        }
    } else {
        if (levels > 20) {
            --levels;
        }
    }
}

setInterval(adjustLevel, 200);

export function GET({url}) {

    // return percentage battery level
    let currentLevel: Number;
    //currentLevel = Math.floor(Math.random() * 60) + 20;
    currentLevel = levels;
    return json(currentLevel);
}