import React, { useEffect, useState } from 'react';
import './App.css'; // Import your CSS file for styling
import mapboxgl from 'mapbox-gl'; // Import mapbox-gl library
import 'mapbox-gl/dist/mapbox-gl.css';
import { loadTurvalaitteet } from './turvalaitteet';
import { loadAlueet } from './alueet';
import { loadVaylat } from './vaylat';
import { loadRace } from './reitti';
import { loadLiikenne } from './liikenne';
import NavBar from './NavBar'; 

// Set your Mapbox access token globally
mapboxgl.accessToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';

function App() {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // State to hold user's current location

  // Function to initialize the map
  const initializeMap = () => {
    const mapInstance = new mapboxgl.Map({
      container: 'map', // container ID where the map will be rendered
      style: 'mapbox://styles/ottotuhkunen/clxn5yadi002m01r0896chtyt', // Mapbox style URL
      center: [22.2240, 60.1789], // starting position [lng, lat] for Finland (Heisala)
      zoom: 9 // starting zoom level
    });

    // When the map is loaded, load additional data and layers
    mapInstance.on('load', () => {
      // Custom marker for Heisala cottage
      const cottageMarkerEl = document.createElement('div');
      cottageMarkerEl.className = 'cottage-marker';
      cottageMarkerEl.style.backgroundImage = `url(${process.env.PUBLIC_URL}/src/icons/cottage.png)`; // Adjust path as per your actual file location
      cottageMarkerEl.style.width = '24px';
      cottageMarkerEl.style.height = '24px';
      cottageMarkerEl.style.backgroundSize = 'contain';

      new mapboxgl.Marker({
        element: cottageMarkerEl,
      })
      .setLngLat([22.224016, 60.178941]) // Set the coordinates for the marker
      .addTo(mapInstance);

      loadTurvalaitteet(mapInstance); // Load turvalaitteet data and layers
      loadAlueet(mapInstance); // Load alueet data and layers
      loadVaylat(mapInstance);
      loadRace(mapInstance);
      loadLiikenne(mapInstance);

      setMap(mapInstance);

      // Attempt to get user's current location
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]); // Set user's location in state
          mapInstance.setCenter([longitude, latitude]); // Center map on user's location

          // Add marker at user's location
          const el = document.createElement('div');
          el.className = 'location-marker';
          el.style.backgroundImage = `url(${process.env.PUBLIC_URL}/src/icons/boat.png)`; // Adjust path as per your actual file location
          el.style.width = '26px';
          el.style.height = '26px';
          el.style.backgroundSize = 'contain';

          new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(mapInstance);
        },
        error => {
          console.error('Error getting user location:', error);
          // If geolocation fails, handle gracefully
        }
      );
    });

    // Cleanup function to remove the map
    return mapInstance;
  };

  useEffect(() => {
    const mapInstance = initializeMap();
    return () => mapInstance.remove();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Function to recenter map to user's location
  const recenterMap = () => {
    if (map && userLocation) {
      map.flyTo({
        center: userLocation,
        zoom: 9,
        essential: true // ensures this animation is prioritized
      });
    }
  };

  return (
    <div className="App">
      <div id="map" className="map-container" />
      <NavBar recenterMap={recenterMap} /> {/* Pass recenterMap function to NavBar */}
    </div>
  );
}

export default App;
