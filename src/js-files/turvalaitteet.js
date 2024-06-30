import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import turvalaitteetGeoJSON from '../json-files/turvalaitteet.geojson';

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

const navlTyypNamesText = {
  0: 'Tuntematon',
  1: 'Vasen',
  2: 'Oikea',
  3: 'Pohjois',
  4: 'Etelä',
  5: 'Länsi',
  6: 'Itä',
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

export const loadTurvalaitteet = (map, iconPath) => {

  fetch(turvalaitteetGeoJSON)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (map.getSource('turvalaitteet')) {
        console.warn('Source "turvalaitteet" already exists.');
        return;
      }
      if (data && data.features) {
        map.addSource('turvalaitteet', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: data.features
          }
        });
        preloadImagesAndAddLayers(map, data.features, iconPath);
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
    return valaistu === "K" ? "💡" : "";
  }

  function preloadImagesAndAddLayers(map, features, iconPath) {
    const loadedImages = {};

    features.forEach((feature) => {
      const { navl_tyyp, ty_jnr } = feature.properties;
      const iconFileName = getIconFileName(navl_tyyp, ty_jnr);

      if (!loadedImages[iconFileName]) {
        loadedImages[iconFileName] = new Promise((resolve, reject) => {
          map.loadImage(`${iconPath}/${iconFileName}`, (error, image) => {
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
        const isCenterAnchor = tyJnrCenterAnchor.includes(ty_jnr);

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'symbol',
            source: 'turvalaitteet',
            filter: ['all', ['==', 'navl_tyyp', navl_tyyp], ['==', 'ty_jnr', ty_jnr]],
            layout: {
              'icon-image': iconName,
              'icon-size': 0.24,
              'icon-allow-overlap': true,
              'icon-anchor': isCenterAnchor ? 'center' : 'bottom'
            },
            minzoom: 11
          });

          map.on('click', layerId, (e) => {
            const feature = e.features[0];
            const { navl_tyyp, ty_jnr, nimis, sijaintis, valaistu } = feature.properties;

            const popupContent = `
              <h3 class="popupTitle">${nimis}</h3>
              <p class="popupText">${navlTyypNamesText[navl_tyyp]} ${tyJnrNames[ty_jnr]} ${lightSetting(valaistu)}</p>
              <p class="popupText2">${sijaintis}</p>
            `;

            new mapboxgl.Popup({ closeOnClick: true })
              .setLngLat(e.lngLat)
              .setHTML(popupContent)
              .addTo(map);
          });
        }
      });
    }).catch(error => {
      console.error('Error preloading images:', error);
    });
  }
};

export const removeTurvalaitteet = (map) => {
  const layers = map.getStyle().layers;

  layers.forEach((layer) => {
    if (layer.id.startsWith('turvalaitteet-layer-')) {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    }
  });

  if (map.getSource('turvalaitteet')) {
    map.removeSource('turvalaitteet');
  }

  // Remove previously loaded images
  const images = map.listImages();
  images.forEach((image) => {
    if (image.startsWith('icon-')) {
      map.removeImage(image);
    }
  });
};
