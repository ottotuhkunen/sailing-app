import mapboxgl from 'mapbox-gl';

import raceGeoJSON from '../json-files/reitti.geojson';
import instructionsGeoJSON from '../json-files/reittiohjeet.geojson';

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
            'line-color': 'red', // Red
            'line-width': 1.5,
            'line-dasharray': [1, 3, 3, 3]
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
