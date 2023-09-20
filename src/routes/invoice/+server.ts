import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import validate from '../../lib/validation-utils.js';
//import type { PageServerLoad } from './$types';

import { pd, readCustomDealField, dealFieldsRequest, readCustomProductField, productFieldsRequest } from '../../lib/pipedrive-utils.js';


async function fetchAllProductsData() {
    try{
        const pdProductsApi = new pipedrive.ProductsApi(pd);
        const response = await pdProductsApi.getProducts();

        if(response.success){
            let data = JSON.stringify(response.data);
            console.log(response.data);
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

function extractNameFrom(productData){
    const name = productData.name;
    console.log(name);
    return name;
}

function extractPriceFrom(productData){
    const price = productData.prices.map(priceObj => priceObj.price);
    console.log(price);
    return price;
}

function extractWarrantyFrom(productData){
    const warranty = readCustomProductField("Warranty Period", productData);
    console.log(warranty);
    return warranty;
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

function filterProduct(productsData, batteryInfo){
    const filteredProduct = productsData.find(product =>
        product.name.includes(String(batteryInfo['batterySize'])) && product.name.includes(String(batteryInfo['batteryName'].toLowerCase()))
    );
    return filteredProduct;

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
        let productsData = await fetchAllProductsData();
        const filteredProductData = filterProduct(productsData, batteryInfo);
        console.log(filteredProductData)
        const productName = extractNameFrom(filteredProductData);
        const priceValues = extractPriceFrom(filteredProductData);
        const productWarranty = extractWarrantyFrom(filteredProductData);
        return json(priceValues);

    } catch (error) {
        console.error('Error:', error);
        return json({error : 'An error occurred'}, {status : 500});
    }
}