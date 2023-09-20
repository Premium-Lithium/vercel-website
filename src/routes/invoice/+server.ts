import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import validate from '../../lib/validation-utils.js';
//import type { PageServerLoad } from './$types';

import { pd, readCustomDealField, dealFieldsRequest } from '../../lib/pipedrive-utils.js';


async function fetchAllProductsData() {
    try{
        const pdProductsApi = new pipedrive.ProductsApi(pd);
        const response = await pdProductsApi.getProducts();

        if(response.success){
            let data = JSON.stringify(response.data);
            data = JSON.parse(data);
            return data;
        }else{
            console.error('Error:', response.statusText);
            return json({ error: 'An error occurred' }, { status: 500 });
        }
    }catch(error){
        console.error('Error:', error);
        return json({ error: 'An error occurred' }, { status: 500 });
    }
}


function extractPriceValue(products, batteryInfo) {
    let price_value = "";

    products.forEach(product => {
        const prices = product.prices;
        if (Array.isArray(prices) && prices.length > 0){
            prices.forEach(priceObj => {
                price_value = priceObj.price;
            });
        }
    });
    console.log(price_value);
    return price_value;
}
function extractBatteryInfo(dealData){
    try{
        const batteryInfo = {   
            batterySize: parseInt(readCustomDealField("New Battery size (kWh)", dealData)),
            batteryName: readCustomDealField("New Battery Model", dealData)
        };
        return batteryInfo;
    }catch(error){
        console.error('Error:', error);
        return json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function POST({ request }) {
    try{
        const { dealId } = await request.json();
        const pdDealsApi = new pipedrive.DealsApi(pd);
        const requestDeal = await pdDealsApi.getDeal(dealId);
        if(requestDeal.success == false) {
            console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
            return json({ error: 'An error occurred' }, { status: 500 });
        }

        const dealData = requestDeal.data
        const batteryInfo = extractBatteryInfo(dealData)
        let productData = await fetchAllProductsData();

        if(productData){
            const filteredProducts = productData.filter(obj =>
                obj.name.includes(String(batteryInfo['batterySize'])) && obj.name.includes(String(batteryInfo['batteryName'].toLowerCase()))
            );

            const priceValues = extractPriceValue(filteredProducts, batteryInfo);
            return json(priceValues);
        }else{
            return json({error:'Failed to fetch product data'}, {status:500});
        }
    } catch (error) {
        console.error('Error:', error);
        return json({error : 'An error occurred'}, {status : 500});
    }
}