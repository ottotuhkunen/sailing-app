// App.js
import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { loadTurvalaitteet } from './turvalaitteet';
import { loadAlueet } from './alueet';
import { loadVaylat } from './vaylat';
import { loadRace } from './reitti';
import { loadLiikenne } from './liikenne';
import NavBar from './NavBar';
import { loadPlaceNames } from './placeNames'; 

mapboxgl.accessToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';

function App() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const isFollowingRef = useRef(true);  // Use useRef to track following state
  const [userLocation, setUserLocation] = useState(null);
  const [isFollowing, setIsFollowing] = useState(true);

  useEffect(() => {
    isFollowingRef.current = isFollowing;
  }, [isFollowing]);

  // Function to initialize the map
  const initializeMap = () => {
    mapInstanceRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/ottotuhkunen/clxn5yadi002m01r0896chtyt',
      center: [22.2240, 60.1789],
      zoom: 9
    });

    mapInstanceRef.current.on('load', () => {
      // const cottageMarkerEl = document.createElement('div');
      // cottageMarkerEl.className = 'cottage-marker';
      // cottageMarkerEl.style.backgroundImage = `url(${process.env.PUBLIC_URL}/src/icons/cottage.png)`;
      // cottageMarkerEl.style.width = '24px';
      // cottageMarkerEl.style.height = '24px';
      // cottageMarkerEl.style.backgroundSize = 'contain';

      // new mapboxgl.Marker({
        // element: cottageMarkerEl,
      // })
      // .setLngLat([22.224016, 60.178941])
      // .addTo(mapInstanceRef.current);

      loadTurvalaitteet(mapInstanceRef.current);
      loadAlueet(mapInstanceRef.current);
      loadVaylat(mapInstanceRef.current);
      // loadRace(mapInstanceRef.current);
      loadLiikenne(mapInstanceRef.current);
      loadPlaceNames(mapInstanceRef.current);

      // Handle map drag and zoom events
      const stopFollowing = () => {
        // console.log('User interaction detected. Stopping follow mode.');
        setIsFollowing(false);
      };

      mapInstanceRef.current.on('dragstart', stopFollowing);
      mapInstanceRef.current.on('mousedown', stopFollowing);

      updateUserLocation();
      const locationUpdateInterval = setInterval(updateUserLocation, 5000); // Update every 5 seconds

      return () => clearInterval(locationUpdateInterval);

    });

    return mapInstanceRef.current;
  };

  const updateUserLocation = () => {
    // console.log("position updated");
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLngLat([longitude, latitude]);
        } else {
          const el = document.createElement('div');
          el.className = 'location-marker';
          el.style.backgroundImage = `url(${process.env.PUBLIC_URL}/src/icons/boat.png)`;
          el.style.width = '26px';
          el.style.height = '26px';
          el.style.backgroundSize = 'contain';

          userLocationMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(mapInstanceRef.current);
        }

        // console.log(isFollowingRef.current);

        if (isFollowingRef.current) {
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            essential: true
          });
        }
      },
      error => {
        console.error('Error getting user location:', error);
      },
      { enableHighAccuracy: true }
    );
  };


  useEffect(() => {
    const mapInstance = initializeMap();
    return () => {
      mapInstance.remove();
    };
  }, []);

  const recenterMap = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo({
        center: userLocation,
        essential: true
      });
      console.log("Recentering and starting to follow user location");
      setIsFollowing(true);
    }
  };

  return (
    <div className="App">
      <div id="map" className="map-container" ref={mapContainerRef} />
      <NavBar recenterMap={recenterMap} />
    </div>
  );
}

export default App;
