import type { MarkerOptions, PipeLineKey, OptionPanel, LabelInfo } from './bm-stores'
import { applyLabelColourToMarker, checkInstalledTime, checkQuoteTime, checkWonTime, colourMap, installDate, labelFilter, labels, map, mapOptionPanels, pipelines, quoteDate, selectedPipelines, showNullMarkers, statusFilters, value, wonDate } from './bm-stores'
import { get } from 'svelte/store'

export async function getPipelines() {
    console.log("Fetching Pipelines")
    let pipelinesRes = await fetch('/big-map/pipelines', {
        method: 'GET',
        headers: {
            'Content-Type': 'application-json'
        }
    })
    let pipelinesResponse = await pipelinesRes.json()
    pipelines.set(pipelinesResponse.body)
    console.log("Fetched Pipelines")
}

export async function getLabels() {
    console.log("Fetching Labels")
    let labelsRes = await fetch('/big-map/labels', {
        method: 'GET',
        headers: {
            'Content-Type': 'application-json'
        }
    })
    let labelsResponse = await labelsRes.json()
    labels.set(labelsResponse.body)
    console.log("Fetched Labels")
}

export async function getSelectedPipelineData(selectedPipelines: Array<number>) {
    let panels = []
    let mapRes = await fetch('/big-map/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: selectedPipelines })
    })
    let mapProps = await mapRes.json()
    if (mapRes.ok) {
        for (let p in selectedPipelines) {
            let panel: OptionPanel = {
                pipeline: get(pipelines).find((obj) => obj.id === selectedPipelines[p]),
                stages: [],
                stagesVisible: [],
                filters: [],
                filtersApplied: [],
                markers: [],
                colour: '#C9FC50',
                handle: document.createElement('div'),
                hideStageOptions: false
            }
            // Loop over each stage in pipeline, add name to the list
            panel.stages = panel.pipeline?.stages.map((obj) => obj.name)
            panels.push(panel)
        }
        for (let m in mapProps.body) {
            let marker: MarkerOptions = {
                latLng: mapProps.body[m].latLng,
                address: mapProps.body[m].address,
                visible: true,
                marker: undefined,
                content: mapProps.body[m].content,
                filterOption: mapProps.body[m].filterOption,
                pipelineId: mapProps.body[m].pipelineId,
                stageId: mapProps.body[m].stageId,
                deal: mapProps.body[m].deal,
                colour: mapProps.body[m].colour,
                labelID: mapProps.body[m].labelID
            }
            panels
                .find(
                    (obj) =>
                        obj.pipeline === get(pipelines).find((obj) => obj.id === parseInt(marker.pipelineId))
                )
                ?.markers.push(addMarker(marker))
        }
        mapOptionPanels.set(panels) // Instantiate a 'new' array for reactivity
    }
}

/**
 * Creates a marker object for a given set of parameters
 * 	including location and pop up window
 * @param opts Marker parameters
 */
function addMarker(opts: MarkerOptions) {
    let marker = new google.maps.Marker({
        position: new google.maps.LatLng(opts.latLng.lat, opts.latLng.lng),
        title: opts.address,
        icon: '/marker-base.svg'
    })
    let markerPopup = new google.maps.InfoWindow({
        content: opts.content,
        ariaLabel: opts.address
    })
    marker.addListener('click', () => {
        markerPopup.open({
            anchor: marker
        })
    })
    opts.marker = marker
    return opts
}

/**
 *	Go through each panels' markers and if they are meant to be visible, add them to the map, if not remove them
 */
export function updateMap() {
    let currentPanels = get(mapOptionPanels)
    for (let panel in currentPanels) {
        for (let marker in currentPanels[panel].markers) {
            if (currentPanels[panel].markers[marker].visible) {
                currentPanels[panel].markers[marker].marker.setMap(get(map))
            } else {
                currentPanels[panel].markers[marker].marker.setMap(null)
            }
        }
    }
    mapOptionPanels.set(currentPanels)
}

/**
 * removes all markers for a panel on the map and deletes the panel
 * update map needs to be called first else the markers stay on the map after the panel is deleted
 * @param panel
 */
export function deletePanel(panel: OptionPanel) {
    let currentPanels = get(mapOptionPanels)
    for (let m in panel.markers) {
        panel.markers[m].visible = false
    }
    updateMap()
    currentPanels = currentPanels.filter((item) => item !== panel)
    mapOptionPanels.set(currentPanels)
}


/**
 * Remove all markers from the map and empty all marker arrays
 */
export function clearMap() {
    let currentPanels = get(mapOptionPanels)
    for (let panel in currentPanels) {
        for (let marker in currentPanels[panel].markers) {
            if (currentPanels[panel].markers[marker].visible) {
                currentPanels[panel].markers[marker].marker.setMap(null)
            }
        }
        currentPanels[panel].markers.length = 0
    }
    mapOptionPanels.set(currentPanels)
    updateMap()
}

/**
 * Goes through all panels and sets all their markers to invisible
 */
export function makeAllMarkersInvisible() {
    let currentPanels = get(mapOptionPanels)
    for (let panel in currentPanels) {
        for (let marker in currentPanels[panel].markers) {
            currentPanels[panel].markers[marker].visible = false
        }
    }
    mapOptionPanels.set(currentPanels)
    updateMap()
}

export function applyFilters() {
    let currentPanels = get(mapOptionPanels)
    makeAllMarkersInvisible()
    for (let panel in currentPanels) {
        for (let marker in currentPanels[panel].markers) {
            if (
                checkDateFilterFor(currentPanels[panel].markers[marker]) &&
                currentPanels[panel].markers[marker].filterOption.value >= get(value) &&
                (get(statusFilters).includes(currentPanels[panel].markers[marker].filterOption.status) ||
                    get(statusFilters).length === 0)
            ) {
                currentPanels[panel].markers[marker].visible = true
            }
        }
    }
    mapOptionPanels.set(currentPanels)
    updateMap()
}

/**
 * checks against each date filter (separately as some of the filters may not be chosen)
 * @param marker
 */
export function checkDateFilterFor(marker: MarkerOptions): boolean {
    let showMarker = true
    let nullMarkers = get(showNullMarkers)
    if (marker.deal) {
        if (get(checkWonTime)) {
            if (marker.deal.won_time) {
                showMarker = Date.parse(marker.deal.won_time) > Date.parse(get(wonDate)) ? true : false
            } else {
                showMarker = nullMarkers
            }
        }
        if (get(checkQuoteTime)) {
            if (marker.deal['e448eb2611c9c8a6aeca674511aa64c0a4d06520']) {
                showMarker =
                    Date.parse(marker.deal['e448eb2611c9c8a6aeca674511aa64c0a4d06520']) > Date.parse(get(installDate))
                        ? true
                        : false
            } else {
                showMarker = nullMarkers
            }
        }
        if (get(checkInstalledTime) && marker.deal['81fcad47a18a049303b461e360c0ec2d6c9fa68e']) {
            if (marker.deal['81fcad47a18a049303b461e360c0ec2d6c9fa68e']) {
                Date.parse(marker.deal['81fcad47a18a049303b461e360c0ec2d6c9fa68e']) > Date.parse(get(quoteDate))
                    ? true
                    : false
            } else {
                showMarker = nullMarkers
            }
        }
    } else {
        showMarker = nullMarkers
    }
    return showMarker
}

/**
 * Adds the selected pipeline to the list of selected pipelines, removes it if already in list
 * @param pipeline object containing name and id
 */
export function addPipelineCheckbox(pipeline: PipeLineKey) {
    let pipelines = get(selectedPipelines)
    if (pipelines.includes(pipeline.id)) {
        const index = pipelines.indexOf(pipeline.id)
        pipelines.splice(index, 1)
    } else {
        pipelines.push(pipeline.id)
    }
    selectedPipelines.set(pipelines)
}

export function setFiltersToDefaultValues() {
    value.set(0)
    statusFilters.set([])
    wonDate.set("")
    installDate.set("")
    quoteDate.set("")
    applyFilters()
}

export function filterByStatus(status: string) {
    let filters = get(statusFilters)
    if (filters.includes(status)) {
        filters.splice(filters.indexOf(status), 1)
    } else {
        filters.push(status)
    }
    statusFilters.set(filters)
}

export function applyFiltersToPanel(panel: OptionPanel) {
    if (panel.stagesVisible.length === 0) {
        for (let marker in panel.markers) {
            panel.markers[marker].visible = true
        }
    } else {
        for (let stage in panel.stagesVisible) {
            let pipeline = get(pipelines).find((obj) => obj.id === panel.pipeline?.id)
            let stageId = pipeline?.stages.find((obj) => obj.name === panel.stagesVisible[stage])?.id
            for (let marker in panel.markers) {
                if (stageId === panel.markers[marker].stageId.toString()) {
                    panel.markers[marker].visible = true
                }
            }
        }
    }
    return panel
}

export function updateLabelFilter(label: LabelInfo) {
    let currentLabels = get(labelFilter)
    if (currentLabels.includes(label.id)) {
        currentLabels.splice(currentLabels.indexOf(label.id), 1)
    } else {
        currentLabels.push(label.id)
    }
    labelFilter.set(currentLabels)
    console.log(get(labelFilter))
}

export function filterByLabel() {
    let currentPanels = get(mapOptionPanels)
    makeAllMarkersInvisible()
    for (let panel in currentPanels) {
        for (let marker in currentPanels[panel].markers) {
            let label = get(labels).find((el) => el.id === currentPanels[panel].markers[marker].labelID)
            if (label !== undefined) {
                if (get(labelFilter).length === 0) {
                    currentPanels[panel].markers[marker].visible = true
                } else {
                    if (get(labelFilter).includes(label.id)) {
                        currentPanels[panel].markers[marker].visible = true
                    }
                }
                if (get(applyLabelColourToMarker)) {
                    currentPanels[panel].colour = get(colourMap).get(label.color) // temporary for now, until each marker has its own colour picker
                    currentPanels[panel].markers[marker].colour = get(colourMap).get(label.color) // These errors are never an issue - it won't get here if label is undefined
                }
            }
        }
        currentPanels[panel] = changeIconColourFor(currentPanels[panel])
    }
    mapOptionPanels.set(currentPanels)
    updateMap()
}

export function changeIconColourFor(panel: OptionPanel) {
    for (let marker in panel.markers) {
        panel.markers[marker].colour = panel.colour // Temporary for now, until each stage has its own colour picker
        const svgMarker = {
            path: 'M 15.00,14.00 C 15.00,14.00 14.54,17.32 14.54,17.32 14.23,19.63 13.42,21.86 12.17,23.84 12.17,23.84 12.17,23.84 12.17,23.84 11.00,25.69 10.22,27.76 9.86,29.91 9.86,29.91 9.54,31.83 9.54,31.83M 4.00,14.00 C 4.00,14.00 4.36,17.35 4.36,17.35 4.61,19.69 5.42,21.92 6.73,23.87 6.73,23.87 6.73,23.87 6.73,23.87 7.96,25.70 8.75,27.77 9.06,29.95 9.06,29.95 9.32,31.88 9.32,31.88M 17.50,8.50 C 17.50,12.92 13.92,16.50 9.50,16.50 5.08,16.50 1.50,12.92 1.50,8.50 1.50,4.08 5.08,0.50 9.50,0.50 13.92,0.50 17.50,4.08 17.50,8.50 Z',
            scale: 1,
            fillColor: panel.markers[marker].colour,
            fillOpacity: 1,
            anchor: new google.maps.Point(9, 33)
        }
        panel.markers[marker].marker.setIcon(svgMarker)
    }
    return panel
}
