

import { describe, expect, it, test } from 'vitest'

// test data structure, example for price check function, which is gone now :'-(
const priceCheckDatum = {
    "daytimeEnergyPrice": 0.74,
    "nightEnergyPrice": 0.22,
    "totalEnergyUse": 4344.16,
    "nightEnergyRatio": 0.45,
    "totalEnergyPrice": 2198.14
}

const priceCheckStructure = ["daytime energy price £/kwh" ,"nighttime energy price £/kwh", "annual energy use", "ratio used at night, as decimal", "return: amount spent in total"];


describe.skip("price check", () => {
    test.each([
        [0.74,0.22,4344.16,0.45,2198.14],
        [0.35,0.23,9433.49,0.17,3109.28],
        [0.63,0.23,12939.21,0.4,6081.43],
        [0.69,0.24,1054.53,0.77,362.23],
        [0.51,0.16,13840.44,0.28,5702.26],
        [0.3,0.17,12434.81,0.18,3439.47],
        [0.65,0.06,2167.55,0.19,1165.93],
        [0.56,0.14,6614.5,0.7,1759.46],
        [0.63,0.09,2928,0.58,927.59],
        [0.32,0.07,7110.16,0.38,1599.79],
        [0.35,0.23,4190.81,0.31,1310.89],
        [0.32,0.17,7264.86,0.43,1856.17],
        [0.3,0.14,10078.14,0.15,2781.57],
        [0.77,0.12,13893.16,0.26,8349.79],
        [0.29,0.1,5914.78,0.23,1456.81],
        [0.78,0.15,5684.89,0.56,2428.59]
    ])('priceCalc(%i, %i, %i, %i) -> %i', (a, b, c, d, e) => {
        expect(priceCalc(a,b,c,d)).toBe(e);
    })
});


