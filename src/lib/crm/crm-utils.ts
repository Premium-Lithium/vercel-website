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

	async getDealDataFor(PLNumber: string) {
		const dealId = await this.getDealIdFromPL(PLNumber)
		const dealRequest = await this.pdDealsApi.getDeal(dealId)
		return dealRequest.data
	}
	async getPersonNameFor(PLNumber: string) {
		const dealData = await this.getDealDataFor(PLNumber)
		return dealData.person_id.name
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

	async attachPdfFor(PLNumber: string, filePath: string) {
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

