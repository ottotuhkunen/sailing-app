import mapboxgl from 'mapbox-gl';

const vaylatGeoJSON = `${process.env.PUBLIC_URL}/src/vaylat.geojson`; // Adjust path as necessary

export const loadVaylat = (map) => {
  map.addSource('vaylat-source', {
    type: 'geojson',
    data: vaylatGeoJSON
  });

  // Add a layer to render the vaylat features
  map.addLayer({
    id: 'vaylat-layer',
    type: 'line',
    source: 'vaylat-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-opacity': 0.8, // Default opacity for all features
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
        'white'                               // Otherwise, use white color
      ]
    },
    // Set a higher z-index to ensure this layer is on top of others
    // Adjust the 'below' property based on your existing layer IDs
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
      radius: 10 // Increase the radius to increase hitbox size
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

  // Hover cursor pointer when over vaylat features
  map.on('mouseenter', 'vaylat-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change cursor back to default on mouse leave
  map.on('mouseleave', 'vaylat-layer', () => {
    map.getCanvas().style.cursor = '';
  });
};

// Function to get the name of vaylalaji based on its code
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
