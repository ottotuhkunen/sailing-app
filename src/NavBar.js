import React from 'react';
import './App.css';

const NavBar = ({ recenterMap }) => {

  return (
    <div className="nav-bar">
        <button id='toggleTurvalaitteetButton' className="nav-button">
          <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon1.png`} alt={`nav-icon`} className="nav-icon" />
        </button>
        <button id='toggleVaylatButton' className="nav-button">
          <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon3.png`} alt={`nav-icon`} className="nav-icon" />
        </button>
        <button id='toggleReittiButton' className="nav-button">
          <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon5.png`} alt={`nav-icon`} className="nav-icon" />
        </button>
        <button id='recenterButton' className="nav-button" onClick={recenterMap}>
          <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon4.png`} alt={`nav-icon`} className="nav-icon" />
        </button>
        <button id='presetButton' className="nav-button">
          <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon6.png`} alt={`nav-icon`} className="nav-icon" />
        </button>
        <button id='presetButton2' className="nav-button">
          <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon6.png`} alt={`nav-icon`} className="nav-icon" />
        </button>
        <button id='toggleLiikenneButton' className="nav-button">
          <img src={`${process.env.PUBLIC_URL}/src/icons/navbar/navIcon2.png`} alt={`nav-icon`} className="nav-icon" />
        </button>
    </div>
  );
};

export default NavBar;

