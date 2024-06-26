let map;

export const initializeLine = (mapInstance) => {
  map = mapInstance;  // Map instance
};

export const drawLine = (start, end) => {
  if (map) {
    clearLine();  // Clear any existing line

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

    // Line layer
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
        'line-dasharray': [2, 2]
      }
    });

    // Dot layer
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
