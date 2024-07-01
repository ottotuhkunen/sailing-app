// placeNames.js
import mapboxgl from 'mapbox-gl';
import saaretGeoJSON from '../json-files/saariTaiLuoto.geojson';
import lautatGeoJSON from '../json-files/lauttaJaLossi.geojson';
import merialueetGeoJSON from '../json-files/merialueet.geojson';

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

const loadHarbourData = (map) => {
  const url = 'https://geoserver2.ymparisto.fi/geoserver/meritietoportaali/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=meritietoportaali:satamat';

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
      const features = Array.from(data.querySelectorAll('gml\\:featureMember, featureMember')).map(fm => {
        const coordinatesElement = fm.querySelector('meritietoportaali\\:the_geom gml\\:coordinates, the_geom coordinates');
        if (!coordinatesElement) {
          console.error('Coordinates element not found for feature:', fm);
          return null;
        }
        const latLon = coordinatesElement.textContent.split(',');

        const nameElement = fm.querySelector('meritietoportaali\\:Nimi, Nimi');
        const numberElement = fm.querySelector('meritietoportaali\\:Satamanume, Satamanume');
        const categoryElement = fm.querySelector('meritietoportaali\\:Kategoria, Kategoria');
        const urlElement = fm.querySelector('meritietoportaali\\:URL, URL');

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(latLon[0]), parseFloat(latLon[1])]
          },
          properties: {
            Nimi: nameElement ? nameElement.textContent : 'Unknown',
            Satamanume: numberElement ? numberElement.textContent : 'Unknown',
            Kategoria: categoryElement ? categoryElement.textContent : 'Unknown',
            URL: urlElement ? urlElement.textContent : '#'
          }
        };
      }).filter(feature => feature !== null);

      map.addSource('harbourData', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      });

      map.loadImage(`${process.env.PUBLIC_URL}/src/icons/harbour.png`, (error, image) => {
        if (error) throw error;
        map.addImage('harbour-icon', image);

        map.addLayer({
          id: 'harbours',
          type: 'symbol',
          source: 'harbourData',
          layout: {
            'icon-image': 'harbour-icon',
            'icon-size': 0.2,
            'icon-allow-overlap': true,
            'icon-anchor': 'bottom',
            visibility: 'none'
          }
        });

        map.on('click', 'harbours', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const { Nimi, Satamanume, Kategoria, URL } = e.features[0].properties;

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <h2>${Nimi} #${Satamanume}</h2>
              <p>${Kategoria}</p>
              <a href="${URL}" target="_blank">vierassatamat.fi</a>
            `)
            .addTo(map);
        });

        map.on('mouseenter', 'harbours', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'harbours', () => {
          map.getCanvas().style.cursor = '';
        });
      });
    })
    .catch(error => {
      console.error('Error loading harbour data:', error);
    });
};


export const loadPlaceNames = (map) => {

  // Attribution
  const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib-inner');
  if (attributionControl) {
    const customAttribution = document.createElement('a');
    customAttribution.href = 'https://www.maanmittauslaitos.fi/kartat-ja-paikkatieto/aineistot-ja-rajapinnat/tuotekuvaukset/nimisto';
    customAttribution.target = '_blank'; // new tab
    customAttribution.innerHTML = ' © Maanmittauslaitos nimistö & vesikivet 2024';
    attributionControl.appendChild(customAttribution);
  }

  // Load saaretGeoJSON
  loadGeoJsonData(map, saaretGeoJSON, 'saariTaiLuoto', '#333', 10); // black text

  // Load lautatGeoJSON
  loadGeoJsonData(map, lautatGeoJSON, 'lauttaJaLossi', '#CC5500', 10); // orange text

  // Load merialueetGeoJSON
  loadGeoJsonData(map, merialueetGeoJSON, 'merialueet', '#0000FF', 10); // blue text

  // Load harbour data
  loadHarbourData(map);
};
