import mapboxgl from 'mapbox-gl';

const vaylatGeoJSON = `${process.env.PUBLIC_URL}/src/vaylat.geojson`;

export const loadVaylat = (map) => {
  map.addSource('vaylat-source', {
    type: 'geojson',
    data: vaylatGeoJSON
  });

  // Add a layer to render väylät
  map.addLayer({
    id: 'vaylat-layer',
    type: 'line',
    source: 'vaylat-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-opacity': 0.8,
      'line-width': [
        'case',
        ['==', ['get', 'valaistus'], 1],  // If valaistus is 1
        3,                                // Use line width of 5
        1                                 // Otherwise, use line width of 2
      ],
      'line-color': [
        'case',
        ['==', ['get', 'valaistus'], 1], 
        'black',                            // Use black color
        'white'                             // Otherwise, use white color
      ]
    },
    'below': 'labels'
  });

  // Add click event listener for popups
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
      <p class="popupText">Syvyydet: ${properties.syvyydet}</p>
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
      return 'Unknown';
  }
};
