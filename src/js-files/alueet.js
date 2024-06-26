import geojsonData from '../json-files/alueet.geojson';

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
            ['==', ['get', 'vayalue_ty'], 1], '#236ce2',
            ['==', ['get', 'vayalue_ty'], 3], '#236ce2',
            ['==', ['get', 'vayalue_ty'], 6], '#236ce2',
            ['==', ['get', 'vayalue_ty'], 7], '#236ce2',
            ['==', ['get', 'vayalue_ty'], 8], '#236ce2',
            ['==', ['get', 'vayalue_ty'], 11], '#236ce2',
            ['==', ['get', 'vayalue_ty'], 2], 'green',
            ['==', ['get', 'vayalue_ty'], 4], 'green',
            ['==', ['get', 'vayalue_ty'], 5], 'green',
            ['==', ['get', 'vayalue_ty'], 12], 'green',
            ['==', ['get', 'vayalue_ty'], 13], 'green',
            ['==', ['get', 'vayalue_ty'], 9], 'orange',
            ['==', ['get', 'vayalue_ty'], 10], 'orange',
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
                'fill-opacity': 0.2
            },
            minzoom: 10
        });

        // Add layer for depth labels
        map.addLayer({
            id: 'alueet-labels',
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
};
