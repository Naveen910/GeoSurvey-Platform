import React, { useState } from 'react';
import MapHeader from '../components/MapViewer/MapHeader';
import LeftPanel from '../components/MapViewer/LeftPanel';
import MapMain from '../components/MapViewer/MapMain';
import '../styles/MapViewer/mapviewer.css';

const MapViewer = () => {
  const [basemap, setBasemap] = useState('streets');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="map-viewer-page">
      <MapHeader onSearch={handleSearchQuery} />
      <div className="map-viewer-body">
        <LeftPanel selectedBasemap={basemap} setBasemap={setBasemap} />
        <MapMain selectedBasemap={basemap} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default MapViewer;
