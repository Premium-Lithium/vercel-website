import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { supabase } from '$lib/supabase.ts';
import { openSolarAPI } from '$lib/crm/opensolar-utils.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater'
import ImageModule from 'docxtemplater-image-hyperlink-module-free'
import { convertFile } from 'convert-svg-to-png'

const MAP_API_TOKEN =
    'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

const crm = new CRM()
const openSolar = new openSolarAPI()

interface ProjectData {
    projectId: string,
    uuid: string
}
let projectFound: ProjectData | undefined = undefined;

export async function POST({ request }) {
    try {
        const { dealId, option } = await request.json();
        const PLNumber = await crm.getPLNumberFor(dealId);
        projectFound = searchForProjectDesign(PLNumber)
        let response;
        if (option == 1) {
            response = await generateDnoApplicationFrom(PLNumber, projectFound);
        } else if (option == 2) {
            response = await createOpenSolarProjectFrom(PLNumber);
        } else {
            const designFound = searchForProjectExistance(PLNumber);
            if (designFound) {
                response = json({ message: "Design found", statusCode: 500 })
            } else {
                response = json({ message: "Design not found", statusCode: 200 })
            }
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

async function searchForProjectExistance(PLNumber: string): boolean {
    const projectId = await crm.getOpenSolarProjectIdFor(PLNumber);
    const projectExists = (await openSolar.getProjectDetailsFrom(projectId) ? true : false)
    return projectExists
}

async function searchForProjectDesign(PLNumber: string): Promise<ProjectData | null> {
    const projectId = await crm.getOpenSolarProjectIdFor(PLNumber);
    const designFound = await openSolar.searchForDesignFrom(projectId)
    if (designFound) {
        return { projectId: projectId, uuid: designFound }
    } else {
        return null
    }
}

function validateDnoDetails(phaseAndPower: Array<string>, customerMpan: string, inverterModelNum: string, inverterManufacturer: string, newInverterSize: string): Array<string> {
    let validDetails = {
        'Single Phase or Three Phase': (!!phaseAndPower[0]) ? true : false,
        'Customer MPAN': (!!customerMpan) ? true : false,
        'Inverter Model Number': (!!inverterModelNum) ? true : false,
        'Inverter Manufacturer': (!!inverterManufacturer) ? true : false,
        'Inverter Size (kWp)': (!!newInverterSize) ? true : false
    }
    let missingDetails = []
    for (let detail in validDetails) {
        if (validDetails[detail] === false) {
            missingDetails.push(detail)
        }
    }
    return missingDetails
}

async function generateDnoApplicationFrom(PLNumber: string, projectFound: ProjectData) {
    const customerName = await crm.getPersonNameFor(PLNumber);
    const customerAddressObject = await crm.getAddressFor(PLNumber);
    const customerEmail = (await crm.getPersonEmailFor(PLNumber))[0].value;
    const customerTelephone = (await crm.getPersonTelephoneFor(PLNumber))[0].value;
    const customerMpan = await crm.getMpanFor(PLNumber);
    const existingManufacturer = await crm.getExistingManufacturerFor(PLNumber)
    const existingManufacturerRef = await crm.getExistingManufacturerRefFor(PLNumber)
    const existingStorageCapacity = await crm.getExistingStorageCapacityFor(PLNumber)
    const newManufacturer = await crm.getNewManufacturerFor(PLNumber)
    const newManufacturerRef = await crm.getNewManufacturerRefFor(PLNumber)
    const newInverterSize = await crm.getNewInverterSizeFor(PLNumber)
    const newStorageCapacity = await crm.getNewStorageCapacityFor(PLNumber)
    const phaseAndPower = await crm.getPhaseAndPowerFor(PLNumber)

    const missingDetails = validateDnoDetails(phaseAndPower, customerMpan, newManufacturerRef, newManufacturer, newInverterSize)

    if (!!missingDetails.length) {
        return json({ message: `G99 Application Generation failed - missing entries for ${missingDetails.join(', ')}`, statusCode: 400 })
    }

    const projectData = {
        id: projectFound.projectId,
        uuid: projectFound.uuid
    }

    const panelImagePath = '/tmp/panel_layout.jpeg'
    await downloadSystemImageFrom(projectData, panelImagePath)
    const imageFileContent = fs.readFileSync(panelImagePath);
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
        'panel_layout': panelImagePath,

        'manufacturer_existing': existingManufacturer,
        'manufacturerRef_existing': existingManufacturerRef,
        'capacityThreePhase_existing': (phaseAndPower[0] === 'Three Phase') ? phaseAndPower[1] : '',
        'capacityPhaseOne_existing': (phaseAndPower[0] === 'Single phase') ? phaseAndPower[1] : '',
        'storageCapacity_existing': existingStorageCapacity,
        'manufacturer_new': newManufacturer,
        'manufacturerRef_new': newManufacturerRef,
        'installationDate_new': 'ASAP',
        'capacityThreePhase_new': (phaseAndPower[0] === 'Three Phase') ? phaseAndPower[2] : '',
        'capacityPhaseOne_new': (phaseAndPower[0] === 'Single phase') ? phaseAndPower[2] : '',
        'storageCapacity_new': newStorageCapacity,
        'schematic': '/tmp/schematic.png'
    }

    const schematic = await generateSchematicFor(PLNumber)
    if (schematic === null) {
        return json({ message: 'Schematic not found', statusCode: 503 })
    }
    let schematicPathSvg = '/tmp/schematic.svg'

    fs.writeFileSync(schematicPathSvg, schematic);

    await convertFile('/tmp/schematic.svg')

    //https://www.npmjs.com/package/docxtemplater-image-hyperlink-module-free 
    const imageOpts = {
        centered: true,
        fileType: "docx",
        getImage: function (tagValue) {
            return fs.readFileSync(tagValue);
        },
        getSize: function (img, tagValue, tagName) {
            if (tagName === 'schematic') {
                return [595, 160];
            }
            return [500, 500];
        },
        getProps: function (tagName) {
            if (tagName === 'panel_layout') {
                return imageFileContent;
            } else if (tagName === 'schematic') {
                return fs.readFileSync('/tmp/schematic.png');
            }
            return null;
        }
    };

    const g99DocxTemplate = await getG99TemplateDocx()
    const content = await g99DocxTemplate.arrayBuffer()

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

    // TO DO: send email with the attachments
    await sendNotificationMailFor(PLNumber)

    fs.unlinkSync(DocxFilePath);
    fs.unlinkSync(panelImagePath);
    if (dnoName && dnoDetails) {
        console.log('G99 Application Form Generated With DNO Details')
        return json({ message: 'G99 Application Generated With DNO Details', statusCode: 200 })
    } else {
        console.log('G99 Application Form Generated Without DNO Details')
        return json({ message: 'G99 Application Generated Without DNO Details', statusCode: 200 })
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

async function generateSchematicFor(PLNumber: string) {
    let existingSolarSize = 0;
    const existingPanels = await crm.getCurrentlyHavePanelsFor(PLNumber)
    if (existingPanels === 'Yes') {
        existingSolarSize = parseInt(await crm.getExistingSolarArrayGenerationFor(PLNumber))
    }
    const existingInverterSize = await crm.getExistingInverterSizeFor(PLNumber); // number
    const newBatterySize = await crm.getNewBatterySizeFor(PLNumber) // string
    const newInverterSize = await crm.getNewInverterSizeFor(PLNumber) // string
    const newPanelGeneration = parseInt(await crm.getNewPanelGenerationFor(PLNumber))
    const epsForCustomer = await crm.getEPSRequiredFor(PLNumber) // string

    // Generates the title of the target schematic - can't use arrays as keys in a map as initially planned so just generating the schematic title string
    let targetSchematic = `${isPartOfSchematic(existingSolarSize)}EP-${isPartOfSchematic(newPanelGeneration)}NP-${isPartOfSchematic(newBatterySize)}B-${isPartOfSchematic(epsForCustomer)}CO.svg`

    // TODO Get from supabase instead
    // let svgString = fs.readFileSync('/static/schematic_templates/' + targetSchematic, { encoding: 'utf8', flag: 'r' });
    const { data, error } = await supabase
        .storage
        .from('schematic_templates')
        .download(targetSchematic)

    if (error) {
        return null
    }

    let svgString = await data?.text()
    svgString = svgString.replace('[Existing Solar Size kW]', existingSolarSize + 'kW')
    svgString = svgString.replace('[Existing Inverter Size kW]', existingInverterSize + 'kW')
    svgString = svgString.replace('[Battery Size kWh]', newBatterySize + 'kWh')
    svgString = svgString.replace('[New Inverter Size kW]', newInverterSize + 'kW')
    svgString = svgString.replace('[New Solar Size kW]', newPanelGeneration + 'kW')

    return svgString
}

// Casts to boolean, returns blank if true, N if false - used to create the string for target schematic file
function isPartOfSchematic(component: string | number) {
    return (!!component) ? '' : 'N';
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
        const createProjectRes = await openSolar.startProjectFrom(PLNumber, addressObjectRequest)
        crm.setOpenSolarProjectIdFor(PLNumber, createProjectRes.id);
        crm.attachNoteFor(PLNumber, createProjectRes.url)
        return json({ message: 'Project succesfully created.', status: 200 })
    } catch (error) {
        return json({ message: 'Error creating project.', status: 500 })
    }

}

async function sendNotificationMailFor(PLNumber: string) {
    const emailData = {
        sender: 'info@premiumlithium.com',
        recipients: ['nicholas.dharmadi@premiumlithium.com'],
        subject: `TO DO: New G99 Form to Review Ref#${PLNumber}`,
        mail_body: `Hi,
        
        There is a new form to review for deals`,
        content_type: "HTML",
    };

    try {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData),
        };

        const mailAttempt = await fetch('https://vercel-website-liart.vercel.app/send-mail', options);

        if (mailAttempt.status === 200) {
            console.log(`Email successfully sent`);
            return json({ message: 'OK', status: 200 });
        } else {
            console.error('Error sending mail');
            return json({ message: 'Error sending mail', status: 500 });
        }
    } catch (error) {
        console.error('Error sending mail:', error);
        return json({ message: 'Error sending mail', status: 500 });
    }
}