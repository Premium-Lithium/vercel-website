import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { supabase } from '$lib/supabase.ts';
import { openSolarAPI } from '$lib/crm/opensolar-utils.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater'

const MAP_API_TOKEN =
    'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

const crm = new CRM()
const openSolar = new openSolarAPI()


export async function POST({ request }) {
    try {
        const { dealId, option } = await request.json();
        const PLNumber = await crm.getPLNumberFor(dealId);
        let response;
        if (option == 1) {
            response = await generateDnoApplicationFrom(PLNumber);
        } else if (option == 2) {
            const projectData = {
                id: 3307127,
                systems: {uuid: 'F732C7A4-FE62-4F00-ADE5-8E127C1E362C'}
            }
            response = await downloadSystemImageFrom(projectData)
        } else if (option == 3) {
            response = await createOpenSolarProjectFrom(PLNumber);
        }
        const responseData = await response?.json();
        return json(responseData);
    } catch (error) {
        console.log('Error:', error);
        return json({ message: "Internal server error", statusCode: 500 });
    }
}

async function fetchPostcodeFromAddress(address) {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${MAP_API_TOKEN}`;
    try {
        const geocodingResponse = await fetch(endpoint);

        if (geocodingResponse.ok) {
            const data = await geocodingResponse.json();

            const address = data.features[0].matching_place_name;
            const postCode = address.split(",").map(s => s.trim().match(/([A-Za-z]{1,2}\d{1,2})(\s?(\d?\w{2}))?/)).filter(e => e)[0][0]
            return postCode;
        } else {
            console.error('Bad Response');
        }
    } catch (error) {
        console.error('Bad Catch');
    }
}

async function fetchLongLatFrom(address) {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${MAP_API_TOKEN}`;
    try {
        const geocodingResponse = await fetch(endpoint);

        if (geocodingResponse.ok) {
            const data = await geocodingResponse.json();
            const latLong = data.features[0].geometry.coordinates;
            return latLong
        } else {
            console.error('Bad Response');
        }
    } catch (error) {
        console.error('Bad Catch');
    }
}

async function getG99TemplateDocx() {
    const { data, error } = await supabase
        .storage
        .from('g99_form_template')
        .download('G99_template.docx')
    return data
}

async function getDnoDetailsFrom(dnoCode: string) {
    //Loads details from supabase
    const { data, error } = await supabase
        .from('network_operator')
        .select('operator_details')
        .eq('code', dnoCode)
    return data[0].operator_details
}

async function generateDnoApplicationFrom(PLNumber: string) {

    
    const customerName = await crm.getPersonNameFor(PLNumber);
    const customerAddress = await crm.getCustomFieldDataFor(PLNumber, 'Address of Property');
    const customerPostcode = await fetchPostcodeFromAddress(customerAddress);
    const customerEmail = (await crm.getPersonEmailFor(PLNumber))[0].value;
    const customerTelephone = (await crm.getPersonTelephoneFor(PLNumber))[0].value;
    const customerMpan = await crm.getMpanFor(PLNumber);

    // TO DO - checks if a design exist on openSolar 
    await openSolar.searchForProjectFrom(customerAddress)
    
    console.log('Network Operator Not Found')
    return json({ message: 'Network Operator Not Found', status: 500 })
    /*
    //const dnoCompanyCode = await getNetworkOperatorFromPostCode(customerPostcode);
    const dnoCompanyCode = "NPG"
    const dnoCompanyDetailsData = await getDnoDetailsFrom(dnoCompanyCode);
    if (dnoCompanyCode) {
        const fieldsToUpdate = {
            'dno_company.name': dnoCompanyDetailsData.name,
            'dno_company.address': dnoCompanyDetailsData.address,
            'dno_company.email': dnoCompanyDetailsData.email,
            'customer.name': customerName,
            'customer.address': customerAddress,
            'customer.postcode': customerPostcode,
            'customer.contact_person': '',
            'customer.telephone': customerTelephone,
            'customer.email': customerEmail,
            'customer.mpan': customerMpan,
            'installer.contact_person': '',
            'installer.telephone': '',
            'manufacturer.name': '',
            'energy_code': '',
        }
        const g99DocxTemplate = await getG99TemplateDocx()
        const content = await g99DocxTemplate.arrayBuffer()

        const zip = new PizZip(content)
        const doc = new Docxtemplater(zip)
        doc.render(fieldsToUpdate)
        const buff = doc.getZip().generate({ type: 'nodebuffer' })
        const filePath = `/tmp/G99_${customerName}.docx`
        fs.writeFileSync(filePath, buff)
        //const addFileRequest = await crm.attachFileFor(PLNumber, filePath)
        fs.unlinkSync(filePath);
        console.log('DNO Application Form Generated')
        return json({ message: 'DNO Application Generated', status: 200 })
    } else {
        console.log('Network Operator Not Found')
        return json({ message: 'Network Operator Not Found', status: 500 })
    }*/
}

async function getNetworkOperatorFromPostCode(postcode: string) {
    let res = await fetch(`http://www.ssen.co.uk/distributor-results/Index?distributorTerm=${postcode}`)
    let match;
    try {
        const regex = /<dd class="c-results-list__value">(.*?)<\/dd>/;
        match = regex.exec(await res.text())?.[0];
    }
    catch {
        { } // Do nothing
    }

    return ((match !== undefined) ? (match?.slice(34, -5)) : undefined)
}

async function downloadSystemImageFrom(projectData) {
    const projectId = projectData.id
    const uuid = projectData.fields.systems[0].uuid

    const buff = await openSolar.getBufferImageFrom(projectId, uuid, [500, 500])

    const addressName = (projectData.fields.address).split(' ').join('_')
    const filePath = `${addressName}_Layout.jpeg`
    fs.writeFileSync(filePath, buff)
    return json({message: 'Panel Design Found and Downloaded', status: 200})
}

async function createOpenSolarProjectFrom(PLNumber: string) {

    const customerAddress = await crm.getCustomFieldDataFor(PLNumber, 'Address of Property');
    const customerLongLat = await fetchLongLatFrom(customerAddress)
    // perhaps also post code
    const addressObject = {
        address: customerAddress,
        longLat: customerLongLat
    }
    try {
        await openSolar.startProjectFrom(PLNumber, addressObject)
        return json({message: 'Project succesfully created.', status: 200})
    } catch (error) {
        return json({message: 'Error creating project.', status: 500})
    }
    
}