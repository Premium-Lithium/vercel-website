import { map, platformHomeownerMarkers, platformInstallerMarkers, type PlatformHomeowner, type PlatformInstaller, type PlatformMarker } from "./bm-stores";
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
    platformHomeownerMarkers.set(homeownerMarkerArray)
    platformInstallerMarkers.set(installerMarkerArray)
}

function createMarkerForHomeowner(homeowner: PlatformHomeowner): PlatformMarker |null {
    if (homeowner.lat_lon) {
        let homeownerMarker: PlatformMarker = {
            latLng: homeowner.lat_lon,
            marker: new google.maps.Marker({
                position: new google.maps.LatLng(homeowner.lat_lon.lat, homeowner.lat_lon.lng),
                title: homeowner.name,
                icon: '/marker-base.svg',
            }),
            address: homeowner.address + " " + homeowner.postcode,
            content: formHomeownerMarkerContent(homeowner),
            filterOption: {
                signUpDate: homeowner.date_signed_up,
                verified: (homeowner.email_verify_code === "verified") ? true : false,
                solution: homeowner.solution
            },
            visible: false,
            colour: "#C9FC50"
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

function createMarkerForInstaller(installer: PlatformInstaller): PlatformMarker | null{
    if (installer.lat_lon) {
        let installerMarker: PlatformMarker = {
            latLng: installer.lat_lon,
            address: installer.address + " " + installer.postcode,
            marker: new google.maps.Marker({
                position: new google.maps.LatLng(installer.lat_lon.lat, installer.lat_lon.lng),
                title: installer.company_name,
                icon: '/marker-base.svg',
            }),
            visible: false,
            content: formInstallerMarkerContent(installer),
            filterOption: {
                signUpDate: installer.date_signed_up,
                verified: (installer.email_verify_code === "verified") ? true : false,
                mcsCertified: (installer.mcs_certification?.status === "Active") ? true : false,
                installation_preferences: installer.installation_preferences
            },
            colour: "#C9FC50"
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
    console.log("Supabase Response: ", payload)
}

export function changeMarkerColour(markerArr: Array<PlatformMarker>, colour: string): Array<PlatformMarker> {
    for (let marker of markerArr) {
        marker.colour = colour
        const svgMarker = {
            path: 'M 15.00,14.00 C 15.00,14.00 14.54,17.32 14.54,17.32 14.23,19.63 13.42,21.86 12.17,23.84 12.17,23.84 12.17,23.84 12.17,23.84 11.00,25.69 10.22,27.76 9.86,29.91 9.86,29.91 9.54,31.83 9.54,31.83M 4.00,14.00 C 4.00,14.00 4.36,17.35 4.36,17.35 4.61,19.69 5.42,21.92 6.73,23.87 6.73,23.87 6.73,23.87 6.73,23.87 7.96,25.70 8.75,27.77 9.06,29.95 9.06,29.95 9.32,31.88 9.32,31.88M 17.50,8.50 C 17.50,12.92 13.92,16.50 9.50,16.50 5.08,16.50 1.50,12.92 1.50,8.50 1.50,4.08 5.08,0.50 9.50,0.50 13.92,0.50 17.50,4.08 17.50,8.50 Z',
            scale: 1,
            fillColor: marker.colour,
            fillOpacity: 1,
            anchor: new google.maps.Point(9, 33)
        }
        marker.marker.setIcon(svgMarker)
    }
    return markerArr
}