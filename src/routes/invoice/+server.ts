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
            //console.log(response.data);
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

function filterProduct(productsData, customerSolution){
    const filteredProduct = productsData.find(product =>
        product.name.includes(String(customerSolution['batterySize_kWh'])) && product.name.includes(String(customerSolution['batteryName'].toLowerCase()))
    );
    return filteredProduct;
}
function extractProductInfo(productData){
    const productName = extractNameFrom(productData);
    const productPrice = extractPriceFrom(productData);
    const productWarranty = extractWarrantyFrom(productData);
    const productInfo = {
        name: productName, 
        price: productPrice, 
        warranty: productWarranty
    };
    return productInfo;
}

async function fetchDealData(dealId) {
    try{
        const pdDealsApi = new pipedrive.DealsApi(pd);
        const requestDeal = await pdDealsApi.getDeal(dealId);

        if(requestDeal.success){
            const dealData = requestDeal.data
            return dealData;
        }else{
            console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
            return json({ error: 'An error occurred' }, { status: 500 });
        }
    }catch(error){
        console.error('Error:', error);
        return json({ error: 'An error occurred' }, { status: 500 });
    }
}

function getCustomerInfo(customerData) {
    console.log("getting customer info..............")
    // We want to strip this down to only the data we care about when sending a quote email
    const customer = {
        name: customerData.person_name,
        email: extractEmailFrom(customerData),
        solution: extractSolutionFrom(customerData),
        pl_contact: extractPLContactFrom(customerData)
    };

    return customer;
}



function extractEmailFrom(customerData) {
    console.log("extracting email...........................")
    const emails = customerData.person_id.email;

    // Try to find a home email first
    const homeEmail = emails.find(email => email.label === 'home');
    if(homeEmail !== undefined){
        return homeEmail.value;
    }
    // Fall back to work email if home email isn't found
    console.log("No home email found, searching for work email...");
    const workEmail = emails.find(email => email.label === 'work');
    if(workEmail !== undefined){
        return workEmail.value;
    }
    // Use any other email that's added, if there is one
    console.log("No work email found, searching for any other email...");
    if(emails.length > 0 && emails[0].value !== '') {
        const firstEmail = emails[0].value;
        console.log(`Using ${firstEmail}...`);
        return firstEmail;
    }

    console.log(`Could not find any email address for ${customerData.person_name}.`);
    return json({status: 500, message: "could not find email"});
}

function getEVCharger(customerData){
    const evChargerField = readCustomDealField("EV Charger?", customerData);
    const evChargerTypeField = readCustomDealField("EV Charger type", customerData);

    let evCharger = {
        included: 0,
        type: null
    };

    if (evChargerField === "Yes"){
        evCharger.included = 1;
        evCharger.type = evChargerTypeField;
    }
    return evCharger;

}

function extractSolutionFrom(customerData) {
    console.log("extract solution...........")
    try{
        const solution = {
            batteryName: readCustomDealField("New Battery Model", customerData),
            batterySize_kWh: parseInt(readCustomDealField("New Battery size (kWh)", customerData)),
            evCharger: getEVCharger(customerData),
            installMonth: readCustomDealField("Installation Date (1st of month)", customerData)
            // todo: Build a complete description of the solution Premium Lithium will provide
        };
        return solution;
    }catch(error){ 
        const solution = {
            batteryName: readCustomDealField("New Battery Model", customerData),
            batterySize_kWh: 15,
            evCharger: { included: 0, type: null }
          }
        return solution;
    }
}

function extractPLContactFrom(customerData) {
    console.log("pl contact..........................")
    // todo: Could there ever be a case where the deal isn't actually linked to someone from premium lithium?
    const bdm = customerData.user_id;
    const plContactPerson = {
        name: bdm.name.split(" ")[0],
        email: bdm.email,
    };

    return plContactPerson;
}

export async function POST({ request }) {
    try{
        const { dealId } = await request.json();
        const dealData = await fetchDealData(dealId);
        const customer = getCustomerInfo(dealData);
        let productsData = await fetchAllProductsData();

        const filteredProductData = filterProduct(productsData, customer.solution);
        const productInfo = extractProductInfo(filteredProductData);
        console.log(customer);
        return json({customer, productInfo});

    } catch (error) {
        console.error('Error:', error);
        return json({error : 'An error occurred'}, {status : 500});
    }
}