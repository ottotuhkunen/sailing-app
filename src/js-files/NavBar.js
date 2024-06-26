import React from 'react';
import '../App.css';

const NavBar = ({ map }) => {

  const toggleLayer = (layerPrefix) => {
    if (!map) return;
  
    map.getStyle().layers.forEach((layer) => {
      if (layer.id.startsWith(layerPrefix)) {
        const visibility = map.getLayoutProperty(layer.id, 'visibility');
  
        if (visibility === 'visible' || visibility === undefined) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        } else {
          map.setLayoutProperty(layer.id, 'visibility', 'visible');
        }
      }
    });
  };
  

  return (
    <div className="nav-bar">
      <button
        id='toggleTurvalaitteetButton'
        className="nav-button"
        onClick={() => toggleLayer('turvalaitteet-layer')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon1.png`} alt={`nav-icon`} className="nav-icon" />
      </button>
      <button
        id='toggleVaylatButton'
        className="nav-button"
        onClick={() => toggleLayer('vayla')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon3.png`} alt={`nav-icon`} className="nav-icon" />
      </button>
      <button
        id='toggleValosektorit'
        className="nav-button"
        onClick={() => toggleLayer('valosektorit') + toggleLayer('taululinjat')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/sektoriloisto.png`} alt={`nav-icon`} className="nav-icon" />
      </button>
      <button
        id='toggleReittiButton'
        className="nav-button"
        onClick={() => toggleLayer('race')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon5.png`} alt={`nav-icon`} className="nav-icon" />
      </button>
  
      <button
        id='toggleLiikenneButton'
        className="nav-button"
        onClick={() => toggleLayer('liikenne')}
      >
        <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon2.png`} alt={`nav-icon`} className="nav-icon" />
      </button>
    </div>
  );
};

export default NavBar;

/*

Weather button for future:

<button id='presetButton' className="nav-button" onClick={() => toggleLayer('preset-layer')}>
  <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon6.png`} alt={`nav-icon`} className="nav-icon" />
</button>

*/