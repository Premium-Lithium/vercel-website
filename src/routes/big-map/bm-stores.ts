import { writable, type Writable, readable, type Readable } from "svelte/store"

export interface MapResponse {
    ok: boolean,
    message: string,
    statusCode: number,
    body?: any  // Array of map markers, drawings or both
}

export interface MapRequest {
    option: number,
    body: undefined | any,
}

export interface StageFilter {
    id: string
    name: string
}

export interface PipeLineKey {
    name: string,
    id: number
    stages: Array<StageFilter>
}

export interface DealFilter {
    value: number
    status: string
}

export interface PlatformHomeownerFilters {
    signUpDate: Date
    verified: boolean
    solution: PlatformSolution | null
}

export interface PlatformInstallerFilters {
    signUpDate: Date
    verified: boolean
    mcsCertified: boolean
    installation_preferences: Array<string> | null
}

export interface MarkerOptions {
    latLng: LatLongObj
    address: string
    visible: boolean
    marker: google.maps.Marker
    content: string | undefined
    filterOption: DealFilter
    pipelineId: string
    stageId: string
    deal: any
    colour: string
    labelID: string
}

export interface LatLongObj {
    lat: number
    lng: number
}

export interface OptionPanel {
    pipeline: PipeLineKey | undefined
    hideStageOptions: boolean
    stages: Array<string>
    stagesVisible: Array<string>
    filters: Array<string>
    filtersApplied: Array<string>
    markers: Array<MarkerOptions>
    colour: string
    handle: HTMLElement
}

export interface LabelInfo {
    name: string
    id: string
    color: string
}

export interface CampaignKey {
    name: string
    id: string
}

export interface CampaignElementStatus {
    name: string
    description: string
    dateStarted: number
}

export interface CampaignElement {
    formattedAddress: string
    address: any
    currentStatus: CampaignElementStatus
    customerId: string
}

export interface PlatformSolution {
    floors: string
    interests: Array<string>
    structure: string
    heating_method: string
    household_size: string
    ev_charger_power_rating: string
    ev_charger_connector_type: string
    system_description: string
    rennovations_planned: string
}

export interface MCSRegistration {
    registering_body: string
    status: string
}

export interface InstallerProfile {
    "How many years have you been trading?": string
    "How many people work in your company?": string
    "How many installs have your company done to date?": string
    "What made you get into installing renewables?": string
    "What do you do to ensure you leave a job neat and tidy?": string
    "How do you approach problem-solving when faced with unexpected issues on a job?": string
    "How do you stay updated on the latest developments and trends in he industry?": string
    "What aspects of installing renewables do you find most rewarding?": string
    "Please provide the *Policy Number & Provider* of your current Public Liability Insurance": string
}

export interface PlatformHomeowner {
    id: string
    name: string | null
    address: string | null
    email: string | null
    phone_number: string | null
    quote_immediately: boolean | null
    email_verify_code: string | null
    postcode: string | null
    contact_preferences: string | null
    phone_verify_code: string | null
    interests: Array<string> | null
    lat_lon: LatLongObj | null
    date_signed_up: Date
    internal: boolean 
    solution: PlatformSolution | null
}

export interface PlatformInstaller {
    id: string
    address: string
    email_address: string 
    phone_number: string 
    company_name: string 
    company_registration: string | null
    mcs_certification: MCSRegistration | null
    certification_expiry: Date | null
    liability_insurance_certificate: string | null
    insurance_expiry: Date | null
    customer_facing_profile: InstallerProfile | null
    pre_filled_bid: number | null
    installation_preferences: Array<string> | null
    email_verify_code: string
    first_name: string
    phone_verify_code: string | null
    last_name: string
    postcode: string | null
    academy_id: string | null
    date_signed_up: Date 
    internal: boolean
    lat_lon: LatLongObj | null
}

export interface PlatformMarker {
    latLng: LatLongObj
    marker: google.maps.Marker
    address: string
    visible: boolean
    content: string
    filterOption: PlatformHomeownerFilters | PlatformInstallerFilters
    colour: string
}

// Map/UI
export let map: Writable<any> = writable()
export let mapOptionPanels: Writable<Array<OptionPanel>> = writable([])
export let loading: Writable<boolean> = writable(false)

// Pipedrive
export let pipelines: Writable<Array<PipeLineKey>> = writable([]) // Array of all pipelines and IDs
export let selectedPipelines: Writable<Array<number>> = writable([]) // Array of selected pipelines filtered by
export let value: Writable<number> = writable(0)
export let labels: Writable<Array<LabelInfo>> = writable([])
export let statusFilters: Writable<Array<string>> = writable([])
export let wonDate: Writable<string> = writable()
export let installDate: Writable<string> = writable()
export let quoteDate: Writable<string> = writable()
export let checkWonTime: Writable<boolean> = writable(false)
export let checkInstalledTime: Writable<boolean> = writable(false)
export let checkQuoteTime: Writable<boolean> = writable(false)
export let showNullMarkers: Writable<boolean> = writable(false)
export let hidePipelineOptions: Writable<boolean> = writable(false)
export let hideFilterOptions: Writable<boolean> = writable(false)
export let labelFilter: Writable<Array<string>> = writable([]) // Array of label IDs, not names
export let applyLabelColourToMarker: Writable<boolean> = writable(false)
export let hideLabelOptions: Writable<boolean> = writable(false)

export const colourMap: Readable<Map<string, string>> = readable(new Map([
    ['yellow', '#E1F378'],
    ['brown', '#302411'],
    ['purple', '#222F60'],
    ['orange', '#F9BF3B'],
    ['blue', '#35BBED'],
    ['red', '#F0302E'],
    ['pink', '#F6A19A'],
    ['green', '#C9FC50'],
    ['dark-gray', '#464748']
]));

// Feedback Email
export const enableFeedback: Writable<boolean> = writable(false)
export let feedbackOptions: Writable<Array<string>> = writable([])
export let feedbackMessage: Writable<string> = writable()
export let feedbackSubmitted: Writable<boolean> = writable(false)

// Campaign
export let campaignKey: Writable<Array<CampaignKey>> = writable([])
export let selectedCampaigns: Writable<Array<CampaignKey>> = writable([])
export let campaignMarkers: Writable<Array<google.maps.Marker>> = writable([])

// Heatmap
export let osHeatmap: Writable<google.maps.visualization.HeatmapLayer> = writable()
export let campaignHeatmap : Writable<google.maps.visualization.HeatmapLayer> = writable()

// TEMPORARY UNTIL PIPEDRIVE PROJECTS ACCESS
export let installerMarkersArray: Writable<Array<google.maps.Marker>> = writable([])
export let installersVisible: Writable<boolean> = writable(false)
export let customerMarkersArray: Writable<Array<google.maps.Marker>> = writable([])
export let customersVisible: Writable<boolean> = writable(false)

// Platform
export let platformHomeownerMarkers: Writable<Array<PlatformMarker>> = writable([])
export let platformInstallerMarkers: Writable<Array<PlatformMarker>> = writable([])