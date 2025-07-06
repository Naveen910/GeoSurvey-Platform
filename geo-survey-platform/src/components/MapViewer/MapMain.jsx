import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapViewer/mapmain.css';

const tileLayers = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  topographic: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const MapMain = ({ selectedBasemap }) => {
  return (
    <div className="map-main">
      <MapContainer center={[17.385044, 78.486671]} zoom={13} scrollWheelZoom={true}>
        <TileLayer url={tileLayers[selectedBasemap]} />
      </MapContainer>
    </div>
  );
};

export default MapMain;
