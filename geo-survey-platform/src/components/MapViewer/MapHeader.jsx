import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MapViewer/mapheader.css';

import homeIcon from '../../assets/MapViewer/home.png';
import searchIcon from '../../assets/search.png';
import settingsIcon from '../../assets/settings.png';
import shareIcon from '../../assets/MapViewer/share.png';
import downloadIcon from '../../assets/MapViewer/download.png';

const MapHeader = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="map-header">
      <div className="map-header-left">
        <button onClick={handleGoHome} className="home-button">
        <img src={homeIcon} alt="Home" className="home-icon" />
        <span className="home-text">Home</span>
        </button>
        <h2 className="title">Map Viewer</h2>
      </div>

      <div className="map-header-right">
        <div className="search-box">
          <img src={searchIcon} alt="Search" />
          <input type="text" placeholder="Search places, coordinate" />
        </div>
        <img src={shareIcon} alt="Share" className="icon-button" />
        <img src={downloadIcon} alt="Download" className="icon-button" />
        <img src={settingsIcon} alt="Settings" className="icon-button" />
      </div>
    </div>
  );
};

export default MapHeader;
