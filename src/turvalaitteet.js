import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

/*
const iconFileNames = {
  0: 'erikois-poiju.png',
  1: 'vasen-poiju.png',
  2: 'oikea-poiju.png',
  3: 'pohjois-poiju.png',
  4: 'etela-poiju.png',
  5: 'lansi-poiju.png',
  6: 'ita-poiju.png',
  7: 'kari-poiju.png',
  8: 'turvavesi-poiju.png',
  9: 'erikois-poiju.png',
  99: 'erikois-poiju.png'
};
*/

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

export const loadTurvalaitteet = (map) => {
  // Load GeoJSON data
  fetch('/src/turvalaitteet.geojson')
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

  function preloadImagesAndAddLayers(map, features) {
    const loadedImages = {};

    features.forEach((feature) => {
      const { navl_tyyp, ty_jnr } = feature.properties;
      const iconFileName = getIconFileName(navl_tyyp, ty_jnr);

      if (!loadedImages[iconFileName]) {
        loadedImages[iconFileName] = new Promise((resolve, reject) => {
          map.loadImage(`/src/icons/${iconFileName}`, (error, image) => {
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

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'symbol',
            source: 'turvalaitteet',
            filter: ['all', ['==', 'navl_tyyp', navl_tyyp], ['==', 'ty_jnr', ty_jnr]],
            layout: {
              'icon-image': iconName,
              'icon-size': 0.2, // Adjust icon size as necessary
              'icon-allow-overlap': true,
              'icon-anchor': 'bottom'
            },
            minzoom: 10
          });

          // Add click event listener for popups
          map.on('click', layerId, (e) => {
            const feature = e.features[0];
            const { navl_tyyp, ty_jnr, nimis, sijaintis } = feature.properties;

            const popupContent = `
              <h3 class="popupTitle">${nimis}</h3>
              <p class="popupText">${navlTyypNames[navl_tyyp]} ${tyJnrNames[ty_jnr]}</p>
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
};
