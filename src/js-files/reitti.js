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
        // Add instructions to the map
        map.addSource('race-instructions', {
          type: 'geojson',
          data: data
        });

        map.loadImage(`${process.env.PUBLIC_URL}/src/icons/info-16.png`, (error, image) => {
          if (error) throw error;
          map.addImage('info-icon', image);

          map.addLayer({
            id: 'race-information',
            type: 'symbol',
            source: 'race-instructions',
            layout: {
              'icon-image': 'info-icon',
              'icon-size': 0.8,
              'icon-allow-overlap': true,
              'text-allow-overlap': true
            }
          });

          // Add click event listener for popups
          map.on('click', 'race-information', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.ohje;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`<p>${description}</p>`)
              .addTo(map);
          });

          map.on('mouseenter', 'race-information', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          
          map.on('mouseleave', 'race-information', () => {
            map.getCanvas().style.cursor = '';
          });
        });
      })
      .catch(error => {
        console.error('Error loading instructions:', error);
      });
  };

  addRaceRoute();
  addInstructions();
};
