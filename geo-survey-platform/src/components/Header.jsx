import React from 'react';
import geologo from '../assets/geo.png';
import notifyIcon from '../assets/notify.png';
import settingsIcon from '../assets/settings.png';
import '../styles/header.css';

const Header = () => {
  return (
    <header className="header">
      {/* Left Section: Logo and Title */}
      <div className="header-left">
        <img src={geologo} alt="GeoSurvey Logo" className="header-logo" />
        <div>
          <h1 className="header-title">GeoSurvey Platform</h1>
          <p className="header-subtitle">Professional GIS & Survey Management</p>
        </div>
      </div>

      {/* Right Section: Notification and User */}
      <div className="header-right">
        <button className="icon-button">
          <img src={notifyIcon} alt="Notifications" className="header-icon" />
          <span className="notification-dot"></span>
        </button>

        <button className="icon-button">
          <img src={settingsIcon} alt="Settings" className="header-icon" />
        </button>

        <div className="user-info">
          <span className="user-name">John Surveyor</span>
          <div className="user-avatar">JS</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
