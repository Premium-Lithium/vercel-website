import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { supabase } from '$lib/supabase.ts';
import { openSolarAPI } from '$lib/crm/opensolar-utils.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater'
import ImageModule from 'docxtemplater-image-hyperlink-module-free'
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
            response = await createOpenSolarProjectFrom(PLNumber);
        }
        const responseData = await response?.json();
        return json(responseData);
    } catch (error) {
        console.log('Error:', error);
        return json({ message: "Internal server error", statusCode: 500 });
    }
}

async function fetchLongLatFrom(address: string) {
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

async function getDnoDetailsFrom(operatorName: string) {
    try {
        // Loads details from supabase
        const { data, error } = await supabase
            .from('network_operator')
            .select('operator_details');

        const desiredOperator = data.find(operator => operator.operator_details.name === operatorName);
        return desiredOperator?.operator_details || null;
    } catch (error) {
        console.error('Error fetching operator details:', error);
        return null;
    }
}


async function generateDnoApplicationFrom(PLNumber: string) {
    const customerName = await crm.getPersonNameFor(PLNumber);
    const customerAddressObject = await crm.getAddressFor(PLNumber);
    const customerEmail = (await crm.getPersonEmailFor(PLNumber))[0].value;
    const customerTelephone = (await crm.getPersonTelephoneFor(PLNumber))[0].value;
    const customerMpan = await crm.getMpanFor(PLNumber);

    // Checks if a project exist with the same PLNumber or same address
    let matchingProjectId = null;

    const searchFromPL = await openSolar.searchForProjectFromRef(PLNumber);
    if (!searchFromPL) {
        const searchFromAddress = await openSolar.searchForProjectFromAddress(customerAddressObject.property_address);
        if (!searchFromAddress) {
            console.log("open solar project not found")
            return json({ message: `Cannot find project for ${PLNumber}`, status: 500 })
        } else {
            matchingProjectId = searchFromAddress
        }
    } else {
        matchingProjectId = searchFromPL
    }

    // Checks if the matching project has a design or not
    const designFound = await openSolar.searchForDesignFrom(matchingProjectId)

    if (!designFound) {
        console.log("open solar design not found")
        return json({ message: `Cannot find design for ${PLNumber}`, status: 500 })
    } else {
        const projectData = {
            id: matchingProjectId,
            uuid: designFound
        }
        const ImgFilePath = '/tmp/panel_layout.jpeg'
        await downloadSystemImageFrom(projectData, ImgFilePath)
        const imageFileContent = fs.readFileSync(ImgFilePath);
        const dnoName = await getNetworkOperatorFromPostCode(customerAddressObject.postcode)
        
        let dnoCompanyDetailsData = {
            name: "",
            address: "",
            email: "",
        }

        // At this stage, even if dno is not found on our database, we still generate DNO Form
        // But do give indication to include DNO ! 
        const dnoDetails = await getDnoDetailsFrom(dnoName);
        if (dnoName && dnoDetails) {
            // Populates the dnoDetails if we have data for it
            dnoCompanyDetailsData = dnoDetails
        }

        const fieldsToUpdate = {
            'dno_company.name': dnoCompanyDetailsData.name,
            'dno_company.address': dnoCompanyDetailsData.address,
            'dno_company.email': dnoCompanyDetailsData.email,
            'customer.name': customerName,
            'customer.address': customerAddressObject.property_address,
            'customer.postcode': customerAddressObject.postcode,
            'customer.contact_person': '',
            'customer.telephone': customerTelephone,
            'customer.email': customerEmail,
            'customer.mpan': customerMpan,
            'installer.contact_person': '',
            'installer.telephone': '',
            'manufacturer.name': '',
            'energy_code': '',
            'panel_layout': ImgFilePath
        }
        const g99DocxTemplate = await getG99TemplateDocx()
        const content = await g99DocxTemplate.arrayBuffer()

        //https://www.npmjs.com/package/docxtemplater-image-hyperlink-module-free 
        const imageOpts = {
            centered: true,
            fileType: "docx",
            getImage: function (tagValue, tagName) {
                return fs.readFileSync(tagValue);
            },
            getSize: function (img, tagValue, tagName) {
                return [300, 300];
            },
            getProps: function (tagValue, tagName) {
                if (tagName === 'panel_layout') {
                    return imageFileContent;
                }
                return null;
            }
        };

        const zip = new PizZip(content)
        const doc = new Docxtemplater(zip, {
            modules: [new ImageModule(imageOpts)],
        })
        doc.render(fieldsToUpdate)
        const buff = doc.getZip().generate({ type: 'nodebuffer' })
        let DocxFilePath;


        if (dnoName && dnoDetails) {
            DocxFilePath = `/tmp/G99_${customerName}.docx`
        } else {
            DocxFilePath = `/tmp/G99_${customerName}_WITHOUT_DNO.docx`
        }

        fs.writeFileSync(DocxFilePath, buff)
        const addFileRequest = await crm.attachFileFor(PLNumber, DocxFilePath)
        fs.unlinkSync(DocxFilePath);
        fs.unlinkSync(ImgFilePath);
        if (dnoName && dnoDetails) {
            console.log('G99 Application Form Generated With DNO Details')
            return json({ message: 'G99 Application Generated With DNO Details', status: 200 })
        } else {
            console.log('G99 Application Form Generated Without DNO Details')
            return json({ message: 'G99 Application Generated Without DNO Details', status: 200 })
        }
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

async function downloadSystemImageFrom(projectData, filePath) {
    const projectId = projectData.id
    const uuid = projectData.uuid

    const buff = await openSolar.getBufferImageFrom(projectId, uuid, [500, 500])

    //const addressName = (projectData.address).split(' ').join('_')
    fs.writeFileSync(filePath, buff)
    return json({ message: 'Panel Design Found and Downloaded', status: 200 })
}

async function createOpenSolarProjectFrom(PLNumber: string) {
    const customerAddressObject = await crm.getAddressFor(PLNumber);
    const customerLongLat = await fetchLongLatFrom(customerAddressObject.property_address)
    const countryData = await openSolar.getCountryData(customerAddressObject.country) // open Solar takes country url data

    const addressObjectRequest = {
        address: customerAddressObject.property_address,
        country: countryData.url,
        zip: customerAddressObject.postcode,
        longLat: customerLongLat
    }
    try {
        await openSolar.startProjectFrom(PLNumber, addressObjectRequest)
        return json({ message: 'Project succesfully created.', status: 200 })
    } catch (error) {
        return json({ message: 'Error creating project.', status: 500 })
    }

}