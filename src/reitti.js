import mapboxgl from 'mapbox-gl';

const raceGeoJSON = `${process.env.PUBLIC_URL}/src/reitti.geojson`; // Path to your race route geojson
const instructionsGeoJSON = `${process.env.PUBLIC_URL}/src/reittiohjeet.geojson`; // Path to your instructions geojson

export const loadRace = (map) => {
  // Function to fetch and add race route
  const addRaceRoute = () => {
    fetch(raceGeoJSON)
      .then(response => response.json())
      .then(data => {
        // Add the race line to the map
        map.addSource('race-route', {
          type: 'geojson',
          data: data
        });

        // Add race-route layer with beforeId to ensure it's on top
        map.addLayer({
          id: 'race-route',
          type: 'line',
          source: 'race-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF0000', // Red color
            'line-width': 2, // Line thickness
            'line-dasharray': [1, 2]
          }
        });

        map.moveLayer('race-route');
      })
      .catch(error => {
        console.error('Error loading race route:', error);
      });
  };

  // Function to fetch and add instructions markers and popups
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
          markerEl.style.backgroundImage = 'url(/src/icons/info-16.png)';
          markerEl.style.width = '16px';
          markerEl.style.height = '16px';

          // Create a popup with the instruction
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<p>${instruction}</p>`);

          // Create a marker on the map
          new mapboxgl.Marker(markerEl)
            .setLngLat(coordinates)
            .setPopup(popup) // Bind popup to marker
            .addTo(map);
        });
      })
      .catch(error => {
        console.error('Error loading instructions:', error);
      });
  };

  // Call functions to add race route and instructions
  addRaceRoute();
  addInstructions();
};
