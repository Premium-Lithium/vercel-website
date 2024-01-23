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
    solution: PlatformSolution | null
    awaitingDesign: boolean
}

export interface PlatformInstallerFilters {
    signUpDate: Date
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

export interface PlatformBid {
    timestamp: Date
    installer_id: string
    revenue_share: number
}

export interface PlatformJob {
    id: string
    homeowner_id: string
    energiser_configuration: any
    system_type: Array<string> | null
    update_timescale: number | null
    num_desired_quotes: number
    status: string
    bids: PlatformBid | null
    open_solar_project_id: number | null
    date_quotes_requested: Date | null
}

export interface PlatformMarker {
    latLng: LatLongObj
    marker: google.maps.Marker
    address: string
    visible: boolean
    content: string
    filterOption: PlatformHomeownerFilters | PlatformInstallerFilters
    colour: string
    verified: boolean
    type: "installer" | "homeowner"
    data: PlatformHomeowner | PlatformInstaller
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
export let platformJobs: Writable<Array<PlatformJob>> = writable([])
export let installerColour: Writable<string> = writable("#35bbed")
export let homeownerColour: Writable<string> = writable("#c9fc50")

// Markers
export let markerBasePath: Readable<string> = readable("M 15.00,14.00 C 15.00,14.00 14.54,17.32 14.54,17.32 14.23,19.63 13.42,21.86 12.17,23.84 12.17,23.84 12.17,23.84 12.17,23.84 11.00,25.69 10.22,27.76 9.86,29.91 9.86,29.91 9.54,31.83 9.54,31.83M 4.00,14.00 C 4.00,14.00 4.36,17.35 4.36,17.35 4.61,19.69 5.42,21.92 6.73,23.87 6.73,23.87 6.73,23.87 6.73,23.87 7.96,25.70 8.75,27.77 9.06,29.95 9.06,29.95 9.32,31.88 9.32,31.88M 17.50,8.50 C 17.50,12.92 13.92,16.50 9.50,16.50 5.08,16.50 1.50,12.92 1.50,8.50 1.50,4.08 5.08,0.50 9.50,0.50 13.92,0.50 17.50,4.08 17.50,8.50 Z")
export let markerTrianglePath: Readable<string> = readable("M 9.43,1.75 C 9.43,1.75 9.00,1.00 9.00,1.00 9.00,1.00 8.57,1.75 8.57,1.75 8.57,1.75 1.64,13.75 1.64,13.75 1.64,13.75 1.21,14.50 1.21,14.50 1.21,14.50 2.07,14.50 2.07,14.50 2.07,14.50 15.93,14.50 15.93,14.50 15.93,14.50 16.79,14.50 16.79,14.50 16.79,14.50 16.36,13.75 16.36,13.75 16.36,13.75 9.43,1.75 9.43,1.75 Z M 14.51,15.00 C 14.51,15.00 14.05,18.32 14.05,18.32 13.73,20.63 12.92,22.86 11.68,24.84 11.68,24.84 11.68,24.84 11.68,24.84 10.51,26.69 9.73,28.76 9.37,30.91 9.37,30.91 9.05,32.83 9.05,32.83M 3.51,15.00 C 3.51,15.00 3.87,18.35 3.87,18.35 4.12,20.69 4.93,22.92 6.24,24.87 6.24,24.87 6.24,24.87 6.24,24.87 7.47,26.70 8.26,28.77 8.56,30.95 8.56,30.95 8.83,32.88 8.83,32.88")
export let markerSquarePath: Readable<string> = readable("M 16.50,0.50 C 16.50,0.50 16.50,15.50 16.50,15.50 16.50,15.50 1.50,15.50 1.50,15.50 1.50,15.50 1.50,0.50 1.50,0.50 1.50,0.50 16.50,0.50 16.50,0.50 Z M 14.51,14.00 C 14.51,14.00 14.05,17.32 14.05,17.32 13.73,19.63 12.92,21.86 11.68,23.84 11.68,23.84 11.68,23.84 11.68,23.84 10.51,25.69 9.73,27.76 9.37,29.91 9.37,29.91 9.05,31.83 9.05,31.83M 3.51,14.00 C 3.51,14.00 3.87,17.35 3.87,17.35 4.12,19.69 4.93,21.92 6.24,23.87 6.24,23.87 6.24,23.87 6.24,23.87 7.47,25.70 8.26,27.77 8.56,29.95 8.56,29.95 8.83,31.88 8.83,31.88")

// Loading
export let pipedriveLoading: Writable<boolean> = writable(true)
export let campaignLoading: Writable<boolean> = writable(true)
export let heatmapLoading: Writable<boolean> = writable(true)
export let platformLoading: Writable<boolean> = writable(true)