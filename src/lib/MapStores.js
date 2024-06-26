import { writable, readable } from 'svelte/store';

export let markersOnMap = writable([]);
export let latLongOfMarker = writable({'latitude': undefined, 'longitude': undefined});
export let colourOfMapMarker = readable('red');
export let installationStores = writable([]);
export let currentInstallation = writable(null);
export let selectedInstallation = writable([]);
export let navigateMarkers = writable(false);

