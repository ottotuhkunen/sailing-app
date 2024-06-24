// placeNames.js
import mapboxgl from 'mapbox-gl';

const loadGeoJsonData = (map, url, sourceId, textColor, minZoom) => {

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      map.addSource(sourceId, {
        type: 'geojson',
        data: data,
        cluster: false,
      });

      map.addLayer({
        id: sourceId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['get', 'spelling'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': textColor,
          'text-halo-color': 'rgba(255, 255, 255, 0.8)',
          'text-halo-width': 1,
        },
        minzoom: minZoom,
      });
    })
    .catch(error => {
      console.error(`Error loading ${sourceId} data:`, error);
    });
};

export const loadPlaceNames = (map) => {

  // Attribution
  const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib-inner');
  if (attributionControl) {
    const customAttribution = document.createElement('a');
    customAttribution.href = 'https://www.maanmittauslaitos.fi/kartat-ja-paikkatieto/aineistot-ja-rajapinnat/tuotekuvaukset/nimisto';
    customAttribution.target = '_blank'; // new tab
    customAttribution.innerHTML = ' © Maanmittauslaitos nimistö 2024';
    attributionControl.appendChild(customAttribution);
  }

  loadGeoJsonData(
    map,
    `${process.env.PUBLIC_URL}/src/placeNames/saariTaiLuoto.json`,
    'saariTaiLuoto',
    '#333', // Black
    10
  );

  loadGeoJsonData(
    map,
    `${process.env.PUBLIC_URL}/src/placeNames/lauttaJaLossi.geojson`,
    'lauttaJaLossi',
    '#CC5500', // Orange
    10
  );

  loadGeoJsonData(
    map,
    `${process.env.PUBLIC_URL}/src/placeNames/merialueet.json`,
    'merialueet',
    '#0000FF', // Blue
    10
  );
};
