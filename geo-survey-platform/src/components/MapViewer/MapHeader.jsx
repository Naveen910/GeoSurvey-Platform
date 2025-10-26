import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MapViewer/mapheader.css';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import axios from 'axios';

import loading from '../../assets/MapViewer/refresh.png';
import homeIcon from '../../assets/MapViewer/home.png';
import searchIcon from '../../assets/search.png';
import downloadIcon from '../../assets/MapViewer/download.png';

const MapHeader = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
    setDownloading(true);

    const res = await axios.get('/api/fms/all');
    let data = res.data || [];

    // Only Completed forms
    data = data.filter((item) => item.formData?.status === 'Completed');

    if (!data.length) {
      alert('No completed records found.');
      setDownloading(false);
      return;
    }

    // Helper: base64 → Uint8Array
    const base64ToUint8Array = (base64) => {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      return bytes;
    };

    if (type === 'csv') {
      const csvData = data.map((item, i) => ({
        '#': i + 1,
        Feature_ID: item.featureID || '',
        Agent_Name: item.formData?.agent || '',
        Status: item.formData?.status || '',
        New_Latitude: item.formData?.newLatitude || '',
        New_Longitude: item.formData?.newLongitude || '',
        New_Altitude: item.formData?.newAltitude || '',
        Secondary_Point: item.formData?.secondaryPoint || '',
        Corner_Point: item.formData?.cornerPoint || '',
        Remarks: item.formData?.remarks || '',
        CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
        UpdatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '',
      }));

      const ws = XLSX.utils.json_to_sheet(csvData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'Completed_FMS_Data.csv');
    }

    if (type === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Completed FMS');

      // Columns
      const baseColumns = [
        { header: '#', key: 'sno', width: 6, center: true, alignment: { vertical: 'center' } },
        { header: 'Feature ID', key: 'featureID', width: 15, center: true, alignment: { vertical: 'center' } },
        { header: 'Agent Name', key: 'agent', width: 20, center: true, alignment: { vertical: 'center' } },
        { header: 'Status', key: 'status', width: 12, center: true, alignment: { vertical: 'center' } },
        { header: 'New Latitude', key: 'lat', width: 15, center: true, alignment: { vertical: 'center' } },
        { header: 'New Longitude', key: 'lon', width: 15, center: true, alignment: { vertical: 'center' } },
        { header: 'New Altitude', key: 'alt', width: 15, center: true, alignment: { vertical: 'center' } },
        { header: 'Secondary Point', key: 'secondaryPoint', width: 15, center: true, alignment: { vertical: 'center' } },
        { header: 'Corner Point', key: 'cornerPoint', width: 12, center: true, alignment: { vertical: 'center' } },
        { header: 'Remarks', key: 'remarks', width: 25, center: true, alignment: { vertical: 'center' } },
        { header: 'Created At', key: 'createdAt', width: 25, center: true, alignment: { vertical: 'center' } },
        { header: 'Updated At', key: 'updatedAt', width: 25, center: true, alignment: { vertical: 'center' } },
      ];

      // Add 5 image columns
      for (let j = 1; j <= 5; j++) {
        baseColumns.push({ header: `Image ${j}`, key: `img${j}`, width: 15, center: true, alignment: { vertical: 'center' } });
      }

      sheet.columns = baseColumns;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const rowIndex = i + 2; // row 1 = header

        const rowValues = {
          sno: i + 1,
          featureID: item.featureID || '',
          agent: item.formData?.agent || '',
          status: item.formData?.status || '',
          lat: item.formData?.newLatitude || '',
          lon: item.formData?.newLongitude || '',
          alt: item.formData?.newAltitude || '',
          secondaryPoint: item.formData?.secondaryPoint || '',
          cornerPoint: item.formData?.cornerPoint || '',
          remarks: item.formData?.remarks || '',
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '',
        };

        sheet.addRow(rowValues);

        const images = item.formData?.images || [];
        images.slice(0, 5).forEach((img, idx) => {
          const base64Data = img.includes(',') ? img.split(',')[1] : img;
          const ext = img.includes('png') ? 'png' : 'jpeg';
          const imageUint8 = base64ToUint8Array(base64Data);

          const imageId = workbook.addImage({
            buffer: imageUint8,
            extension: ext,
          });

          sheet.addImage(imageId, {
            tl: { col: 12 + idx, row: rowIndex - 1 },
            ext: { width: 70, height: 70 },
          });
        });

        sheet.getRow(rowIndex).height = 80;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'Completed_FMS_Data.xlsx');
    }

    alert(`✅ ${type.toUpperCase()} downloaded successfully.`);
  } catch (err) {
    console.error('❌ Download error:', err);
    alert('Failed to download data.');
  } finally {
    setDownloading(false);
  }
};


  // -------------------- OUTSIDE CLICK CLOSE --------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Download Dropdown */}
        <div className="download-wrapper" ref={menuRef}>
        {downloading ? (
  <img
    src={loading}
    alt="Loading..."
    className="loading-gif"
    title="Downloading..."
  />
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
