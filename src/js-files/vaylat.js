import mapboxgl from 'mapbox-gl';
import vaylatGeoJSON from '../json-files/vaylat.geojson';

export const loadVaylat = (map) => {
  map.addSource('vaylat-source', {
    type: 'geojson',
    data: vaylatGeoJSON
  });

  // VL4: Veneilyn runkoväylä (green background)
  map.addLayer({
    id: 'vaylat-background-stroke',
    type: 'line',
    source: 'vaylat-source',
    filter: ['==', ['get', 'vayla_lk'], 'VL4: Veneilyn runkoväylä'],
    paint: {
      'line-opacity': 0.8,
      'line-width': 6,
      'line-color': 'green' 
    },
    'below': 'vaylat-layer'
  });

  // Add a layer for normal sea routes
  map.addLayer({
    id: 'vaylat-layer',
    type: 'line',
    source: 'vaylat-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-opacity': 1,
      'line-width': [
        'case',
        ['==', ['get', 'valaistus'], 1],  // If valaistus is 1
        2,                                // Use line width of 2 for normal stroke
        1                                 // Otherwise, use line width of 1
      ],
      'line-color': [
        'case',
        ['==', ['get', 'valaistus'], 1], 
        'black',                           // Use black color for normal stroke
        'white'                            // Otherwise, use white color
      ]
    },
    'below': 'labels'
  });

  // Add click event listener for popups on väylät layer
  map.on('click', 'vaylat-layer', (e) => {
    const { properties } = e.features[0];
    const popupContent = `
      <h3 class="popupTitle">${getVaylalajiName(properties.vaylalaji)}</h3>
      <p class="popupText">${properties.vay_nimisu}</p>
    `;

    new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(e.lngLat)
      .setHTML(popupContent)
      .addTo(map);
  });

  // Increase the clickable area for line features
  map.on('click', 'vaylat-layer', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['vaylat-layer'],
      radius: 10 // Increase hitbox size
    });

    if (!features.length) {
      return;
    }

    const { properties } = features[0];
    const popupContent = `
      <h3 class="popupTitle">${getVaylalajiName(properties.vaylalaji)}</h3>
      <p class="popupText">${properties.vay_nimisu}</p>
      <p class="popupText">${properties.vayla_lk}</p>
      <p class="popupText">Syvyydet: ${properties.syvyydet || 'N/A'}</p>
    `;

    new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(e.lngLat)
      .setHTML(popupContent)
      .addTo(map);
  });

  // Hover cursor pointer when over väylät
  map.on('mouseenter', 'vaylat-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'vaylat-layer', () => {
    map.getCanvas().style.cursor = '';
  });
};

// Function to get väylälaji
const getVaylalajiName = (code) => {
  switch (code) {
    case 1:
      return 'Meriväylä';
    case 2:
      return 'Sisävesiväylä';
    default:
      return 'Väylä';
  }
};
