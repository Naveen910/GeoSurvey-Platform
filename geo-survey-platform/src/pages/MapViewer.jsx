import React, { useState } from 'react';
import MapHeader from '../components/MapViewer/MapHeader';
import LeftPanel from '../components/MapViewer/LeftPanel';
import MapMain from '../components/MapViewer/MapMain';
import '../styles/MapViewer/mapviewer.css' 
const MapViewer = () => {
  const [basemap, setBasemap] = useState('streets');

  return (
    <div className="map-viewer-page">
      <MapHeader />
      <div className="map-viewer-body">
        <LeftPanel selectedBasemap={basemap} setBasemap={setBasemap} />
        <MapMain selectedBasemap={basemap} /> 
      </div>
    </div>
  );
};

export default MapViewer;
