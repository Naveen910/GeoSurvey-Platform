import React, { useState } from 'react';
import MapHeader from '../components/MapViewer/MapHeader';
import LeftPanel from '../components/MapViewer/LeftPanel';
import MapMain from '../components/MapViewer/MapMain';
import StreetViewPanel from '../components/MapViewer/StreetViewPanel';

import '../styles/MapViewer/mapviewer.css';

const MapViewer = () => {
  const [basemap, setBasemap] = useState('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [streetViewLocation, setStreetViewLocation] = useState(null); // { lat, lng }

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
  };

  const closeStreetView = () => {
    setStreetViewLocation(null);
  };

  return (
    <div className="map-viewer-page">
      <MapHeader onSearch={handleSearchQuery} />

      {/* <div className="map-viewer-body"> */}
        {/* <LeftPanel selectedBasemap={basemap} setBasemap={setBasemap} /> */}

        <div className="map-viewer-body">
          <MapMain
            selectedBasemap={basemap}
            searchQuery={searchQuery}
            setStreetViewLocation={setStreetViewLocation}
          />
          {streetViewLocation && (
            <StreetViewPanel
              lat={streetViewLocation.lat}
              lng={streetViewLocation.lng}
              onClose={closeStreetView}
            />
          )}
        </div>
      </div>
    //</div>
  );
};

export default MapViewer;
