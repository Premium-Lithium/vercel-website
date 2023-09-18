// API endpoint for setting backup duration

import { json } from "@sveltejs/kit";

// will POST to prediction algorithm to modify instructions

export async function POST ({request, url}) {

    const backupDuration = await request.json();
    const resultMsg = await setBackupDuration(backupDuration);


    return json(resultMsg);

}

// TODO: will update prediction
async function setBackupDuration(duration: number) {
    
    return "duration set to " + duration + " hours";
}