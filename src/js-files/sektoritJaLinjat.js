import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import valosektoritGeoJSON from '../json-files/valosektorit.geojson';
import taululinjatGeoJSON from '../json-files/taululinjat.geojson';
import vesikivetGeoJSON from '../json-files/vesikivet.geojson';

const navlTyypNames = {
  0: 'Tuntematon',
  1: 'Vasen',
  2: 'Oikea',
  3: 'Pohjois',
  4: 'Etela',
  5: 'Lansi',
  6: 'Ita',
  7: 'Karimerkki',
  8: 'Turvavesimerkki',
  9: 'Erikoismerkki',
  99: ''
};

const tyJnrNames = {
  0: 'Tuntematon',
  1: 'Merimajakka',
  2: 'Sektoriloisto',
  3: 'Linjamerkki',
  4: 'Suuntaloisto',
  5: 'Apuloisto',
  6: 'Muu merkki',
  7: 'Reunamerkki',
  8: 'Tutkamerkki',
  9: 'Poiju',
  10: 'Viitta',
  11: 'Tunnusmajakka',
  13: 'Kummeli'
};

const colorMap = {
  'vi': '#00FF00', // green
  'p': '#FF0000', // red
  'v': '#FFFFFF', // white
  'k': '#FFFF00', // yellow
};

export const loadSektoritJaLinjat = (map) => {

  const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib-inner');
  if (attributionControl) {
    const customAttribution = document.createElement('a');
    customAttribution.href = 'https://www.paikkatietohakemisto.fi/geonetwork/srv/fin/catalog.search#/metadata/bc585b68-837a-4609-85cd-3a17cac7c3de';
    customAttribution.target = '_blank';
    customAttribution.innerHTML = ' © Väylävirasto vesiväyläaineisto 2024';
    attributionControl.appendChild(customAttribution);
  }

  // Load valosektorit.geojson data
  fetch(valosektoritGeoJSON)
    .then(response => response.json())
    .then(data => {
      if (map.getSource('valosektorit')) {
        console.warn('Source "valosektorit" already exists.');
        return;
      }
      if (data && data.features) {
        // Add the GeoJSON source for valosektorit
        map.addSource('valosektorit', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: data.features
          }
        });

        const sectorFeatures = [];
        data.features.forEach((feature) => {
          const { id, alkukulma, loppukulma, varis } = feature.properties;
          const coordinates = feature.geometry.coordinates;
          const color = colorMap[varis] || '#FFFFFF';

          // Skip full-circle sectors
          if (alkukulma === 0.0 && loppukulma === 360.0) {
            return;
          }

          // Create sector arcs and features
          const sectorGeoJSON = createSectorArcGeoJSON(coordinates, loppukulma, alkukulma, color);
          sectorFeatures.push(...sectorGeoJSON.features);
        });

        // Add a single layer for all sector arcs
        map.addLayer({
          id: 'valosektorit-layer',
          type: 'fill',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: sectorFeatures
            }
          },
          layout: {},
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.4,
            'fill-outline-color': 'black',
          },
          minzoom: 11
        });

      } else {
        console.error('Invalid GeoJSON data:', data);
      }
    })
    .catch(error => {
      console.error('Error loading valosektorit GeoJSON data:', error);
    });

  // Load taululinjat.geojson data
  map.addSource('taululinjat', {
    type: 'geojson',
    data: taululinjatGeoJSON
  });

  map.addLayer({
    id: 'taululinjat-layer',
    type: 'line',
    source: 'taululinjat',
    layout: {},
    paint: {
      'line-color': 'black',
      'line-width': 1,
      'line-dasharray': [2, 4]
    },
    minzoom: 11
  });

  // Load vesikivet.geojson data
  map.addSource('vesikivet', {
    type: 'geojson',
    data: vesikivetGeoJSON
  });

  map.addLayer({
    id: 'vesikivet-layer',
    type: 'symbol',
    source: 'vesikivet',
    layout: {
      'text-field': '+', // Display "+" at each stone
      'text-size': 15,
      'text-anchor': 'center',
      'text-allow-overlap': true
    },
    paint: {
      'text-color': 'black',
      'text-halo-color': 'red',
      'text-halo-width': 0.5
    },
    minzoom: 12
  });  
};

function createSectorArcGeoJSON(coordinates, startBearing, endBearing, color) {
  const radius = 0.005;
  const separationAngle = 0.1; // Slight separation angle in degrees (to make sectors clear)

  // Normalize start and end bearings to be within [0, 360) degrees
  let normalizedStartBearing = startBearing % 360;
  let normalizedEndBearing = endBearing % 360;

  // Convert negative bearings to positive equivalent
  if (normalizedStartBearing < 0) {
    normalizedStartBearing += 360;
  }
  if (normalizedEndBearing < 0) {
    normalizedEndBearing += 360;
  }

  // Convert degrees to radians
  const startRad = (270 - normalizedStartBearing - separationAngle) * (Math.PI / 180);
  let endRad = (270 - normalizedEndBearing + separationAngle) * (Math.PI / 180);

  // Adjust endRad if it's less than startRad (indicating a wrap around)
  if (endRad < startRad) {
    endRad += 2 * Math.PI;
  }

  const arcCoordinates = [];

  // Starting point of the arc
  arcCoordinates.push(coordinates);

  // Number of steps for smooth arc
  const steps = 30;
  const step = (endRad - startRad) / steps;

  // Calculate points along the arc
  for (let i = 0; i <= steps; i++) {
    const theta = startRad + i * step;
    const x = coordinates[0] + radius * Math.cos(theta) / Math.cos(coordinates[1] * Math.PI / 180);
    const y = coordinates[1] + radius * Math.sin(theta);
    arcCoordinates.push([x, y]);
  }

  // Closing point of the arc
  arcCoordinates.push(coordinates);

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [arcCoordinates]
        },
        properties: {
          color
        }
      }
    ]
  };
}
