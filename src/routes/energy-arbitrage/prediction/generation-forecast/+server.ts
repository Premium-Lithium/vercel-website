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

const genArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.014837899, 0.014837899, 0.080921501, 0.080921501, 0.160362401, 0.160362401, 0.248834299, 0.248834299, 0.292833199, 0.292833199, 0.231734801, 0.231734801, 0.177966799, 0.177966799, 0.041184, 0.041184, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const nominalPowerOutput = 0;
const efficiency = 0;
let forecast: number[] = [];
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
    // request is just timestep
    const timestep = await request.json();
    return json(genArr[timestep])
}

//TODO make this work with the OpenWeather APIs
export async function POST({ request }) {
    // array of [lat, lon, area]
    const loc = await request.json();
    const lat = loc[0];
    const lon = loc[1];
    const area = loc[2];
    const panelTilt = loc[3];
    const panelAzimuth = loc[4];

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

    const YYYY = now.toLocaleString("default", { year: "numeric" });
    const mm = now.toLocaleString("default", { month: "2-digit" });
    const dd = now.toLocaleString("default", { day: "2-digit" });
    const formattedDate = YYYY + '-' + mm + '-' + dd;

    // API calls
    const cloudRes = fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${'current,minutely,daily,alerts'}&appid={API key}`);
    cloudRes.then((responseBody) => {
        responseBody.json().then((respVal) => {
            let clouds = respVal;
        });
    });
    const irradRes = fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&date=${formattedDate}&appid={API key}`);
    irradRes.then((responseBody) => {
        responseBody.json().then((respVal) => {
            let irrad = respVal;
        });
    });

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
