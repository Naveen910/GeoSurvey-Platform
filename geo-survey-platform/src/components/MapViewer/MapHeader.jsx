import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MapViewer/mapheader.css';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
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

      const base64ToUint8Array = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
      };

      // -------------------- CSV DOWNLOAD --------------------
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

      // -------------------- XLSX DOWNLOAD (CHUNKED + ZIP) --------------------
      if (type === 'xlsx') {
  const zip = new JSZip();
  const chunkSize = 25;

  for (let start = 0; start < data.length; start += chunkSize) {
    const chunk = data.slice(start, start + chunkSize);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`FMS_${start / chunkSize + 1}`);

    const baseColumns = [
      { header: '#', key: 'sno', width: 6 },
      { header: 'Feature ID', key: 'featureID', width: 15 },
      { header: 'Agent Name', key: 'agent', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'New Latitude', key: 'lat', width: 20 },
      { header: 'New Longitude', key: 'lon', width: 20 },
      { header: 'New Altitude', key: 'alt', width: 20 },
      { header: 'Secondary Point', key: 'secondaryPoint', width: 20 },
      { header: 'Corner Point', key: 'cornerPoint', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 25 },
      { header: 'Updated At', key: 'updatedAt', width: 25 },
    ];

    // Add 5 image columns
    for (let j = 1; j <= 5; j++) {
      baseColumns.push({
        header: `Image ${j}`,
        key: `img${j}`,
        width: 15,
      });
    }

    sheet.columns = baseColumns;

    const rowHeight = 80;
    const imageWidth = 80;
    const imageHeight = 80;

    // Center align header row
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).font = { bold: true };

    for (let i = 0; i < chunk.length; i++) {
      const item = chunk[i];
      const rowIndex = i + 2;

      const rowValues = {
        sno: start + i + 1,
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

      const newRow = sheet.addRow(rowValues);
      newRow.height = rowHeight;

      // Center-align all cells in this row
      newRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });

      const images = item.formData?.images || [];
      images.slice(0, 5).forEach((img, idx) => {
        try {
          const base64Data = img.includes(',') ? img.split(',')[1] : img;
          const ext = img.includes('png') ? 'png' : 'jpeg';
          const imageUint8 = base64ToUint8Array(base64Data);

          const imageId = workbook.addImage({
            buffer: imageUint8,
            extension: ext,
          });

          const col = 12 + idx;

          sheet.addImage(imageId, {
            tl: { col, row: rowIndex - 1 },
            ext: { width: imageWidth, height: imageHeight },
            editAs: 'oneCell',
          });
        } catch (e) {
          console.warn('Skipping image:', e);
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    zip.file(`Completed_FMS_File_${start / chunkSize + 1}.xlsx`, buffer);
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, 'Completed_FMS_Data.zip');
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
              <button onClick={() => handleDownload('xlsx')}>Download XLSX (ZIP)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapHeader;
