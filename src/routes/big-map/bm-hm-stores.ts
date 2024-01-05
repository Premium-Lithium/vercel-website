import { writable, type Writable } from "svelte/store";

export let heatmap: Writable<google.maps.visualization.HeatmapLayer> = writable()
