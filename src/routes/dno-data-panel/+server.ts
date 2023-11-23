import { json } from '@sveltejs/kit';
import fs, { readFile } from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { supabase } from '$lib/supabase.ts';
import { openSolarAPI } from '$lib/crm/opensolar-utils.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater'
import ImageModule from 'docxtemplater-image-hyperlink-module-free'
import dateFormat from 'dateformat'
import libre from 'libreoffice-convert'
import PDFMerger from 'pdf-merger-js'
import { patchDocument, Table, TableCell, TableRow, PatchType, TextRun, VerticalAlign, TextDirection } from 'docx'
import svg2img from 'svg2img'

const MAP_API_TOKEN =
    'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

const crm = new CRM()
const openSolar = new openSolarAPI()

interface ProjectData {
    projectId: string
    uuid: string
}

let projectFound: ProjectData | undefined = undefined;

export async function POST({ request }) {
    let response
    try {
        const { dealId, userId, option } = await request.json();
        const PLNumber = await crm.getPLNumberFor(dealId);
        const projectId = await getOpenSolarProject(PLNumber)
        if (projectId !== null) {
            projectFound = await getOpenSolarProjectDetails(projectId)
        }
        // TODO change this to a switch statement
        if (option === 1) {
            response = await generateDnoApplicationFrom(PLNumber, userId);
        } else if (option === 2) {
            response = await createOpenSolarProjectFrom(PLNumber);
        } else if (option === 3) {
            response = await uploadDesignImage(PLNumber, projectFound)
        } else if (option === 4) {
            response = await buildContractFrom(PLNumber, projectFound, userId)
        } else if (option === 5) {
            response = await createDnoPdf(PLNumber)
        } else {
            return initValidation(PLNumber, projectId, projectFound, await checkIfDNOCreatedFor(PLNumber), userId)
        }
        return new Response(JSON.stringify(response))
    } catch (error) {
        console.log('Error:', error);
        return json({ message: 'DNO: Internal Server Error', statusCode: 500 });
    }
}

async function initValidation(PLNumber: string, projectId: string | null, projectFound: ProjectData | null, dnoCreated: boolean, userId: string) {
    if (projectId) {
        if (projectFound) {
            if (dnoCreated) {
                return json({
                    message: "DNO Application Found", statusCode: 200, status: "Review G99 Document", buttonDisable: {
                        openSolarBtnDisable: true,
                        dnoApplicationBtnDisable: true,
                        getDesignImageBtnDisable: false,
                        contractButtonDisable: false,
                        buildPDFContractDisable: (!(await crm.getNetworkOperatorFor(PLNumber) && dnoCreated)),
                    }, currentSignatory: await crm.getCurrentUser(userId)
                })
            }
            return json({
                message: "Design Found", statusCode: 200, status: "Create Documents", buttonDisable: {
                    openSolarBtnDisable: true,
                    dnoApplicationBtnDisable: false,
                    getDesignImageBtnDisable: false,
                    contractButtonDisable: false,
                    buildPDFContractDisable: true,
                }, currentSignatory: await crm.getCurrentUser(userId)
            })
        }
        return json({
            message: "Open Solar Project Found", statusCode: 200, status: "Design in Open Solar Project/Create Documents", buttonDisable: {
                openSolarBtnDisable: true,
                dnoApplicationBtnDisable: false,
                getDesignImageBtnDisable: false,
                contractButtonDisable: false,
                buildPDFContractDisable: true,
            }, currentSignatory: await crm.getCurrentUser(userId)
        })
    }
    return json({
        message: "Open Solar Project Not Found", statusCode: 200, status: "Create Open Solar Project", buttonDisable: {
            openSolarBtnDisable: false,
            dnoApplicationBtnDisable: false,
            getDesignImageBtnDisable: true,
            contractButtonDisable: false,
            buildPDFContractDisable: true,
        }, currentSignatory: await crm.getCurrentUser(userId)
    })
}

async function getOpenSolarProject(PLNumber: string): Promise<string | null> {
    const projectId = await crm.getOpenSolarProjectIdFor(PLNumber);
    if (projectId)
        return projectId
    return null
}

async function getOpenSolarProjectDetails(projectId: string): Promise<ProjectData | null> {
    const designFound = await openSolar.searchForDesignFrom(projectId)
    if (designFound)
        return { projectId: projectId, uuid: designFound }
    return null
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
    if (error) {
        return null
    }
    return data
}

async function getDnoDetailsFrom(operatorName: string) {
    try {
        // Loads details from supabase
        const { data, error } = await supabase
            .from('network_operator')
            .select('operator_details, code');
        const desiredOperator = data?.find(operator => operator.operator_details.name.split(',')[0] === operatorName.split(',')[0]);
        return desiredOperator || null;
    } catch (error) {
        console.error('Error fetching operator details:', error);
        return null;
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

async function generateDnoApplicationFrom(PLNumber: string, userId: string) {
    const customerName = await crm.getPersonNameFor(PLNumber);
    const customerAddressObject = await crm.getAddressFor(PLNumber);
    const customerEmail = (await crm.getPersonEmailFor(PLNumber))[0].value;
    const customerTelephone = (await crm.getPersonTelephoneFor(PLNumber))[0].value;
    const customerMpan = await crm.getMpanFor(PLNumber);
    const existingManufacturer = await crm.getExistingManufacturerFor(PLNumber)
    const existingManufacturerRef = await crm.getExistingManufacturerRefFor(PLNumber)
    const existingStorageCapacity = parseInt(await crm.getExistingStorageCapacityFor(PLNumber))
    const newManufacturer = await crm.getNewManufacturerFor(PLNumber)
    const newManufacturerRef = await crm.getNewManufacturerRefFor(PLNumber)
    const newInverterSize = parseInt(await crm.getNewInverterSizeFor(PLNumber))
    const newStorageCapacity = parseInt(await crm.getNewStorageCapacityFor(PLNumber))
    const phaseAndPower = await crm.getPhaseAndPowerFor(PLNumber)

    // This array doesn't get caught by the check later on so validating it here
    if (!phaseAndPower[1])
        phaseAndPower[1] = ''
    if (!phaseAndPower[2])
        phaseAndPower[2] = ''

    const missingDetails = validateDnoDetails(phaseAndPower, customerMpan, newManufacturerRef, newManufacturer, newInverterSize.toString())

    if (!!missingDetails.length) {
        return json({ message: `G99 Application Generation failed - missing entries for ${missingDetails.join(', ')}`, statusCode: 400, buttonDisable: [true, false] })
    }

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
        dnoCompanyDetailsData = dnoDetails.operator_details
        await crm.setNetworkOperatorCodeFor(PLNumber, dnoDetails.code)
    }

    const date = new Date();
    const pdUser = await crm.getCurrentUser(userId);

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
        'installer.contact_person': 'dno@premiumlithium.com',
        'installer.telephone': '08006448899',
        'manufacturer.name': '',
        'energy_code': '',
        'panel_layout': '', // empty string for now in case we want to add it back in

        'manufacturer_existing': existingManufacturer,
        'manufacturerRef_existing': existingManufacturerRef,
        'capacityThreePhase_existing': (phaseAndPower[0] === 'Three Phase' && existingManufacturer) ? phaseAndPower[1] + 'kw' : '',
        'capacityPhaseOne_existing': (phaseAndPower[0] === 'Single phase' && existingManufacturer) ? phaseAndPower[1] + 'kw' : '',
        'storageCapacity_existing': (existingStorageCapacity) ? existingStorageCapacity + 'kw' : '',
        'manufacturer_new': newManufacturer,
        'manufacturerRef_new': newManufacturerRef,
        'installationDate_new': 'ASAP',
        'capacityThreePhase_new': (phaseAndPower[0] === 'Three Phase') ? newInverterSize + 'kw' : '',
        'capacityPhaseOne_new': (phaseAndPower[0] === 'Single phase') ? newInverterSize + 'kw' : '',
        'storageCapacity_new': (newStorageCapacity) ? newStorageCapacity + 'kw' : '',
        'schematic': '/tmp/schematic.png',
        'date': `${dateFormat(date, 'dd/mm/yyyy')}`,
        'signatory': `${(pdUser) ? pdUser : ''}`,
    }

    for (let key in fieldsToUpdate) {
        if (!fieldsToUpdate[key]) {
            fieldsToUpdate[key] = '';
        }
    }

    const schematic = await generateSchematicFor(PLNumber)
    if (schematic === null) {
        return json({ message: 'Schematic not found', statusCode: 503 })
    } else if (!schematic) {
        return json({ message: 'New Battery or Solar Panel Required on PipeDrive for Schematic' })
    }
    let schematicPathSvg = '/tmp/schematic.svg'
    let schematicPathPng = '/tmp/schematic.png'

    fs.writeFileSync(schematicPathSvg, schematic);

    svg2img(schematicPathSvg, function (error, outputBuffer) {
        fs.writeFileSync(schematicPathPng, outputBuffer)
    });

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
                return //imageFileContent;
            } else if (tagName === 'schematic') {
                return fs.readFileSync(schematicPathPng);
            }
            return { rotation: 90 };
        }
    };

    const g99DocxTemplate = await getG99TemplateDocx()
    if (!g99DocxTemplate) {
        return json({ message: 'DNO Template Not Found', statusCode: 404 })
    }

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
    await sendNotificationMailFor(PLNumber)

    fs.unlinkSync(DocxFilePath);
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
    const existingInverterSize = await crm.getExistingInverterSizeFor(PLNumber); // number
    const newBatterySize = await crm.getNewBatterySizeFor(PLNumber) // string
    const newInverterSize = await crm.getNewInverterSizeFor(PLNumber) // string
    const newPanelGeneration = parseInt(await crm.getNewPanelGenerationFor(PLNumber))
    const epsForCustomer = await crm.getEPSRequiredFor(PLNumber) // string
    const existingPanels = await crm.getCurrentlyHavePanelsFor(PLNumber)
    if (existingPanels === 'Yes')
        existingSolarSize = parseInt(await crm.getExistingSolarArrayGenerationFor(PLNumber))

    // Generates the title of the target schematic - can't use arrays as keys in a map as initially planned so just generating the schematic title string
    let targetSchematic = `${isPartOfSchematic(existingSolarSize)}EP-${isPartOfSchematic(newPanelGeneration)}NP-${isPartOfSchematic(newBatterySize)}B-${isPartOfSchematic(epsForCustomer)}CO.svg`
    if (targetSchematic === "NEP-NNP-NB-NCO.svg") return // not applicable and missing details

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

async function downloadSystemImageFrom(projectData: ProjectData, filePath: string) {
    const projectId = projectData.projectId
    const uuid = projectData.uuid

    const buff = await openSolar.getBufferImageFrom(projectId, uuid, [500, 500])
    fs.writeFileSync(filePath, buff)
    return json({ message: 'Panel Design Found and Downloaded', status: 200 })
}

async function uploadDesignImage(PLNumber: string, projectData: ProjectData) {
    const panelImagePath = '/tmp/OpenSolarDesign.jpeg'
    await downloadSystemImageFrom(projectData, panelImagePath)

    await crm.attachFileFor(PLNumber, panelImagePath)

    return json({ message: 'Design Image Generated and Attached', statusCode: 200 })
}

async function createOpenSolarProjectFrom(PLNumber: string) {
    const customerAddressObject = await crm.getAddressFor(PLNumber);
    if (customerAddressObject.formatted_address === null) {
        return json({ message: 'Address not found for deal', status: 200 })
    }
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
        crm.attachNoteFor(PLNumber, `OpenSolar Project has been created for this deal. https://app.opensolar.com/#/projects/${createProjectRes.id}/design`)
        return json({ message: 'Project succesfully created.', status: 200, projectLink: "https://app.opensolar.com/#/projects/" + createProjectRes.id + "/design" })
    } catch (error) {
        return json({ message: 'Error creating project.', status: 500 })
    }
}

async function getContractTemplate() {
    const { data, error } = await supabase
        .storage
        .from('contract_template')
        .download('contract_template.docx')
    if (error) {
        return null
    }
    return data
}

/**
 * Builds contract form using data from PipeDrive and OpenSolar
 * @param PLNumber identifier for deal
 * @param projectFound project on OpenSolar
 * @returns success if document created properly, error if template not found, required data not found, document failed to upload
 */
async function buildContractFrom(PLNumber: string, projectFound: ProjectData | undefined, userId: string) {
    const contractRes = await getContractTemplate()
    if (contractRes === null)
        return json({ message: "Could not retrieve contract template", statusCode: 404 })
    const contractTemplate = await contractRes.arrayBuffer()
    const path = `/tmp/contract_template.docx` // Actual location for production
    fs.writeFileSync(path, Buffer.from(contractTemplate), { encoding: 'utf-8', flag: 'w' })

    // Getting the contract contents from pipedrive
    const contractData = await getContractDataFor(PLNumber, projectFound, userId)

    // Patching reference: https://docx.js.org/#/usage/patcher?id=patches
    patchDocument(fs.readFileSync(path), {
        patches: {
            test: {
                type: PatchType.PARAGRAPH,
                children: [new TextRun("Test")]
            }
        }
    })

    return json({ message: "Success Test", status: 200 })
}

async function getContractDataFor(PLNumber: string, projectFound: ProjectData | undefined, userId: string) {
    return {
        customerName: await crm.getPersonNameFor(PLNumber),
        customerAddress: await crm.getAddressFor(PLNumber),
        signatory: await crm.getCurrentUser(userId),
    }
}

async function sendNotificationMailFor(PLNumber: string) {
    const emailData = {
        sender: 'dno@premiumlithium.com',
        recipients: ['dno@premiumlithium.com'],
        subject: `TO DO: New G99 Form to Review Ref#${PLNumber} ${crm.getPersonNameFor(PLNumber)}`,
        mail_body: `Hi,
        
        There is a new form to review for the following deal:
        
        <a href = https://premiumlithium.pipedrive.com/deal/${await crm.getDealIdFromPL(PLNumber)}>PipeDrive Deal ${PLNumber}</a>`,
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

async function checkIfDNOCreatedFor(PLNumber: string): Promise<boolean> {
    const files = await crm.getFilesFor(PLNumber)
    for (let file in files) {
        if (files[file].name.includes('G99_')) {
            return true
        }
    }
    return false
}

// Get DNO name from Pipedrive X
// With name, get DNO details from supabase X
// Get Single or Three Phase from pipedrive X
// With Single/Three Phase, get datasheet from supabase and write to a PDF file X
// Get DNO document from pipedrive and write to a docx file X
// Convert DNO document to PDF
// Merge DNO PDF and Datasheet PDF
// Upload to PipeDrive
// Send to relevant DNO email (use temporary email for now)
// Fail on DNO details not found in database and conversion errors
async function createDnoPdf(PLNumber: string) {
    const dnoDocxPath = '/tmp/dno.docx'
    const dnoPdfPath = '/tmp/dno.pdf'
    const dealId = await crm.getDealIdFromPL(PLNumber)
    const personName = await crm.getPersonNameFor(PLNumber)
    const customerNetworkOperatorCode = await crm.getNetworkOperatorFor(PLNumber)
    const customerPhase = (await crm.getPhaseAndPowerFor(PLNumber))[0]
    const fileId = (await crm.getFileFor(dealId.toString(), 'G99_' + personName)).id
    const customerDno = await getCustomerDnoFromCode(customerNetworkOperatorCode)
    if (!customerDno)
        return ({ message: "Error - Failed to find Network Operator on Database", statusCode: 400 })
    const datasheet = await getDatasheetPathFor(customerPhase)
    if (!datasheet)
        return ({ message: "Error - Failed to find Schematic on Database" })
    await crm.downloadPipedriveFileTo(fileId, dnoDocxPath)
    await convertDocToPdf(dnoDocxPath, dnoPdfPath)

    return ({ message: "DNO Application with Datasheets created", statusCode: 200 })
}

async function getCustomerDnoFromCode(code: string) {
    const { data, error } = await supabase
        .from('network_operator')
        .select('operator_details')
        .eq('code', code)
    if (!error)
        return data
    return null
}

// Returns the path, not the actual file 
async function getDatasheetPathFor(phase: string) {
    const { data, error } = await supabase
        .storage
        .from('inverter_datasheets')
        .download((phase === "Three Phase") ? 'three_phase_inverter' : 'single_phase_inverter')
    if (!error) {
        const datasheet = await data.arrayBuffer()
        const path = `/tmp/inverter_datasheet.pdf`
        fs.writeFileSync(path, Buffer.from(datasheet), { encoding: 'utf-8', flag: 'w' })
        return path
    }
    return null
}

async function convertDocToPdf(docPath: string, pdfPath: string) {
    pdfPath = './static/pdf.pdf'
    let pdfBuffer: Buffer
    const docxBuffer = await fs.readFileSync(docPath)
    await libre.convert(docxBuffer, '.pdf', undefined, (err, data) => {
        if (err) {
            console.log(err)
            return null
        }
        pdfBuffer = data
    })
    // It complains but its fine - it never gets here if it fails
    fs.writeFileSync(pdfPath, pdfBuffer)
}