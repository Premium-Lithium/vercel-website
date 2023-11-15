import { pd, getField, getOptionIdFor, readCustomDealField } from '$lib/pipedrive-utils';
import pipedrive from 'pipedrive';


export class CRM {
	pdDealsApi;
	pdFilesApi;
	pdNotesApi;

	constructor() {
		this.pdDealsApi = new pipedrive.DealsApi(pd);
		this.pdFilesApi = new pipedrive.FilesApi(pd)
		this.pdNotesApi = new pipedrive.NotesApi(pd);
	}
	async getDealIdFromPL(PLNumber: string) {
		const dealFound = await this.pdDealsApi.searchDeals(PLNumber) //Returns array of deal found 
		const dealId = Number(dealFound.data.items[0].item.id)
		return dealId
	}
	async setCustomField(PLNumber: string, fieldName: string, value: string) {
		const dealId = await this.getDealIdFromPL(PLNumber)

		const field = getField(fieldName);
		let request = { [field.key]: value }
		// If field is an enum, convert string value to option ID
		if (field.field_type == 'enum') {
			request[field.key] = getOptionIdFor(value, field)
		}
		const updateDealRequest = await this.pdDealsApi.updateDeal(dealId, request)
		if (updateDealRequest.success == false) console.log(`Failed to update deal`)

		return updateDealRequest;
	}

	async setCustomFields(PLNumber: string, request) {
		const dealId = await this.getDealIdFromPL(PLNumber)
		let parsedRequest = {}
		for (const key in request) {
			let field = getField(key)
			if (field.field_type == 'enum') {
				parsedRequest[field.key] = getOptionIdFor(request[key], field)
			} else {
				parsedRequest[field.key] = request[key]
			}
		}
		const dealRequest = await this.pdDealsApi.updateDeal(dealId, parsedRequest)
		return dealRequest
	}

	async getDealDataFor(PLNumber: string) {
		const dealId = await this.getDealIdFromPL(PLNumber)
		const dealRequest = await this.pdDealsApi.getDeal(dealId)
		return dealRequest.data
	}

	async getPersonNameFor(PLNumber: string) {
		const dealData = await this.getDealDataFor(PLNumber)
		return dealData.person_id.name
	}

	async getPersonEmailFor(PLNumber: string) {
		const dealData = await this.getDealDataFor(PLNumber)
		return dealData.person_id.email
	}

	async getPersonTelephoneFor(PLNumber: string) {
		const dealData = await this.getDealDataFor(PLNumber)
		return dealData.person_id.phone
	}

	async getAddressFor(PLNumber: string) {
		const dealData = await this.getDealDataFor(PLNumber)
		const addressObject = {
			property_address: dealData['80ebeccb5c4130caa1da17c6304ab63858b912a1'],
			area_1: dealData['80ebeccb5c4130caa1da17c6304ab63858b912a1_admin_area_level_1'],
			area_2: dealData['80ebeccb5c4130caa1da17c6304ab63858b912a1_admin_area_level_2'],
			formatted_address: dealData['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address'],
			postcode: dealData['80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code'],
			country: dealData['80ebeccb5c4130caa1da17c6304ab63858b912a1_country']
		}
		return addressObject;
		
	}

	async getPLNumberFor(dealId: string) {
		const dealRequest = await this.pdDealsApi.getDeal(dealId)
		return readCustomDealField('PL Number', dealRequest.data)
	}

	async getCustomFieldDataFor(PLNumber: string, fieldName: string) {
		const dealData = await this.getDealDataFor(PLNumber)
		return readCustomDealField(fieldName, dealData)
	}

	async setMpanFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'MPAN number', value)
		return updateDealRequest;
	}

	async getMpanFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'MPAN number')
		return fieldResponse
	}

	async setExistingInverterFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Existing Inverter - Make/Model/Size', value)
		return updateDealRequest;
	}

	async getExistingInverterFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Existing Inverter - Make/Model/Size')
		return fieldResponse
	}

	async setRoofPitchFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Pitch', value)
		return updateDealRequest;
	}

	async getRoofPitchFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Pitch')
		return fieldResponse
	}

	async setAzimuthFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Azimuth', value)
		return updateDealRequest;
	}

	async getAzimuthFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Azimuth')
		return fieldResponse;
	}

	async setSurveyStatusFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Site Survey Status', value)
		return updateDealRequest;
	}

	async getSurveyStatusFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Site Survey Status')
		return fieldResponse;
	}

	async setRoofTileTypeFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Roof Tile Type', value)
		return updateDealRequest
	}

	async getRoofTileTypeFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Roof Tile Type')
		return fieldResponse;
	}

	async setScaffoldingRequiredFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Scaffolding Required', value)
		return updateDealRequest
	}

	async getScaffoldingRequiredFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Scaffolding Required')
		return fieldResponse;
	}

	async setRoofStructureTypeFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Roof Structure Type', value)
		return updateDealRequest;
	}

	async getRoofStructureTypeFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Roof Structure Type')
		return fieldResponse;
	}

	async getExistingManufacturerFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Existing Inverter - Make')
		return fieldResponse;
	}

	async getNewManufacturerFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Manufacturer')
		return fieldResponse;
	}

	async getExistingManufacturerRefFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Existing Inverter - Model Number')
		return fieldResponse;
	}

	async getNewManufacturerRefFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Inverter Model Number')
		return fieldResponse;
	}

	async getExistingStorageCapacityFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Existing Battery size (kWp)')
		return (fieldResponse !== null) ? fieldResponse : 0;
	}

	async getNewStorageCapacityFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'New Battery size (kWh)')
		return fieldResponse;
	}

	async getCurrentlyHavePanelsFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Currently Have Solar Panels?')
		return fieldResponse;
	}

	async getNumberOfPanelsFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Number of Panels')
		return fieldResponse;
	}

	async getNewPanelGenerationFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'New Solar (kWp)')
		return fieldResponse;
	}

	async getExistingSolarArrayGenerationFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Existing Solar Array (kWp)')
		return fieldResponse;
	}

	async getExistingInverterSizeFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'Existing Inverter - Size (kW)')
		return fieldResponse
	}

	async getNewInverterSizeFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'New Inverter size (kWp)')
		return fieldResponse;
	}

	async getNewBatterySizeFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'New Battery size (kWh)')
		return fieldResponse;
	}

	async getEPSRequiredFor(PLNumber: string) {
		const fieldResponse = await this.getCustomFieldDataFor(PLNumber, 'EPS Switch')
		return fieldResponse;
	}

	// Single/three phase and solar generation are tied together, if you want to know one you also want to know the other, so returning them all as one object
	async getPhaseAndPowerFor(PLNumber: string) {
		const phaseType = await this.getCustomFieldDataFor(PLNumber, 'Single Phase or Three Phase')
		const existingSolarGen = await this.getCustomFieldDataFor(PLNumber, 'Existing Solar Array (kWp)')
		const newSolarGen = await this.getCustomFieldDataFor(PLNumber, 'New Solar (kWp)')
		return [phaseType, existingSolarGen, newSolarGen]
	}

	async attachFileFor(PLNumber: string, filePath: string) {
		const dealId = await this.getDealIdFromPL(PLNumber)

		const addFileRequest = await this.pdFilesApi.addFile(filePath, { 'dealId': dealId })
		return addFileRequest;
	}

	async attachNoteFor(PLNumber: string, content: string) {
		const noteRequest = {
			dealId: await this.getDealIdFromPL(PLNumber),
			content: content
		}

		const newNote = await this.pdNotesApi.addNote(noteRequest);
		return newNote
	}
}

