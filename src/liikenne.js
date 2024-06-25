import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';
const vesselLocationsUrl = 'https://meri.digitraffic.fi/api/ais/v1/locations';
const vesselDataUrl = 'https://meri.digitraffic.fi/api/ais/v1/vessels';

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
    const iconUrl = `${process.env.PUBLIC_URL}/src/icons/vessels/${icon}`;
    const iconName = `ship-icon-${shipType}`;

    if (!map.hasImage(iconName)) {
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

let vesselPositions = {};

const fetchVesselData = async () => {
  const [locationsData, vesselsData] = await Promise.all([
    fetch(vesselLocationsUrl).then(response => response.json()),
    fetch(vesselDataUrl).then(response => response.json())
  ]);

  return { locationsData, vesselsData };
};

const updateVesselPositions = (map, locationsData, vesselsByMMSI) => {
  const newPositions = {};

  const now = Date.now();
  const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

  const features = locationsData.features.map(location => {
    const { mmsi, geometry, properties } = location;
    const vessel = vesselsByMMSI[mmsi];
    const lastUpdate = properties.timestampExternal;

    if (vessel && (now - lastUpdate) <= THIRTY_MINUTES_IN_MS) {
      const { name, destination, shipType, callSign } = vessel;
      const iconName = `ship-icon-${shipType}`;

      const currentPos = geometry.coordinates;
      const previousPos = vesselPositions[mmsi] ? vesselPositions[mmsi].coordinates : currentPos;
      const heading = properties.heading;
      const previousHeading = vesselPositions[mmsi] ? vesselPositions[mmsi].heading : heading;

      newPositions[mmsi] = {
        coordinates: currentPos,
        heading
      };

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: previousPos
        },
        properties: {
          mmsi,
          name,
          destination,
          shipType: getShipTypeDescription(shipType),
          callSign,
          sog: properties.sog,
          heading: previousHeading,
          newHeading: heading,
          newCoordinates: currentPos,
          lastUpdate,
          icon: map.hasImage(iconName) ? iconName : 'Ei_tietoa.png'
        }
      };
    }
    return null;
  }).filter(feature => feature !== null);

  vesselPositions = newPositions;

  if (!map.getSource('vessels')) {
    map.addSource('vessels', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
  } else {
    map.getSource('vessels').setData({
      type: 'FeatureCollection',
      features
    });
  }

  return features;
};

const animateVessels = (map) => {
  const source = map.getSource('vessels');
  const features = source._data.features;

  features.forEach(feature => {
    const { properties, geometry } = feature;
    const { mmsi, newCoordinates, newHeading } = properties;

    const previousPos = geometry.coordinates;
    const newPos = newCoordinates;

    const prevHeading = properties.heading;
    const nextHeading = newHeading;

    const interpolatePosition = (t) => {
      return [
        previousPos[0] + (newPos[0] - previousPos[0]) * t,
        previousPos[1] + (newPos[1] - previousPos[1]) * t
      ];
    };

    const interpolateHeading = (t) => {
      return prevHeading + (nextHeading - prevHeading) * t;
    };

    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 1000, 1); // 1 second duration
      feature.geometry.coordinates = interpolatePosition(progress);
      feature.properties.heading = interpolateHeading(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        feature.geometry.coordinates = newPos;
        feature.properties.heading = nextHeading;
      }
    };

    requestAnimationFrame(animate);
  });

  source.setData(source._data);
};

const updateVessels = async (map) => {
  console.log("Updating vessels");
  const { locationsData, vesselsData } = await fetchVesselData();
  const vesselsByMMSI = vesselsData.reduce((acc, vessel) => {
    acc[vessel.mmsi] = vessel;
    return acc;
  }, {});

  const features = updateVesselPositions(map, locationsData, vesselsByMMSI);
  animateVessels(map);
};

export const loadLiikenne = async (map) => {

  // Attribution
  const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib-inner');
  if (attributionControl) {
    const customAttribution = document.createElement('a');
    customAttribution.href = 'https://www.digitraffic.fi/meriliikenne/';
    customAttribution.target = '_blank'; // new tab
    customAttribution.innerHTML = ' © Digitraffic';
    attributionControl.appendChild(customAttribution);
  }

  try {
    await preloadIcons(map);

    await updateVessels(map);

    setInterval(() => {
      updateVessels(map);
    }, 20000);

    // Add cluster layer
    if (!map.getLayer('liikenne-clusters')) {
      map.addLayer({
        id: 'liikenne-clusters',
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
        id: 'liikenne-cluster-count',
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
    if (!map.getLayer('liikenne-unclustered-point')) {
      map.addLayer({
        id: 'liikenne-unclustered-point',
        type: 'symbol',
        source: 'vessels',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 0.1,
          'icon-allow-overlap': true,
          'icon-rotate': ['get', 'heading']
        }
      });
    }

    // Add a click event listener for the unclustered points
    map.on('click', 'liikenne-unclustered-point', (e) => {
      const { name, destination, shipType, callSign, sog, lastUpdate } = e.features[0].properties;
      const coordinates = e.features[0].geometry.coordinates.slice();

      const now = Date.now();
      const timeDiff = Math.floor((now - lastUpdate) / (1000 * 60)); // difference in minutes
      const popupContent = `
        <h3 class="popupTitle">${name}</h3>
        <p class="popupText">${shipType}</p>
        <p class="popupText">Määränpää: ${destination}</p>
        <p class="popupText">Nopeus: ${sog} kn</p>
        <p class="popupText">Kutsu: ${callSign}</p>
        <p class="popupText">Päivitetty: -${timeDiff} min.</p>
      `;

      new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
    });

    // Cursor to a pointer when the mouse is over the unclustered points
    map.on('mouseenter', 'liikenne-unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'liikenne-unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

  } catch (error) {
    console.error('Error loading vessel data:', error);
  }
};
