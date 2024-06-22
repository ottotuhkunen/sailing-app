import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token globally
mapboxgl.accessToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';

// Define URLs for vessel locations and vessel data
const vesselLocationsUrl = 'https://meri.digitraffic.fi/api/ais/v1/locations';
const vesselDataUrl = 'https://meri.digitraffic.fi/api/ais/v1/vessels';

// Define ship types and corresponding icon filenames
const shipTypeIcons = {
  0: 'Ei_tietoa.png',
  20: 'Patosiipialus.png',
  31: 'Hinaaja.png',
  32: 'Hinaaja.png',
  33: 'Ruoppaus.png',
  34: 'Sukellustoiminta.png',
  35: 'Sota-alus.png',
  36: 'Purjealus.png',
  37: 'Huvialus.png',
  40: 'Pika-alus.png',
  50: 'Luotsi.png',
  51: 'Pelastusalus.png',
  52: 'Hinaaja.png',
  53: 'Yhteysalus.png',
  54: 'Ympäristövahinkojen_torjunta.png',
  55: 'Viranomainen.png',
  56: 'Muu_tyyppi.png',
  57: 'Muu_tyyppi.png',
  58: 'Muu_tyyppi.png',
  59: 'Muu_tyyppi.png',
  60: 'Matkustajalaiva.png',
  70: 'Rahtialus.png',
  80: 'Tankkeri.png',
  90: 'Muu_alus.png'
};

const shipTypeDescriptions = {
  0: 'Ei tietoa',
  20: 'Patosiipialus',
  31: 'Hinaaja',
  32: 'Hinaaja',
  33: 'Ruoppaus',
  34: 'Sukellustoiminta',
  35: 'Sota-alus',
  36: 'Purjealus',
  37: 'Huvialus',
  40: 'Pika-alus',
  50: 'Luotsi',
  51: 'Pelastusalus',
  52: 'Hinaaja',
  53: 'Yhteysalus',
  54: 'Ympäristövahinkojen torjunta',
  55: 'Viranomainen',
  56: 'Muu tyyppi',
  57: 'Muu tyyppi',
  58: 'Muu tyyppi',
  59: 'Muu tyyppi',
  60: 'Matkustajalaiva',
  70: 'Rahtialus',
  80: 'Tankkeri',
  90: 'Muu alus'
};

// Preload icons
const preloadIcons = (map) => {
  const promises = [];
  Object.entries(shipTypeIcons).forEach(([shipType, icon]) => {
    const iconUrl = `/src/icons/vessels/${icon}`;
    const iconName = `ship-icon-${shipType}`;

    if (!map.hasImage(iconName)) { // Check if image is already loaded
      promises.push(new Promise((resolve, reject) => {
        map.loadImage(iconUrl, (error, image) => {
          if (error) {
            reject(error);
          } else {
            map.addImage(iconName, image);
            resolve();
          }
        });
      }));
    }
  });
  return Promise.all(promises);
};

// Function to get ship type description
const getShipTypeDescription = (shipType) => {
  return shipTypeDescriptions[shipType] || 'Tuntematon';
};

// Function to load vessel locations and data, and add them to the map
export const loadLiikenne = async (map) => {
  try {
    // Preload all icons
    await preloadIcons(map);

    const [locationsData, vesselsData] = await Promise.all([
      fetch(vesselLocationsUrl).then(response => response.json()),
      fetch(vesselDataUrl).then(response => response.json())
    ]);

    if (!Array.isArray(locationsData.features) || !Array.isArray(vesselsData)) {
      throw new Error('Invalid data format from API');
    }

    // Create a map of vessels by MMSI for quick lookup
    const vesselsByMMSI = vesselsData.reduce((acc, vessel) => {
      acc[vessel.mmsi] = vessel;
      return acc;
    }, {});

    const features = locationsData.features.map(location => {
      const { mmsi, geometry, properties } = location;
      const vessel = vesselsByMMSI[mmsi];
      if (vessel) {
        const { name, destination, shipType, callSign } = vessel;
        const iconName = `ship-icon-${shipType}`; // Unique icon name based on ship type
        return {
          type: 'Feature',
          geometry,
          properties: {
            mmsi,
            name,
            destination,
            shipType: getShipTypeDescription(shipType),
            callSign,
            sog: properties.sog,
            heading: properties.heading,
            icon: map.hasImage(iconName) ? iconName : 'Ei_tietoa.png' // Default icon if not loaded
          }
        };
      }
      return null;
    }).filter(feature => feature !== null);

    // Register default icon for 'Ei_tietoa.png' if not already registered
    const defaultIconName = 'Ei_tietoa.png';
    if (!map.hasImage(defaultIconName)) {
      const defaultIconUrl = `/src/icons/vessels/${defaultIconName}`;
      map.loadImage(defaultIconUrl, (error, image) => {
        if (error) throw error;
        map.addImage(defaultIconName, image);
      });
    }

    // Add a GeoJSON source with cluster support
    if (!map.getSource('vessels')) {
      map.addSource('vessels', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });
    } else {
      map.getSource('vessels').setData({
        type: 'FeatureCollection',
        features
      });
    }

    // Add cluster layer
    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'vessels',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#51bbd6',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'vessels',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });
    }

    // Add unclustered point layer
    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'vessels',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 0.1,
          'icon-allow-overlap': true,
          'icon-rotate': ['get', 'heading'] // Rotate icon based on heading
        }
      });
    }

    // Add a click event listener for the unclustered points
    map.on('click', 'unclustered-point', (e) => {
      const { name, destination, shipType, callSign, sog } = e.features[0].properties;
      const coordinates = e.features[0].geometry.coordinates.slice();

      const popupContent = `
        <h3 class="popupTitle">${name}</h3>
        <p class="popupText">Määränpää: ${destination}</p>
        <p class="popupText">Nopeus (SOG): ${sog} kn</p>
        <p class="popupText">Tyyppi: ${shipType}</p>
        <p class="popupText">Kutsu: ${callSign}</p>
      `;

      new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the unclustered points
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to default when it leaves
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

  } catch (error) {
    console.error('Error loading vessel data:', error);
  }
};

