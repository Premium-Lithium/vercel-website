import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import HTMLtoDOCX from 'html-to-docx';
import juice from 'juice';
import { supabase } from '$lib/supabase.ts';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater'

const MAP_API_TOKEN =
    'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

const crm = new CRM()

export async function POST({ request }) {
    try {
        const { dealId } = await request.json();
        const PLNumber = await crm.getPLNumberFor(dealId);

        const propertyAddress = await crm.getCustomFieldDataFor(PLNumber, 'Address of Property');
        const postCode = await fetchPostcodeFromAddress(propertyAddress);

        const g99Docx = await getG99TemplateDocx()

        // Find the target fields to update, then populate these values with the fetched values
        // from Pipedrive or DNO selector
        populateDNOWith(PLNumber, g99Docx)

        return json({ propertyAddress, postCode });
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

async function getG99TemplateDocx() {
    const { data, error } = await supabase
        .storage
        .from('g99_form_template')
        .download('G99_template.docx')
    return data
}

async function getDnoDetailsFrom(dnoCode: string) {
    const { data, error } = await supabase 
        .from('network_operator')
        .select('operator_details')
        .eq('code', dnoCode)
    return data
}

async function populateDNOWith(PLNumber: string, docxData: Blob) {
    const customerName = await crm.getPersonNameFor(PLNumber);
    const customerAddress = await crm.getCustomFieldDataFor(PLNumber, 'Address of Property');
    const customerPostcode = await fetchPostcodeFromAddress(customerAddress);
    const customerEmail = (await crm.getPersonEmailFor(PLNumber))[0].value;
    const customerTelephone = (await crm.getPersonTelephoneFor(PLNumber))[0].value;
    const customerMpan = await crm.getMpanFor(PLNumber);
    const dnoCompanyCode = await getNetworkOperatorFromPostCode(customerPostcode);

    const dnoCompanyDetails = await getDnoDetailsFrom(dnoCompanyCode);

    if (dnoCompanyCode) {
        const fieldsToUpdate = {
            'dno_company': dnoCompanyDetails,
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
        const content = await docxData.arrayBuffer()

        const zip = new PizZip(content)
        const doc = new Docxtemplater(zip)
        doc.render(fieldsToUpdate)
        const buff = doc.getZip().generate({ type: 'nodebuffer' })
        const filePath = `/tmp/G99_${customerName}.docx`
        fs.writeFileSync(filePath, buff)
        //const addFileRequest = await crm.attachFileFor(PLNumber, filePath)
        //fs.unlinkSync(filePath);
        console.log('DNO Application Form Generated')
    } else {
        console.log('dno company not found')
        return json({ message: 'Network Operator Not Found', status: 500 })
    }
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