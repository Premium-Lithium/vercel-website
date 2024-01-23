import { customerMarkersArray, homeownerColour, installerColour, map, markerBasePath, markerSquarePath, markerTrianglePath, platformHomeownerMarkers, platformInstallerMarkers, platformJobs, platformLoading, type PlatformHomeowner, type PlatformInstaller, type PlatformMarker } from "./bm-stores";
import { get } from 'svelte/store'

// Creates array of markers for 
export async function generatePlatformMarkers() {
    console.log("Getting Platform Data")
    let homeownerRes = await fetch('big-map/supabase/platform-homeowners', {
        method: "GET",
        headers: {
            'Content-Type': 'application-json'
        }
    })
    let installerRes = await fetch('big-map/supabase/platform-installers', {
        method: "GET",
        headers: {
            'Content-Type': 'application-json'
        }
    })
    let jobRes = await fetch('big-map/supabase/platform-jobs', {
        method: "GET",
        headers: {
            'Content-Type': 'application-json'
        }
    })
    let jobs = await jobRes.json()
    if (jobRes.ok) {
        platformJobs.set(jobs.body)
    }
    let homeowners = (await homeownerRes.json()).homeowners
    let homeownerMarkerArray: Array<PlatformMarker> = get(platformHomeownerMarkers)
    for (let homeowner of homeowners) {
        let homeownerMarker = createMarkerForHomeowner(homeowner)
        if (homeownerMarker && !(homeownerMarkerArray.includes(homeownerMarker))) {
            homeownerMarkerArray.push(homeownerMarker)
        }
    }
    let installers = (await installerRes.json()).installers
    let installerMarkerArray: Array<PlatformMarker> = get(platformInstallerMarkers)
    for (let installer of installers) {
        let installerMarker = createMarkerForInstaller(installer)
        if (installerMarker && !(installerMarkerArray.includes(installerMarker))) {
            installerMarkerArray.push(installerMarker)
        }
    }
    platformHomeownerMarkers.set(changeMarkerColour(homeownerMarkerArray, get(homeownerColour)))
    platformInstallerMarkers.set(changeMarkerColour(installerMarkerArray, get(installerColour)))
    platformLoading.set(false)
}

function createMarkerForHomeowner(homeowner: PlatformHomeowner): PlatformMarker | null {
    if (homeowner.lat_lon) {
        let homeownerMarker: PlatformMarker = {
            data: homeowner,
            latLng: homeowner.lat_lon,
            marker: new google.maps.Marker({
                position: new google.maps.LatLng(homeowner.lat_lon.lat, homeowner.lat_lon.lng),
                title: homeowner.name,
                icon: '/marker-base.svg',
            }),
            address: homeowner.address + " " + homeowner.postcode,
            content: formHomeownerMarkerContent(homeowner),
            verified: (homeowner.email_verify_code === "verified") ? true : false,
            type: "homeowner",
            filterOption: {
                signUpDate: homeowner.date_signed_up,
                solution: homeowner.solution,
                awaitingDesign: false
            },
            visible: false,
            colour: get(homeownerColour)
        }
        let markerPopup = new google.maps.InfoWindow({
            content: homeownerMarker.content,
            ariaLabel: homeownerMarker.address
        })
        homeownerMarker.marker.addListener('click', () => {
            markerPopup.open({
                anchor: homeownerMarker.marker
            })
        })
        return homeownerMarker
    }
    return null
}

function createMarkerForInstaller(installer: PlatformInstaller): PlatformMarker | null {
    if (installer.lat_lon) {
        let installerMarker: PlatformMarker = {
            data: installer,
            latLng: installer.lat_lon,
            address: installer.address + " " + installer.postcode,
            verified: (installer.email_verify_code === "verified") ? true : false,
            marker: new google.maps.Marker({
                position: new google.maps.LatLng(installer.lat_lon.lat, installer.lat_lon.lng),
                title: installer.company_name,
                icon: '/marker-base.svg'
            }),
            visible: false,
            content: formInstallerMarkerContent(installer),
            type: "installer",
            filterOption: {
                signUpDate: installer.date_signed_up,
                mcsCertified: (installer.mcs_certification?.status === "Active") ? true : false,
                installation_preferences: installer.installation_preferences
            },
            colour: get(installerColour)
        }
        let markerPopup = new google.maps.InfoWindow({
            content: installerMarker.content,
            ariaLabel: installerMarker.address
        })
        installerMarker.marker.addListener('click', () => {
            markerPopup.open({
                anchor: installerMarker.marker
            })
        })
        return installerMarker
    }
    return null
}

function formInstallerMarkerContent(installer: PlatformInstaller): string {
    return "content goes here"
}

function formHomeownerMarkerContent(homeowner: PlatformHomeowner): string {
    return "content goes here"
}

export function displayMarkers(markerArr: Array<PlatformMarker>): Array<PlatformMarker> {
    for (let marker of markerArr) {
        // once filters implemented next line will only toggle markers that should be shown based on the filters
        marker.visible = !marker.visible
        if (marker.visible) {
            marker.marker.setMap(get(map))
        } else {
            marker.marker.setMap(null)
        }
    }
    return markerArr
}

// Updates the set of homeowner markers when the database updates
export async function updateHomeownerMarkers(payload: any) {
    let newMarker = createMarkerForHomeowner(payload.new)
    let markers = get(platformHomeownerMarkers)
    if (newMarker) {
        markers.push(newMarker)
        platformHomeownerMarkers.set(markers)
    }
}

export async function updateInstallerMarkers(payload: any) {
    let newMarker = createMarkerForInstaller(payload.new)
    let markers = get(platformInstallerMarkers)
    if (newMarker) {
        markers.push(newMarker)
        platformInstallerMarkers.set(markers)
    }
}

export function changeMarkerColour(markerArr: Array<PlatformMarker>, colour: string): Array<PlatformMarker> {
    console.log(colour)
    for (let marker of markerArr) {
        marker.colour = colour
        const svgMarker = {
            path: selectMarkerType(marker),
            scale: 1,
            fillColor: marker.colour,
            fillOpacity: 1,
            anchor: new google.maps.Point(9, 33)
        }
        marker.marker.setIcon(svgMarker)
    }
    return markerArr
}

function selectMarkerType(marker: PlatformMarker) {
    if (marker.type === "installer") {
        if (marker.verified)
            return get(markerTrianglePath)
    }
    if (marker.verified)
        for (let job of get(platformJobs)) {
            if (marker.data.id === job.homeowner_id)
                if (job.status === "AWAITING_DESIGN")
                    return get(markerSquarePath)
                else if (job.status === "PENDING_QUOTES")
                    return get(markerTrianglePath)
        }
    return get(markerBasePath)
}
