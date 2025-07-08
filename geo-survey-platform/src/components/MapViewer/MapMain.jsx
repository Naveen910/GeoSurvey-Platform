import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapViewer/mapmain.css';
import GeoServerLayer from '../../components/MapViewer/GeoServerLayer';

import zoomInIcon from '../../assets/MapViewer/zoomin.png';
import zoomOutIcon from '../../assets/MapViewer/zoomout.png';
import locateIcon from '../../assets/MapViewer/locate.png';
import refreshIcon from '../../assets/MapViewer/refresh.png';

const tileLayers = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  topographic: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};





const MapControls = ({ setLatLngZoom }) => {
  const map = useMap();

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();
  const locate = () => map.locate({ setView: true, maxZoom: 16 });
  const refresh = () => {
    const current = map.getCenter();
    const zoom = map.getZoom();
    map.setView(current, zoom);
  };

  useEffect(() => {
    const updateInfo = () => {
      const center = map.getCenter();
      setLatLngZoom({
        lat: center.lat.toFixed(4),
        lng: center.lng.toFixed(4),
        zoom: map.getZoom(),
      });
    };

    map.on('moveend', updateInfo);
    updateInfo();
    return () => map.off('moveend', updateInfo);

  }, [map, setLatLngZoom]);


  return (
    <div className="map-controls">
      <button onClick={zoomIn}><img src={zoomInIcon} alt="Zoom In" /></button>
      <button onClick={zoomOut}><img src={zoomOutIcon} alt="Zoom Out" /></button>
      <button onClick={locate}><img src={locateIcon} alt="Locate Me" /></button>
      <button onClick={refresh}><img src={refreshIcon} alt="Refresh" /></button>
    </div>
  );
};

const MapMain = ({ selectedBasemap }) => {
  const [latLngZoom, setLatLngZoom] = useState({
    lat: 17.3850,
    lng: 78.4867,
    zoom: 13,
  });

//Backend Config
const [geoConfig, setGeoConfig] = useState(null);
const [visibleLayers, setVisibleLayers] = useState({});

//Fetch Layer Config from Backend
useEffect(() => {
  fetch('http://localhost:5000/api/geoserver-config')
    .then(res => res.json())
    .then(data => {
      setGeoConfig(data);

      const initialVisibility = {};
      data.layers.forEach(l => {
        initialVisibility[`${l.workspace}:${l.layer}`] = true;
      });
      setVisibleLayers(initialVisibility);
    })
    .catch(err => console.error('Failed to fetch GeoServer config', err));
}, []);

  return (
    <div className="map-main">
      <MapContainer
          center={[latLngZoom.lat, latLngZoom.lng]}
          zoom={latLngZoom.zoom}
          scrollWheelZoom
          zoomControl={false} // Disable default zoom
          style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={tileLayers[selectedBasemap]} />

        {/* Render the GeoServerLayer */}
        {geoConfig?.layers.map((layers, idx) => (
          <GeoServerLayer
            key={idx}
            geoserverUrl={geoConfig.geoserverUrl}
            workspace={layers.workspace}
            layerName={layers.layer}
            visible={visibleLayers[`${layers.workspace}:${layers.layer}`]}
          />
        ))} 

        <ScaleControl position="bottomleft" />
        <MapControls setLatLngZoom={setLatLngZoom} />
      </MapContainer>

      {/* Bottom Right Info Box */}
      <div className="map-info-box">
        <div>
          Lat: {latLngZoom.lat}°, Lng: {latLngZoom.lng}°
        </div>
        <div>Zoom: {latLngZoom.zoom}</div>
      </div>

    </div>
  );
};

export default MapMain;
