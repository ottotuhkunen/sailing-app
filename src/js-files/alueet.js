// alueet.js

import geojsonData from '../json-files/alueet.geojson';
import matalikotData from '../json-files/matalikot.geojson'; // Assuming the file path is correct

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

        // Add layer for rendering 'vayla-alueet-layer'
        map.addLayer({
            id: 'vayla-alueet-layer',
            type: 'fill',
            source: 'alueet',
            paint: {
                'fill-color': '#236ce2',
                'fill-opacity': 0.2
            },
            minzoom: 10
        });

        map.addLayer({
            id: 'alueet-labels',
            type: 'symbol',
            source: 'alueet',
            layout: {
                'text-field': ['get', 'VAYALUE_SY'],
                'text-font': ['Open Sans Regular'],
                'text-size': 12
            },
            paint: {
                'text-color': '#000'
            },
            filter: ['>', ['zoom'], 12]
        });
        moveLayerBehind('vayla-alueet-layer', ['race-route', 'vaylat-layer']);
    };

    // Function to load matalikot GeoJSON data
    const loadMatalikotData = () => {
        map.addSource('matalikot', {
            type: 'geojson',
            data: matalikotData
        });

        map.addLayer({
            id: 'matalikot-layer',
            type: 'fill',
            source: 'matalikot',
            paint: {
                'fill-color': '#4fa4d3', // Light blue fill color
                'fill-outline-color': '#0000FF' // Blue border color
            },
            minzoom: 12
        });

        moveLayerBehind('matalikot-layer', ['race-route', 'vaylat-layer']);
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

    // Call function to load 'matalikot.geojson' data and layers
    loadMatalikotData();
};

