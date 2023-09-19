// Calculate solar energy generation based on API calls and input data

/** Variables from the users installation:
 * Nominal Power Output
 * Area of Solar Panels
 * Efficiency of Solar Panels
 * Solar Panels Tilt Angle (Beta)
 * Azimuth Angle of Panel (Ap)
 * Latitude
 * Longitude
 * 
 * * Variables to source from APIs:
 * Cloud Coverage (per timestep)
 * GHI (per timestep)
 * GNI (per timestep)
 * DHI (per timestep)
 * 
 * * Variables to calculate:
 * Solar declination angle
 * Solar hour angle
 * Altitude angle of the sun
 * Azimuth angle of the sun
 * Suns zenith angle
 * Angle of incidence for sunlight on the panels
 * Irradiance incident on solar panels surface
 * Energy output
 */

import { json } from "@sveltejs/kit";

const nominalPowerOutput = 0;
const efficiency = 0;
let forecast = [];
let solarDeclination; // del
let solarAngle; // H
let sunAltitudeAngle; // alpha
let azimuthAngle; // Az
let zenith; // theta z
let angleOfIncidence; // theta
let irradianceIncident; // Ipoa
let energyOutput; // Eout


function getDay(now) {
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);

}

function getLeapYear(now) {
    let year = now.getFullYear;
    return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
}

export async function POST({ request }) {
    // array of [lat, lon, area]
    const loc = await request.json();
    const lat = loc[0];
    const lon = loc[1];
    const area = loc[2];
    const panelTilt = loc[3];
    const panelAzimuth = loc[4];

    // API calls go here, for now just temp variables
    let cloud; // array of length 24, used in irrad to determine whether to use cloudy or clear model
    let irrad; // 2D array of [[DHI, DNI, GHI]] of length 24

    // Calculating day of year and whether it is a leap year
    let now = new Date();
    let day = getDay(now);
    let leapYear = getLeapYear(now);
    let daysOfYear;
    if (leapYear) {
        daysOfYear = 365;
    } else {
        daysOfYear = 366;
    }

    solarDeclination = -23.45 * Math.cos(360 / daysOfYear) * (day - 81);

    // Working over each timestep now
    for (let i = 0; i < irrad[0].length(); i++) {
        solarAngle = (60 * i) / 4 - 180;

        sunAltitudeAngle = Math.asin(
            Math.sin(lat) * Math.sin(solarDeclination) + Math.cos(lat) * Math.cos(solarDeclination) * Math.cos(solarAngle)
        );

        azimuthAngle = Math.asin(-1 * Math.cos(solarDeclination) * Math.sin(solarAngle));

        zenith = 90 - sunAltitudeAngle;

        angleOfIncidence = Math.acos(Math.cos(azimuthAngle) * Math.cos(panelTilt) + Math.sin(zenith) * Math.cos(panelAzimuth - azimuthAngle));

        irradianceIncident = irrad[i][2] - (irrad[i][1] * Math.cos(angleOfIncidence)) + irrad[i][0];

        energyOutput = nominalPowerOutput * irradianceIncident * area * efficiency;

        forecast.push(energyOutput);
    }

    return json(forecast)
}