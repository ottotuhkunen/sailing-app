import mapboxgl from 'mapbox-gl';
import geojsonData from '../json-files/alueet.geojson';
import matalikotData from '../json-files/matalikot.geojson';
import ankkuripaikatData from '../json-files/ankkuripaikat.geojson';

export const loadAlueet = (map) => {
    // Function to load and render GeoJSON data for 'alueet'
    const loadGeoJsonData = (data) => {
        // Add 'alueet' GeoJSON source
        map.addSource('alueet', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: data.features
            }
        });

        // Function to determine fill color based on 'vayalue_ty'
        const getFillColor = ['case',
            ['==', ['get', 'vayalue_ty'], 1], 'white',
            ['==', ['get', 'vayalue_ty'], 3], 'white',
            ['==', ['get', 'vayalue_ty'], 6], 'white',
            ['==', ['get', 'vayalue_ty'], 7], 'white',
            ['==', ['get', 'vayalue_ty'], 8], 'white',
            ['==', ['get', 'vayalue_ty'], 11], 'white',
            ['==', ['get', 'vayalue_ty'], 2], 'green',
            ['==', ['get', 'vayalue_ty'], 4], 'green',
            ['==', ['get', 'vayalue_ty'], 5], 'green',
            ['==', ['get', 'vayalue_ty'], 12], 'green',
            ['==', ['get', 'vayalue_ty'], 13], 'green',
            ['==', ['get', 'vayalue_ty'], 9], 'darkorange',
            ['==', ['get', 'vayalue_ty'], 10], 'darkorange',
            '#236ce2' // default color

            /*
                1 Navigointialue
                2 Ankkurointialue
                3 Ohitus- ja kohtaamisalue
                4 Satama-allas
                5 Kääntöallas
                6 Kanava
                7 Rannikkoliikenteen alue
                8 Veneilyn runkoväylä
                9 Erikoisalue
                10 Sulku
                11 Varmistettu lisäalue
                12 HELCOM-alue
                13 Luotsin otto- ja jättöalue
            */
        ];

        // Add layer for rendering 'vayla-alueet-layer'
        map.addLayer({
            id: 'vayla-alueet-layer',
            type: 'fill',
            source: 'alueet',
            paint: {
                'fill-color': getFillColor,
                'fill-opacity': 0.3
            },
            minzoom: 10
        });

        // Add layer for depth labels (syvyydet)
        map.addLayer({
            id: 'vayla-alueet-depth',
            type: 'symbol',
            source: 'alueet',
            layout: {
                'text-field': ['get', 'vayalue_sy'],
                'text-font': ['Open Sans Regular'],
                'text-size': 12,
                'text-offset': [0, 0.5],
                'text-allow-overlap': true
            },
            paint: {
                'text-color': 'blue'
            },
            minzoom: 10
        });

        moveLayerBehind('vayla-alueet-layer', ['race-route', 'vaylat-layer']);
    };

    const loadMatalikotData = (data) => {
        // Add 'matalikot' GeoJSON source
        map.addSource('matalikot', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: data.features
            }
        });

        // Add layer for rendering 'matalikot-layer'
        map.addLayer({
            id: 'matalikot-layer',
            type: 'fill',
            source: 'matalikot',
            paint: {
                'fill-color': '#22A4D4',
                'fill-outline-color': 'blue',
                'fill-opacity': 0.5
            },
            minzoom: 12
        });

        moveLayerBehind('matalikot-layer', ['race-route', 'vaylat-layer', 'vayla-alueet-layer']);
    };

    const loadAnkkuripaikatData = (data) => {
        // Add 'ankkuripaikat' GeoJSON source
        map.addSource('ankkuripaikat', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: data.features
            }
        });

        // Add an image for use in the symbol layer
        map.loadImage(`${process.env.PUBLIC_URL}/src/icons/anchor.png`, (error, image) => {
            if (error) throw error;
            map.addImage('anchor-icon', image);

            // Add layer for rendering 'ankkuripaikat-layer'
            map.addLayer({
                id: 'ankkuripaikat-layer',
                type: 'symbol',
                source: 'ankkuripaikat',
                layout: {
                    'icon-image': 'anchor-icon',
                    'icon-size': 0.3
                },
                minzoom: 11
            });

            moveLayerBehind('ankkuripaikat-layer', ['race-route', 'vaylat-layer', 'vayla-alueet-layer', 'matalikot-layer']);
        });

        // Add click event listener for popups
        map.on('click', 'ankkuripaikat-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = 'Ankkuripaikka';

            // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being clicked on
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the ankkuripaikat-layer
        map.on('mouseenter', 'ankkuripaikat-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves
        map.on('mouseleave', 'ankkuripaikat-layer', () => {
            map.getCanvas().style.cursor = '';
        });

    };

    const moveLayerBehind = (layerId, targetLayerIds) => {
        targetLayerIds.forEach(targetLayerId => {
            if (map.getLayer(targetLayerId)) {
                map.moveLayer(layerId, targetLayerId);
            }
        });
    };

    // Fetch 'alueet.geojson' data and load layers
    fetch(geojsonData)
    .then(response => response.json())
    .then(data => {
        loadGeoJsonData(data);
    })
    .catch(error => {
        console.error('Error loading GeoJSON data for alueet:', error);
    });

    // Fetch 'matalikot.geojson' data and load layers
    fetch(matalikotData)
    .then(response => response.json())
    .then(data => {
        loadMatalikotData(data);
    })
    .catch(error => {
        console.error('Error loading GeoJSON data for matalikot:', error);
    });

    // Fetch 'ankkuripaikat.geojson' data and load layers
    fetch(ankkuripaikatData)
    .then(response => response.json())
    .then(data => {
        loadAnkkuripaikatData(data);
    })
    .catch(error => {
        console.error('Error loading GeoJSON data for ankkuripaikat:', error);
    });
};
