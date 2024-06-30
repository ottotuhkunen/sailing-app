import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import NavBar from './js-files/NavBar';
import { loadTurvalaitteet, removeTurvalaitteet } from './js-files/turvalaitteet';
import { loadSektoritJaLinjat } from './js-files/sektoritJaLinjat'; 
import { loadAlueet } from './js-files/alueet';
import { loadVaylat } from './js-files/vaylat';
import { loadRace } from './js-files/reitti';
import { loadLiikenne } from './js-files/liikenne';
import { loadPlaceNames } from './js-files/placeNames';
import { initializeLine, drawLine, clearLine } from './js-files/line';
import { loadSoundingPoints } from './js-files/sounding';
import { loadDepthContours } from './js-files/sounding';
import MapInformation from './js-files/mapInformation'; 

mapboxgl.accessToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';

function App() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geolocateControlRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [info, setInfo] = useState(null);
  const [isRulerMode, setIsRulerMode] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [iconPath, setIconPath] = useState(`${process.env.PUBLIC_URL}/src/icons/merkit`);
  const [showMapInfo, setShowMapInfo] = useState(false);

  const initializeMap = () => {
    mapInstanceRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/ottotuhkunen/clxn5yadi002m01r0896chtyt',
      center: [22.2240, 60.1789],
      zoom: 9,
      pitchWithRotate: true,
      pitch: 0
    });

    mapInstanceRef.current.on('load', () => {
      loadDepthContours(mapInstanceRef.current);
      setMapLoaded(true);
      loadVaylat(mapInstanceRef.current);
      loadRace(mapInstanceRef.current);
      loadLiikenne(mapInstanceRef.current);
      loadPlaceNames(mapInstanceRef.current);
      loadAlueet(mapInstanceRef.current);
      loadSektoritJaLinjat(mapInstanceRef.current);
      loadSoundingPoints(mapInstanceRef.current);
      
      mapInstanceRef.current.addControl(new mapboxgl.NavigationControl());

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

      geolocateControlRef.current.on('geolocate', (e) => {
        const userPosition = [e.coords.longitude, e.coords.latitude];
        setUserLocation(userPosition);
      });

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
  
    if (mapLoaded) {
      removeTurvalaitteet(mapInstance); // Remove existing layers and sources
      loadTurvalaitteet(mapInstance, iconPath); // Load new layers and sources with the updated iconPath
    }
  }, [iconPath, mapLoaded]);

  useEffect(() => {
    const mapInstance = mapInstanceRef.current;

    const handleClick = (e) => {
      if (userLocation) {
        const clickedPosition = [e.lngLat.lng, e.lngLat.lat];
        drawLine(userLocation, clickedPosition);
        const bearing = parseFloat(calculateBearing(userLocation, clickedPosition)).toFixed(1);
        const distance = parseFloat(calculateDistance(userLocation, clickedPosition)).toFixed(1);
        setInfo({ bearing, distance });
      }
    };

    if (isRulerMode) {
      mapInstance.on('click', handleClick);
    } else {
      mapInstance.off('click', handleClick);
    }

    return () => {
      mapInstance.off('click', handleClick);
    };
  }, [isRulerMode, userLocation]);

  const calculateBearing = (start, end) => {
    const startLat = start[1] * (Math.PI / 180);
    const startLng = start[0] * (Math.PI / 180);
    const endLat = end[1] * (Math.PI / 180);
    const endLng = end[0] * (Math.PI / 180);

    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * (Math.cos(endLat));
    const x = (Math.cos(startLat) * Math.sin(endLat)) - (Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng));

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

    const distance = R * c; // Distance in km
    const distanceNauticalMiles = distance * 0.539957; // Convert to NM
    return distanceNauticalMiles.toFixed(2);
  };

  const clearLineAndInfo = () => {
    clearLine();
    setInfo(null);
  };

  const toggleRulerMode = () => {
    setIsRulerMode(!isRulerMode);
    if (isRulerMode) {
      clearLineAndInfo();
    }
  };

  const toggleIconPath = () => {
    setIconPath(prevPath => 
      prevPath === `${process.env.PUBLIC_URL}/src/icons/merkit` 
        ? `${process.env.PUBLIC_URL}/src/icons/paivamerkit` 
        : `${process.env.PUBLIC_URL}/src/icons/merkit`
    );
  };

  const toggleMapInfo = () => {
    setShowMapInfo(!showMapInfo);
  };

  return (
    <div className="App">
      <div id="map" className="map-container" ref={mapContainerRef} />
      {mapLoaded && <NavBar map={mapInstanceRef.current} />}
      <button className={`ruler-button ${isRulerMode ? 'active' : ''}`} onClick={toggleRulerMode}>
        <img src={`${process.env.PUBLIC_URL}/src/icons/ruler.png`} alt="Ruler" />
      </button>
      <button className="toggle-markers-button" onClick={toggleIconPath}>
        <img src={`${process.env.PUBLIC_URL}/src/icons/symbolTypeSelector.png`} alt="Toggle Markers" />
      </button>
      <button className="map-information-button" onClick={toggleMapInfo}>
        <p>Tietoa</p>
      </button>
      {showMapInfo && <MapInformation onClose={toggleMapInfo} />}
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
