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
import { initializeLine, drawLine, clearLine } from './line'; // Import line functions

mapboxgl.accessToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';

function App() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geolocateControlRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [info, setInfo] = useState(null);

  // Function to initialize the map
  const initializeMap = () => {
    mapInstanceRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/ottotuhkunen/clxn5yadi002m01r0896chtyt',
      center: [22.2240, 60.1789],
      zoom: 9,
      pitchWithRotate: false,
      pitch: 0
    });

    mapInstanceRef.current.on('load', () => {
      loadTurvalaitteet(mapInstanceRef.current);
      loadAlueet(mapInstanceRef.current);
      loadVaylat(mapInstanceRef.current);
      loadRace(mapInstanceRef.current);
      loadLiikenne(mapInstanceRef.current);
      loadPlaceNames(mapInstanceRef.current);

      // Add zoom and rotation controls to the map.
      mapInstanceRef.current.addControl(new mapboxgl.NavigationControl());

      // Add geolocate control to the map.
      geolocateControlRef.current = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        fitBoundsOptions: {
          maxZoom: 15
        },
        trackUserLocation: 'compass',
        showUserHeading: true,
        showAccuracyCircle: false
      });

      mapInstanceRef.current.addControl(geolocateControlRef.current);

      // Event listener for geolocate control
      geolocateControlRef.current.on('geolocate', (e) => {
        const userPosition = [e.coords.longitude, e.coords.latitude];
        setUserLocation(userPosition);
      });

      // Initialize line functions with map instance
      initializeLine(mapInstanceRef.current);
    });

    return mapInstanceRef.current;
  };

  useEffect(() => {
    const mapInstance = initializeMap();
    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    const mapInstance = mapInstanceRef.current;

    mapInstance.on('click', (e) => {
      if (userLocation) {
        const clickedPosition = [e.lngLat.lng, e.lngLat.lat];
        drawLine(userLocation, clickedPosition);
        const bearing = parseFloat(calculateBearing(userLocation, clickedPosition)).toFixed(1);
        const distance = parseFloat(calculateDistance(userLocation, clickedPosition)).toFixed(1);
        setInfo({ bearing, distance });
      }
    });

    return () => {
      mapInstance.off('click');
    };
  }, [userLocation]);

  const calculateBearing = (start, end) => {
    const startLat = start[1] * (Math.PI / 180);
    const startLng = start[0] * (Math.PI / 180);
    const endLat = end[1] * (Math.PI / 180);
    const endLng = end[0] * (Math.PI / 180);

    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;
    return bearing.toFixed(2);
  };

  const calculateDistance = (start, end) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (end[1] - start[1]) * (Math.PI / 180);
    const dLng = (end[0] - start[0]) * (Math.PI / 180);

    const lat1 = start[1] * (Math.PI / 180);
    const lat2 = end[1] * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    const distanceNauticalMiles = distance * 0.539957; // Convert to nautical miles
    return distanceNauticalMiles.toFixed(2);
  };

  const clearLineAndInfo = () => {
    clearLine();
    setInfo(null);
  };

  return (
    <div className="App">
      <div id="map" className="map-container" ref={mapContainerRef} />
      <NavBar />
      {info && (
        <div className="info-box">
          <p>Suunta: {info.bearing}° Matka: {info.distance} NM</p>
          <button onClick={clearLineAndInfo}>Poista mitta</button>
        </div>
      )}
    </div>
  );
}

export default App;
