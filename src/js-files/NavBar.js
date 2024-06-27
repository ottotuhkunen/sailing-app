import React, { useState } from 'react';
import '../App.css';

const NavBar = ({ map }) => {
  const [buttonStates, setButtonStates] = useState({
    toggleTurvalaitteetButton: true,
    toggleVaylatButton: true,
    toggleValosektorit: true,
    toggleReittiButton: true,
    toggleLiikenneButton: true,
  });

  const toggleLayer = (layerPrefix, buttonId) => {
    if (!map) return;

    let newVisibility = 'none';
    map.getStyle().layers.forEach((layer) => {
      if (layer.id.startsWith(layerPrefix)) {
        const visibility = map.getLayoutProperty(layer.id, 'visibility');
        newVisibility = (visibility === 'visible' || visibility === undefined) ? 'none' : 'visible';
        map.setLayoutProperty(layer.id, 'visibility', newVisibility);
      }
    });

    setButtonStates((prevStates) => ({
      ...prevStates,
      [buttonId]: newVisibility == 'visible'
    }));
  };

  return (
    <div className="nav-bar">
      <button
        id='toggleTurvalaitteetButton'
        className={`nav-button ${buttonStates.toggleTurvalaitteetButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('turvalaitteet-layer', 'toggleTurvalaitteetButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon1.png`} alt={`Viitat`} className="nav-icon" />
      </button>
      <button
        id='toggleVaylatButton'
        className={`nav-button ${buttonStates.toggleVaylatButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('vayla', 'toggleVaylatButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon3.png`} alt={`Väylät`} className="nav-icon" />
      </button>
      <button
        id='toggleValosektorit'
        className={`nav-button ${buttonStates.toggleValosektorit ? '' : 'inactiveButton'}`}
        onClick={() => {
          toggleLayer('valosektorit', 'toggleValosektorit');
          toggleLayer('taululinjat', 'toggleValosektorit');
        }}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/sektoriloisto.png`} alt={`Sektorit`} className="nav-icon" />
      </button>
      <button
        id='toggleReittiButton'
        className={`nav-button ${buttonStates.toggleReittiButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('race', '', 'toggleReittiButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon5.png`} alt={`Reitti`} className="nav-icon" />
      </button>
      <button
        id='toggleLiikenneButton'
        className={`nav-button ${buttonStates.toggleLiikenneButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('liikenne', 'toggleLiikenneButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon2.png`} alt={`Liikenne`} className="nav-icon" />
      </button>
      <button
        id='toggleWeatherButton'
        className={`nav-button ${buttonStates.toggleWeatherButton ? '' : 'inactiveButton'}`}
        onClick={() => toggleLayer('weather', 'toggleWeatherButton')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon6.png`} alt={`Sää`} className="nav-icon" />
      </button>
    </div>
  );
};

export default NavBar;
