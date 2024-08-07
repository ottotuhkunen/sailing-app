import React, { useState } from 'react';
import '../App.css';
import { loadLiikenne } from './liikenne';
import { loadVesiliikennemerkit } from './vesiliikennemerkit'; 
import { loadHarbours } from './placeNames';

const NavBar = ({ map }) => {
  const [buttonStates, setButtonStates] = useState({
    toggleTurvalaitteetButton: true,
    toggleVaylatButton: true,
    toggleValosektorit: true,
    toggleReittiButton: true,
    toggleSoundingButton: true,
    toggleLiikenneButton: false,
    toggleLiikennemerkitButton: false,
    toggleharboursButton: false
  });

  // if toggleLiikenneButton, toggleLiikennemerkitButton or toggleharboursButton is clicked the first time 
  // (corresponding map layers are not found on mapbox)
  // then add those layers here:
  // loadLiikenne(map);
  // loadVesiliikennemerkit(map);
  // loadHarbours(map);


  const toggleLayer = (layerPrefix, buttonId) => {
    if (!map || !map.getStyle || !map.getStyle()?.layers) {
      console.error("Map style or layers are undefined");
      return;
    }
  
    let newVisibility = 'none';
  
    map.getStyle().layers.forEach((layer) => {
      if (layer.id.startsWith(layerPrefix)) {
        const visibility = map.getLayoutProperty(layer.id, 'visibility');
        newVisibility = (visibility === 'visible' || visibility === undefined) ? 'none' : 'visible';
        map.setLayoutProperty(layer.id, 'visibility', newVisibility);
      }
    });
  
    // Check if the layer exists on the map
    const layerExists = map.getStyle().layers.some(layer => layer.id.startsWith(layerPrefix));
    
    if (!layerExists) {
      switch (layerPrefix) {
        case 'liikenne':
          loadLiikenne(map);
          newVisibility = 'visible';
          break;
        case 'vesiliikennemerkit':
          loadVesiliikennemerkit(map);
          newVisibility = 'visible';
          break;
        case 'harbours':
          loadHarbours(map);
          newVisibility = 'visible';
          break;
        default:
          break;
      }
    }
      
    setButtonStates((prevStates) => ({
      ...prevStates,
      [buttonId]: newVisibility === 'visible',
    }));
  };
  

  return (
    <div className="nav-bar">
      <button
        id="toggleTurvalaitteetButton"
        className={`nav-button ${buttonStates.toggleTurvalaitteetButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('turvalaitteet-layer', 'toggleTurvalaitteetButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon1.png`} alt="Viitat" className="nav-icon" />
      </button>
      <button
        id="toggleVaylatButton"
        className={`nav-button ${buttonStates.toggleVaylatButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('vayla', 'toggleVaylatButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon3.png`} alt="Väylät" className="nav-icon" />
      </button>
      <button
        id="toggleValosektorit"
        className={`nav-button ${buttonStates.toggleValosektorit ? '' : 'inactiveButton'}`}
        onClick={() => {
          toggleLayer('valosektorit', 'toggleValosektorit');
          toggleLayer('taululinjat', 'toggleValosektorit');
        }}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/sektoriloisto.png`} alt="Sektorit" className="nav-icon" />
      </button>
      <button
        id="toggleSoundingButton"
        className={`nav-button ${buttonStates.toggleSoundingButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('sounding', 'toggleSoundingButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/depthIcon.png`} alt="Syvyys" className="nav-icon" />
      </button>
      <button
        id="toggleLiikenneButton"
        className={`nav-button ${buttonStates.toggleLiikenneButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('liikenne', 'toggleLiikenneButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon2.png`} alt="Liikenne" className="nav-icon" />
      </button>
      <button
        id="toggleLiikennemerkitButton"
        className={`nav-button ${buttonStates.toggleLiikennemerkitButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('vesiliikennemerkit', 'toggleLiikennemerkitButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/waterSigns.png`} alt="Satama" className="nav-icon" />
      </button>
      <button
        id="toggleharboursButton"
        className={`nav-button ${buttonStates.toggleharboursButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('harbours', 'toggleharboursButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/harbour.png`} alt="Satama" className="nav-icon" />
      </button>
    </div>
  );
};

export default NavBar;
