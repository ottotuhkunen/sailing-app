import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import turvalaitteetGeoJSON from '../json-files/turvalaitteet.geojson';
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

export const loadTurvalaitteet = (map) => {

  // Attribution
  const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib-inner');
  if (attributionControl) {
    const customAttribution = document.createElement('a');
    customAttribution.href = 'https://www.paikkatietohakemisto.fi/geonetwork/srv/fin/catalog.search#/metadata/bc585b68-837a-4609-85cd-3a17cac7c3de';
    customAttribution.target = '_blank'; // new tab
    customAttribution.innerHTML = ' © Väylävirasto vesiväyläaineisto';
    attributionControl.appendChild(customAttribution);
  }

  // Load GeoJSON data
  fetch(turvalaitteetGeoJSON)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.features) {
        // Add the GeoJSON source
        map.addSource('turvalaitteet', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: data.features
          }
        });

        // Preload images and add layers
        preloadImagesAndAddLayers(map, data.features);
      } else {
        console.error('Invalid GeoJSON data:', data);
      }
    })
    .catch(error => {
      console.error('Error loading GeoJSON data:', error);
    });

  function getIconFileName(navl_tyyp, ty_jnr) {
    if (navl_tyyp === 7) {
      return 'kari-poiju.png';
    } else if (navl_tyyp === 8) {
      return 'turvavesi-poiju.png';
    } else if (navl_tyyp === 9 || navl_tyyp === 0) {
      return 'erikois-poiju.png';
    } else if (navl_tyyp >= 1 && navl_tyyp <= 6) {
      if (tyJnrNames[ty_jnr] === 'Reunamerkki') {
        const direction = navlTyypNames[navl_tyyp].toLowerCase();
        return `${direction}-reunamerkki.png`;
      } else {
        const direction = navlTyypNames[navl_tyyp].toLowerCase();
        return `${direction}-poiju.png`;
      }
    } else if (navl_tyyp === 99) {
      if ([0, 6].includes(ty_jnr)) {
        return 'erikois-poiju.png';
      } else if (ty_jnr === 3) {
        return 'linjamerkki.png';
      } else if (ty_jnr === 8) {
        return 'tutkamerkki.png';
      } else if (ty_jnr === 13) {
        return 'kummeli.png';
      } else if (ty_jnr === 2) {
        return 'sektoriloisto.png';
      } else if (ty_jnr === 4) {
        return 'suuntaloisto.png';
      } else if (ty_jnr === 5) {
        return 'apuloisto.png';
      } else if (ty_jnr === 1) {
        return 'merimajakka.png';
      } else if (ty_jnr === 11) {
        return 'tunnusmajakka.png';
      }
    }
    return 'erikois-poiju.png';
  }

  function lightSetting(valaistu) {
    // valaistu value = "K" (kyllä) or "E" (ei)
    if (valaistu === "K") return "💡";
    else return "";
  }

  function preloadImagesAndAddLayers(map, features) {
    const loadedImages = {};

    features.forEach((feature) => {
      const { navl_tyyp, ty_jnr } = feature.properties;
      const iconFileName = getIconFileName(navl_tyyp, ty_jnr);

      if (!loadedImages[iconFileName]) {
        loadedImages[iconFileName] = new Promise((resolve, reject) => {
          map.loadImage(`${process.env.PUBLIC_URL}/src/icons/${iconFileName}`, (error, image) => {
            if (error) {
              console.error(`Error loading image: ${iconFileName}`, error);
              reject(error);
              return;
            }
            const iconName = `icon-${iconFileName}`;
            if (!map.hasImage(iconName)) {
              map.addImage(iconName, image);
            }
            resolve(iconName);
          });
        });
      }
    });

    Promise.all(Object.values(loadedImages)).then(() => {
      features.forEach((feature) => {
        const { navl_tyyp, ty_jnr } = feature.properties;
        const iconFileName = getIconFileName(navl_tyyp, ty_jnr);
        const iconName = `icon-${iconFileName}`;
        const layerId = `turvalaitteet-layer-${navl_tyyp}-${ty_jnr}`;

        const tyJnrCenterAnchor = [2, 4, 5, 11];

        if (!map.getLayer(layerId)) {
          const isCenterAnchor = tyJnrCenterAnchor.includes(ty_jnr);
          
          map.addLayer({
            id: layerId,
            type: 'symbol',
            source: 'turvalaitteet',
            filter: ['all', ['==', 'navl_tyyp', navl_tyyp], ['==', 'ty_jnr', ty_jnr]],
            layout: {
              'icon-image': iconName,
              'icon-size': 0.2,
              'icon-allow-overlap': true,
              'icon-anchor': isCenterAnchor ? 'center' : 'bottom'
            },
            minzoom: 10
          });
          
          // Add click event listener for popups
          map.on('click', layerId, (e) => {
            const feature = e.features[0];
            const { navl_tyyp, ty_jnr, nimis, sijaintis, valaistu } = feature.properties;

            const popupContent = `
              <h3 class="popupTitle">${nimis}</h3>
              <p class="popupText">${navlTyypNames[navl_tyyp]} ${tyJnrNames[ty_jnr]} ${lightSetting(valaistu)}</p>
              <p class="popupText2">${sijaintis}</p>
            `;

            new mapboxgl.Popup({ closeOnClick: true })
              .setLngLat(e.lngLat)
              .setHTML(popupContent)
              .addTo(map);
          });
        }
      });
    }).catch((error) => {
      console.error('Error preloading images:', error);
    });
  }

  // Load and process valosektorit.geojson data
  fetch(valosektoritGeoJSON)
  .then(response => response.json())
  .then(data => {
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
        minzoom: 10
      });

    } else {
      console.error('Invalid GeoJSON data:', data);
    }
  })
  .catch(error => {
    console.error('Error loading valosektorit GeoJSON data:', error);
  });
  function createSectorArcGeoJSON(coordinates, startBearing, endBearing, color) {
    const radius = 0.005; // Adjust radius for better visibility
    const separationAngle = 0.1; // Slight separation angle in degrees
  
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
    minzoom: 10
  });

  // add stones (vesikivet)
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
      'text-size': 14,
      'text-anchor': 'center',
      'text-allow-overlap': true
    },
    paint: {
      'text-color': '#000000'
    },
    minzoom: 12
  });
};