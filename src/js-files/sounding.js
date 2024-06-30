import mapboxgl from 'mapbox-gl';

// Function to load sounding points layer
export const loadSoundingPoints = (mapInstance) => {

    // Attribution
    const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib-inner');
    if (attributionControl) {
        const customAttribution = document.createElement('a');
        customAttribution.href = 'https://www.traficom.fi/fi/ajankohtaista/paikkatietoaineistot/merikartoitusaineistot';
        customAttribution.target = '_blank'; // new tab
        customAttribution.innerHTML = ' © Syvyystiedot: Liikenne- ja viestintävirasto. Ei navigointikäyttöön. Ei täytä asianmukaisen merikartan vaatimuksia.';
        attributionControl.appendChild(customAttribution);
    }

    mapInstance.addLayer({
        id: 'sounding-points-labels',
        type: 'symbol', // Use 'symbol' type for text labels
        source: {
            type: 'vector',
            url: 'mapbox://ottotuhkunen.65icio6l'
        },
            'source-layer': 'sounding3-00khy9',
        layout: {
            'text-field': ['to-string', ['get', 'DEPTH']],
            'text-font': ['Open Sans Regular'],
            'text-size': 10,
            'text-justify': 'auto',
        visibility: 'visible'
        },
        paint: {
            'text-color': 'black'
        },
        minzoom: 11
    });
};

// Function to load depth contour lines layer
export const loadDepthContours = (mapInstance) => {

    // Load depth area first tileset
    mapInstance.addLayer({
        id: 'depth-area-1',
        type: 'fill',
        source: {
            type: 'vector',
            url: 'mapbox://ottotuhkunen.ctji9ieq'
        },
        'source-layer': 'depthArea4_1-1tea2p',
        paint: {
        'fill-color': [
            'match',
            ['get', 'DRVAL1'],
            '0', '#48C1FE',
            '10', 'transparent',
            'transparent'
        ],
        'fill-outline-color': 'lightblue', // Outline with blue
        },
        layout: {
            visibility: 'visible'
        },
        minzoom: 11
    });

    // Load depth area second tileset
    mapInstance.addLayer({
        id: 'depth-area-2',
        type: 'fill',
        source: {
            type: 'vector',
            url: 'mapbox://ottotuhkunen.661jtt94'
        },
        'source-layer': 'depthArea4_2-4q90pd',
        paint: {
            'fill-color': [
                'match',
                ['get', 'DRVAL1'],
                '0', '#48C1FE',
                '10', 'transparent',
                'transparent'
            ]
            },
            layout: {
                visibility: 'visible'
            },
        minzoom: 11
    });

    mapInstance.addLayer({
        id: 'sounding-contours',
        type: 'line',
        source: {
            type: 'vector',
            url: 'mapbox://ottotuhkunen.2ygmegun'
        },
        'source-layer': 'depthContour2-0k0mfx',
        paint: {
            'line-color': 'blue',
            'line-width': 1.5,
            'line-dasharray': [
                'match',
                ['get', 'VALDCO'],
                3, [1, 2], // Dotted line for VALDCO = 3
                6, [4, 2], // Dashed line for VALDCO = 6
                [0, 0] // Default solid line
            ]
        },
        layout: {
            visibility: 'visible'
        },
        minzoom: 11
    });

};
