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
import { time } from "console";

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

function formatIrrad(irrad) {
    let arr = [];
    // format irrad into [[dhi, dni, ghi],...]
    for (let i in irrad.irradiance.hourly) {
        let ghi = irrad.irradiance.hourly[i].clear_sky.ghi;
        let dni = irrad.irradiance.hourly[i].clear_sky.dni;
        let dhi = irrad.irradiance.hourly[i].clear_sky.dhi;

        arr.push([dhi, dni, ghi]);
    }

    return arr;
}

async function calculateSolarGeneration(irradArr, timestep, area, panelTilt, panelAzimuth) {

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
    for (let i = 0; i < irradArr[0].length(); i++) {
        solarAngle = (60 * i) / 4 - 180;

        sunAltitudeAngle = Math.asin(
            Math.sin(lat) * Math.sin(solarDeclination) + Math.cos(lat) * Math.cos(solarDeclination) * Math.cos(solarAngle)
        );

        azimuthAngle = Math.asin(-1 * Math.cos(solarDeclination) * Math.sin(solarAngle));

        zenith = 90 - sunAltitudeAngle;

        angleOfIncidence = Math.acos(Math.cos(azimuthAngle) * Math.cos(panelTilt) + Math.sin(zenith) * Math.cos(panelAzimuth - azimuthAngle));

        irradianceIncident = irradArr[i][2] - (irradArr[i][1] * Math.cos(angleOfIncidence)) + irradArr[i][0];

        energyOutput = nominalPowerOutput * irradianceIncident * area * efficiency;

        forecast.push(energyOutput);
    }

    return json(forecast[timestep])
}

export async function POST({ request }) {
    // request is just timestep
    const timestep = await request.json();
    return json(genArr[timestep])
}

//TODO make this work with the OpenWeather APIs
export async function POST({ request }) {
    // array of [lat, lon, area, panelTilt, panelAzimuth, timestep]
    const loc = await request.json();
    const lat = loc[0];
    const lon = loc[1];
    const area = loc[2];
    const panelTilt = loc[3];
    const panelAzimuth = loc[4];
    const timestep = loc[5];

    // Calculating day of year and whether it is a leap year
    let now = new Date();

    const YYYY = now.toLocaleString("default", { year: "numeric" });
    const mm = now.toLocaleString("default", { month: "2-digit" });
    const dd = now.toLocaleString("default", { day: "2-digit" });
    const formattedDate = YYYY + '-' + mm + '-' + dd;

    // API calls
    // TODO decide what to do about the clear sky/cloudy sky models
    let cloudRes = fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${'current,minutely,daily,alerts'}&appid={API key}`);
    cloudRes.then((responseBody) => {
        responseBody.json().then((respVal) => {
            let clouds = respVal;
        });
    });

    let irradRes = fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&date=${formattedDate}&appid={API key}`);
    irradRes.then((responseBody) => {
        responseBody.json().then((respVal) => {
            let irrad = respVal;
        });
    });

    // Example response for dev/testing
    let irrad = {
        "lat": 34,
        "lon": 34,
        "date": "2023-03-28",
        "tz": "+02:00",
        "sunrise": "2023-03-28T05:37:14",
        "sunset": "2023-03-28T18:01:37",
        "irradiance": {
            "daily": [
                {
                    "clear_sky": {
                        "ghi": 6694.67,
                        "dni": 9166.93,
                        "dhi": 1140.04
                    },
                    "cloudy_sky": {
                        "ghi": 6694.67,
                        "dni": 8962.1,
                        "dhi": 1120.64
                    }
                }
            ],
            "hourly": [
                {
                    "hour": 0,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 1,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 2,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 3,
                    "clear_sky": {
                        "ghi": 128.2,
                        "dni": 477.91,
                        "dhi": 53.3
                    },
                    "cloudy_sky": {
                        "ghi": 128.2,
                        "dni": 460.36,
                        "dhi": 47.17
                    }
                },
                {
                    "hour": 4,
                    "clear_sky": {
                        "ghi": 344.02,
                        "dni": 705.53,
                        "dhi": 82.21
                    },
                    "cloudy_sky": {
                        "ghi": 344.02,
                        "dni": 709.46,
                        "dhi": 73.51
                    }
                },
                {
                    "hour": 5,
                    "clear_sky": {
                        "ghi": 553.18,
                        "dni": 816.73,
                        "dhi": 100.14
                    },
                    "cloudy_sky": {
                        "ghi": 553.18,
                        "dni": 801.59,
                        "dhi": 101.82
                    }
                },
                {
                    "hour": 6,
                    "clear_sky": {
                        "ghi": 727.62,
                        "dni": 879.35,
                        "dhi": 111.8
                    },
                    "cloudy_sky": {
                        "ghi": 727.62,
                        "dni": 864.5,
                        "dhi": 115.05
                    }
                },
                {
                    "hour": 7,
                    "clear_sky": {
                        "ghi": 849.19,
                        "dni": 913.88,
                        "dhi": 118.8
                    },
                    "cloudy_sky": {
                        "ghi": 849.19,
                        "dni": 906.71,
                        "dhi": 116.74
                    }
                },
                {
                    "hour": 8,
                    "clear_sky": {
                        "ghi": 906.35,
                        "dni": 928.27,
                        "dhi": 121.84
                    },
                    "cloudy_sky": {
                        "ghi": 906.35,
                        "dni": 909.35,
                        "dhi": 129.82
                    }
                },
                {
                    "hour": 9,
                    "clear_sky": {
                        "ghi": 893.86,
                        "dni": 925.25,
                        "dhi": 121.17
                    },
                    "cloudy_sky": {
                        "ghi": 893.86,
                        "dni": 908.83,
                        "dhi": 126.93
                    }
                },
                {
                    "hour": 10,
                    "clear_sky": {
                        "ghi": 812.89,
                        "dni": 904.28,
                        "dhi": 116.75
                    },
                    "cloudy_sky": {
                        "ghi": 812.89,
                        "dni": 903.82,
                        "dhi": 109.46
                    }
                },
                {
                    "hour": 11,
                    "clear_sky": {
                        "ghi": 670.94,
                        "dni": 861.15,
                        "dhi": 108.19
                    },
                    "cloudy_sky": {
                        "ghi": 670.94,
                        "dni": 855.43,
                        "dhi": 104.91
                    }
                },
                {
                    "hour": 12,
                    "clear_sky": {
                        "ghi": 481.8,
                        "dni": 784.81,
                        "dhi": 94.59
                    },
                    "cloudy_sky": {
                        "ghi": 481.8,
                        "dni": 778.52,
                        "dhi": 90.92
                    }
                },
                {
                    "hour": 13,
                    "clear_sky": {
                        "ghi": 266.39,
                        "dni": 645.45,
                        "dhi": 73.66
                    },
                    "cloudy_sky": {
                        "ghi": 266.39,
                        "dni": 644.9,
                        "dhi": 66.16
                    }
                },
                {
                    "hour": 14,
                    "clear_sky": {
                        "ghi": 60.24,
                        "dni": 324.33,
                        "dhi": 37.59
                    },
                    "cloudy_sky": {
                        "ghi": 60.24,
                        "dni": 218.62,
                        "dhi": 38.14
                    }
                },
                {
                    "hour": 15,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 16,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 17,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 18,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 19,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 20,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 21,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 22,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                },
                {
                    "hour": 23,
                    "clear_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    },
                    "cloudy_sky": {
                        "ghi": 0,
                        "dni": 0,
                        "dhi": 0
                    }
                }
            ]
        }
    }

    return await calculateSolarGeneration(formatIrrad(irrad), timestep, area, panelTilt, panelAzimuth);
}
