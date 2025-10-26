import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MapViewer/mapheader.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';

import homeIcon from '../../assets/MapViewer/home.png';
import searchIcon from '../../assets/search.png';
import downloadIcon from '../../assets/MapViewer/download.png';

const MapHeader = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const handleGoHome = () => navigate('/');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && typeof onSearch === 'function') {
      onSearch(searchQuery);
    }
  };

  // -------------------- DOWNLOAD HANDLER --------------------
  const handleDownload = async (type) => {
    try {
      setShowMenu(false);
      const res = await axios.get('https://65.1.101.129/api/fms/all');
      let data = res.data || [];

      // ✅ Filter only Completed forms
      data = data.filter((item) => item.formData?.status === 'Completed');

      if (!data.length) {
        alert('No completed records found.');
        return;
      }

      // Format data
      const formatted = data.map((item, i) => ({
        '#': i + 1,
        FeatureID: item.featureID || '',
        Agent: item.formData?.agent || '',
        Status: item.formData?.status || '',
        Latitude: item.formData?.newLatitude || '',
        Longitude: item.formData?.newLongitude || '',
        Altitude: item.formData?.newAltitude || '',
        CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
        UpdatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '',
        'Image Preview Links': (item.images || []).map((img, idx) => {
          try {
            const blob = b64toBlob(img, 'image/jpeg');
            const url = URL.createObjectURL(blob);
            return `Image_${idx + 1}: ${url}`;
          } catch {
            return 'Invalid Image';
          }
        }).join(', ')
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Completed FMS');

      if (type === 'xlsx') {
        const xlsBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([xlsBuffer], { type: 'application/octet-stream' }), 'Completed_FMS_Data.xlsx');
      } else if (type === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(csvBlob, 'Completed_FMS_Data.csv');
      }

      alert(`✅ Downloaded ${type.toUpperCase()} for Completed records`);
    } catch (err) {
      console.error('❌ Download error:', err);
      alert('Failed to download data.');
    }
  };

  // Helper: Convert base64 → Blob
  const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    if (!b64Data) return null;
    const base64 = b64Data.includes(',') ? b64Data.split(',')[1] : b64Data;
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: contentType });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ------------------------------------------------------------

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
          <input
            type="text"
            placeholder="Search places, coordinate"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Download Dropdown Menu */}
        <div className="download-wrapper" ref={menuRef}>
          <img
            src={downloadIcon}
            alt="Download"
            className="icon-button"
            title="Download options"
            onClick={() => setShowMenu((prev) => !prev)}
            style={{ cursor: 'pointer' }}
          />
          {showMenu && (
            <div className="download-menu">
              <button onClick={() => handleDownload('csv')}>Download CSV</button>
              <button onClick={() => handleDownload('xlsx')}>Download XLSX</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapHeader;
