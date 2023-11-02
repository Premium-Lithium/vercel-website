import { pd, getKeysForCustomFields, getField, getOptionIdFor, readCustomDealField } from '$lib/pipedrive-utils';
import pipedrive from 'pipedrive';

/*
let surveyDataSource = new SurveyDataSource();
const mpan = surveyDataSource.getMpan();
crm.setMpanFor("PL000234", mpan);
*/

export class CRM {
	async setCustomField(PLNumber: string, fieldName: string, value: string, options: boolean) {
		const pdDealsApi = new pipedrive.DealsApi(pd);
		const field = getField(fieldName);

		const dealFound = await pdDealsApi.searchDeals(PLNumber) //Returns array of deal found 
		const dealId = dealFound.data.items[0].item.id

		let request = {[field.key]: value}
		// If field is an option, convert string value to option ID
		if(options === true) {
			request[field.key] = getOptionIdFor(value, field)
		}
		const updateDealRequest = await pdDealsApi.updateDeal(dealId, request)
		return updateDealRequest;
	}

	async getCustomField(PLNumber: string, fieldName: string) {
		const pdDealsApi = new pipedrive.DealsApi(pd);
		const dealFound = await pdDealsApi.searchDeals(PLNumber) 
		const dealId = dealFound.data.items[0].item.id

		const dealRequest = await pdDealsApi.getDeal(dealId)
		return readCustomDealField(fieldName, dealRequest.data)
	}

	async setMpanFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'MPAN number', value, false)
		return updateDealRequest;
	}

	async getMpanFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'MPAN number')
		return fieldResponse
	}

	async setExistingInverterFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Existing Inverter - Make/Model/Size', value, false)
		return updateDealRequest;
	}

	async getExistingInverterFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'Existing Inverter - Make/Model/Size')
		return fieldResponse
	}

	async setRoofPitchFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Pitch', value, false)
		return updateDealRequest;
	}

	async getRoofPitchFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'Pitch')
		return fieldResponse
	}

	async setAzimuthFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Azimuth', value, false)
		return updateDealRequest;
	}

	async getAzimuthFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'Azimuth')
		return fieldResponse;
	}

	async setSurveyStatusFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Site Survey Status', value, false)
		return updateDealRequest;
	}

	async getSurveyStatusFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'Site Survey Status')
		return fieldResponse;
	}

	async setRoofTileTypeFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Roof Tile Type', value, true)
		return updateDealRequest
	}

	async getRoofTileTypeFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'Roof Tile Type')
		return fieldResponse;
	}

	async setScaffoldingRequiredFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Scaffolding Required', value, true)
		return updateDealRequest
	}

	async getScaffoldingRequiredFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'Scaffolding Required')
		return fieldResponse;
	}

	async setRoofStructureTypeFor(PLNumber: string, value: string) {
		const updateDealRequest = await this.setCustomField(PLNumber, 'Roof Structure Type', value, true)
		return updateDealRequest
	}

	async getRoofStructureTypeFor(PLNumber: string) {
		const fieldResponse = await this.getCustomField(PLNumber, 'Roof Structure Type')
		return fieldResponse;
	}
}

