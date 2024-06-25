let map;  // Define map variable to store Mapbox map instance

export const initializeLine = (mapInstance) => {
  map = mapInstance;  // Set the map variable to the provided map instance
};

export const drawLine = (start, end) => {
  if (map) {
    clearLine();  // Clear any existing line and dot layers

    // Add source for the line
    map.addSource('line-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [start, end]
        }
      }
    });

    // Add layer for the line
    map.addLayer({
      id: 'line-layer',
      type: 'line',
      source: 'line-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'black',
        'line-width': 2,
        'line-dasharray': [2, 2]  // Adjust for different dash patterns
      }
    });

    // Add dot layer at the end of the line
    map.addLayer({
      id: 'end-dot',
      type: 'circle',
      source: 'line-source',
      paint: {
        'circle-radius': 4,
        'circle-color': 'black'
      },
      geometry: {
        type: 'Point',
        coordinates: end
      }
    });
  }
};

export const clearLine = () => {
  if (map) {
    if (map.getLayer('line-layer')) {
      map.removeLayer('line-layer');
    }
    if (map.getLayer('end-dot')) {
      map.removeLayer('end-dot');
    }
    if (map.getSource('line-source')) {
      map.removeSource('line-source');
    }
  }
};
