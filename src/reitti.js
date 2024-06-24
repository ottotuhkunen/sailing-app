import mapboxgl from 'mapbox-gl';

const raceGeoJSON = `${process.env.PUBLIC_URL}/src/reitti.geojson`; // route geojson
const instructionsGeoJSON = `${process.env.PUBLIC_URL}/src/reittiohjeet.geojson`; // instructions geojson

export const loadRace = (map) => {
  // Fetch and add race route
  const addRaceRoute = () => {
    fetch(raceGeoJSON)
      .then(response => response.json())
      .then(data => {
        // Add race line to the map
        map.addSource('race-route', {
          type: 'geojson',
          data: data
        });

        map.addLayer({
          id: 'race-route',
          type: 'line',
          source: 'race-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF0000', // Red
            'line-width': 2,
            'line-dasharray': [1, 2]
          }
        });

        map.moveLayer('race-route');
      })
      .catch(error => {
        console.error('Error loading race route:', error);
      });
  };

  // Fetch and add instructions markers and popups
  const addInstructions = () => {
    fetch(instructionsGeoJSON)
      .then(response => response.json())
      .then(data => {
        data.features.forEach(feature => {
          // Extract coordinates and instruction
          const coordinates = feature.geometry.coordinates;
          const instruction = feature.properties.ohje;

          // Create a marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'custom-marker';
          markerEl.style.backgroundImage = `url(${process.env.PUBLIC_URL}/src/icons/info-16.png)`;
          markerEl.style.width = '16px';
          markerEl.style.height = '16px';

          // Popup with the instruction
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<p>${instruction}</p>`);

          // Create a marker
          new mapboxgl.Marker(markerEl)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);
        });
      })
      .catch(error => {
        console.error('Error loading instructions:', error);
      });
  };

  addRaceRoute();
  addInstructions();
};
