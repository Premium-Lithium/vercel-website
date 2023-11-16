
export interface PipedriveQueryParameters {
    limit?: number,
    start?: number,
    archived_status?: "archived" | "not_archived" | "all",
    owner_id?: number,
    person_id?: number,
    organisation_id?: number,
    filter_id?: number,
    sort?: string,
    owned_by_you?: 0 | 1,
}
export interface PipedriveResponse {
    additional_data: {},
    data: any[],
    success: boolean,
} 
export interface APIResponseData {
    allDeals?: PipedriveResponse,
    allLeads?: PipedriveResponse,
    allFields?: PipedriveResponse,

}
interface LeadSourceData {
    title: string,
    pipedriveSources: array<string>,
    altField?: { // for specific values, check value of another field
        sourceValue: any,
        fieldName?: string,
        fieldKey?: string,
        fieldValue: string,
    }
}