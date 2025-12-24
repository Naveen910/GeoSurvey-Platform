import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../styles/MapViewer/mapheader.css';

import loading from '../../assets/MapViewer/refresh.png';
import homeIcon from '../../assets/MapViewer/home.png';
import searchIcon from '../../assets/search.png';
import downloadIcon from '../../assets/MapViewer/download.png';

const STATIC_PASSWORD = 'atlas@123'; 
const MAX_DOWNLOADS = 2; 

const MapHeader = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [downloadType, setDownloadType] = useState(null);
  const menuRef = useRef();

  // -------------------- DOWNLOAD LIMIT --------------------
  useEffect(() => {
    const checkResetTime = () => {
      const now = new Date();
      const stored = JSON.parse(localStorage.getItem('downloadData')) || {};
      const resetTime = new Date();
      resetTime.setHours(18, 0, 0, 0); // 9 PM reset time

      if (!stored.date || new Date(stored.date) < resetTime) {
        localStorage.setItem(
          'downloadData',
          JSON.stringify({ count: 0, date: now.toISOString() })
        );
      }
    };
    checkResetTime();
  }, []);

  const canDownload = () => {
    const stored = JSON.parse(localStorage.getItem('downloadData')) || {};
    return !stored.count || stored.count < MAX_DOWNLOADS;
  };

  const incrementDownloadCount = () => {
    const stored = JSON.parse(localStorage.getItem('downloadData')) || {};
    const newCount = (stored.count || 0) + 1;
    localStorage.setItem(
      'downloadData',
      JSON.stringify({ count: newCount, date: new Date().toISOString() })
    );
  };

  // -------------------- PASSWORD CHECK --------------------
  const requestPassword = (type) => {
    if (!canDownload()) {
      toast.info('⚠️ Daily download limit reached (2 per day, resets at 6 PM)');
      return;
    }
    setDownloadType(type);
    setShowPasswordPrompt(true);
  };

  const verifyPassword = () => {
    if (passwordInput === STATIC_PASSWORD) {
      setShowPasswordPrompt(false);
      setPasswordInput('');
      handleDownload(downloadType);
    } else {
      toast.error('Incorrect password.');
    }
  };

  // -------------------- DOWNLOAD HANDLER --------------------
const handleDownload = async (type) => {
  try {
    setShowMenu(false);
    setDownloading(true);

      const downloadFile = (type) => {
      window.location.href = `/api/fms/download/download?type=${type}`;
      };

    downloadFile(type);

    incrementDownloadCount();
    toast.success(`${type.toUpperCase()} download started`);
  } catch (err) {
    console.error(err);
    toast.error('Failed to download data');
  } finally {
    setTimeout(() => setDownloading(false), 1000); }
};


  // -------------------- UI --------------------
  return (
    <div className="map-header">
      <div className="map-header-left">
        <button onClick={() => navigate('/')} className="home-button">
          <img src={homeIcon} alt="Home" className="home-icon" />
          <span className="home-text">Home</span>
        </button>
        <h2 className="title">Map Viewer</h2>
      </div>

      <div className="map-header-right">
        <div className="search-box">
          <img src={searchIcon} alt="Search" />
          <input
            type="text"
            placeholder="Search places, coordinate"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.(searchQuery)}
          />
        </div>

        {/* Download Dropdown */}
        <div className="download-wrapper" ref={menuRef}>
          {downloading ? (
            <img src={loading} alt="Loading..." className="loading-gif" title="Downloading..." />
          ) : (
            <img
              src={downloadIcon}
              alt="Download"
              className="icon-button"
              title="Download options"
              onClick={() => setShowMenu((prev) => !prev)}
              style={{ cursor: 'pointer' }}
            />
          )}

          {showMenu && !downloading && (
            <div className="download-menu">
              <button onClick={() => requestPassword('csv')}>Download CSV</button>
              <button onClick={() => requestPassword('xlsx')}>Download XLSX (ZIP)</button>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordPrompt &&
        ReactDOM.createPortal(
          <div className="modal-overlay">
            <div className="password-box">
              <h3>Enter Password</h3>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="password"
              />
              <div className="pw-actions">
                <button onClick={verifyPassword}>Confirm</button>
                <button onClick={() => setShowPasswordPrompt(false)}>Cancel</button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MapHeader;
