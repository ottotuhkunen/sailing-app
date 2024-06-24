// alueet.js

export const loadAlueet = (map) => {
    // Load GeoJSON data
    fetch(`${process.env.PUBLIC_URL}/src/alueet.geojson`)
      .then(response => response.json())
      .then(data => {
        // Add the GeoJSON source
        map.addSource('alueet', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: data.features
          }
        });
  
        // Add layer for rendering polygons
        map.addLayer({
          id: 'alueet-layer',
          type: 'fill',
          source: 'alueet',
          paint: {
            'fill-color': '#088',
            'fill-opacity': 0.5
          }
        });

        // map.moveLayer('alueet-layer', 'race-route');
  
        // Add text layer to display VAYALUE_SY data
        map.addLayer({
          id: 'alueet-labels',
          type: 'symbol',
          source: 'alueet',
          layout: {
            'text-field': ['get', 'VAYALUE_SY'],
            'text-font': ['Open Sans Regular'],
            'text-size': 12
          },
          paint: {
            'text-color': '#000'
          },
          filter: ['>', ['zoom'], 12] // Display labels only when zoomed in
        });
      })
      .catch(error => {
        console.error('Error loading GeoJSON data:', error);
      });
  };
  