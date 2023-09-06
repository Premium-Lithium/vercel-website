import { writable } from 'svelte/store';

export let markersOnMap = writable([]);
export let latLongOfMarker = writable({'latitude': undefined, 'longitude': undefined});
