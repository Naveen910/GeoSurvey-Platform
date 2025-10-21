import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  ScaleControl,
  Marker,
  Popup,
  Circle,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapViewer/mapmain.css';
import FeatureOverlay from '../../components/MapViewer/FeatureOverlay';
import FmsPanel from '../../components/MapViewer/FmsPanel';
import NearestRoutesPanel from '../../components/MapViewer/NearestRoutesPanel';


import zoomInIcon from '../../assets/MapViewer/zoomin.png';
import zoomOutIcon from '../../assets/MapViewer/zoomout.png';
import locateIcon from '../../assets/MapViewer/locate.png';
import geoIcon from '../../assets/MapViewer/geopointer.png';

const tileLayers = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  topographic: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const createGeoIcon = () =>
  L.icon({
    iconUrl: geoIcon,
    iconSize: [24, 26],
    iconAnchor: [12, 24],
  });

const MapUpdater = ({ lat, lng, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
};

const MapControls = ({ setLatLngZoom, setUserLocation, setClickedLocation }) => {
  const map = useMap();
  const controlRef = useRef();

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();
  const locate = () => map.locate({ setView: true, maxZoom: 16 });

  useEffect(() => {
    if (controlRef.current) {
      L.DomEvent.disableClickPropagation(controlRef.current);
      L.DomEvent.disableScrollPropagation(controlRef.current);
    }

    const updateInfo = () => {
      const center = map.getCenter();
      setLatLngZoom({
        lat: center.lat.toFixed(4),
        lng: center.lng.toFixed(4),
        zoom: map.getZoom(),
      });
    };

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      setLatLngZoom(prev => ({ ...prev, lat: lat.toFixed(4), lng: lng.toFixed(4) }));
      setUserLocation(null);
      setClickedLocation({ lat, lng });
    };

    const handleLocationFound = (e) => {
      const { lat, lng } = e.latlng;
      setUserLocation({ lat, lng });
      setLatLngZoom(prev => ({ ...prev, lat: lat.toFixed(4), lng: lng.toFixed(4) }));
    };

    map.on('moveend', updateInfo);
    map.on('click', handleMapClick);
    map.on('locationfound', handleLocationFound);
    updateInfo();

    return () => {
      map.off('moveend', updateInfo);
      map.off('click', handleMapClick);
      map.off('locationfound', handleLocationFound);
    };
  }, [map, setLatLngZoom, setUserLocation, setClickedLocation]);

  return (
    <div className="map-controls" ref={controlRef}>
      <button onClick={zoomIn}><img src={zoomInIcon} alt="Zoom In" /></button>
      <button onClick={zoomOut}><img src={zoomOutIcon} alt="Zoom Out" /></button>
      <button onClick={locate}><img src={locateIcon} alt="Locate Me" /></button>
    </div>
  );
};

const ClickPopup = ({ clickedLocation, onStreetView, setClickedLocation, geoIcon }) => {
  if (!clickedLocation) return null;
  const { lat, lng } = clickedLocation;

  return (
    <Marker position={[lat, lng]} icon={geoIcon}>
      <Popup
        position={[lat, lng]}
        offset={[0, -24]}
        onClose={() => setClickedLocation(null)}
        autoPan={true}
      >
        <div className="popup-wrapper">
          <p>Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
          <button onClick={() => onStreetView({ lat, lng })} className="popup-button">
            View Street
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

const MapMain = ({ selectedBasemap, searchQuery, setStreetViewLocation }) => {
  const [latLngZoom, setLatLngZoom] = useState({ lat: 17.4021, lng: 78.4867, zoom: 14 });
  const [userLocation, setUserLocation] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [selectedFeatureID, setSelectedFeatureID] = useState(null);
  const [wfsRoutes, setWfsRoutes] = useState([]);
  const handleFeaturesLoaded = useCallback((features) => {
  setWfsRoutes(features);
}, []);


  const geoIconInstance = useMemo(createGeoIcon, []);

  // =================== Search bar behavior ===================
  useEffect(() => {
    if (!searchQuery) return;
    const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      setLatLngZoom(prev => ({ ...prev, lat, lng }));
    } else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setLatLngZoom(prev => ({ ...prev, lat, lng }));
          } else alert('No results found');
        })
        .catch(err => console.error("Geocoding error:", err));
    }
  }, [searchQuery]);



  return (
    <div className="map-main flex">
      <div className="flex-grow relative">
        <MapContainer
          center={[latLngZoom.lat, latLngZoom.lng]}
          zoom={latLngZoom.zoom}
          scrollWheelZoom
          zoomControl={false}
          className="leaflet-container"
        >
          <TileLayer url={tileLayers[selectedBasemap]} />
          <MapUpdater lat={latLngZoom.lat} lng={latLngZoom.lng} zoom={latLngZoom.zoom} />

          {/* 🔹 WMS + WFS Layer */}
          <FeatureOverlay
            onFeatureClick={(fid) => setSelectedFeatureID(fid)}
            onFeaturesLoaded={handleFeaturesLoaded}
          />

          {/* User click popup */}
          {clickedLocation && (
            <ClickPopup
              clickedLocation={clickedLocation}
              setClickedLocation={setClickedLocation}
              onStreetView={setStreetViewLocation}
              geoIcon={geoIconInstance}
            />
          )}

          {/* User current location */}
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={geoIconInstance}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={30}
                pathOptions={{ fillColor: '#2196f3', color: '#2196f3', fillOpacity: 0.2 }}
              />
            </>
          )}

          {/* 🔹 Nearest WFS routes panel */}
          <NearestRoutesPanel
  wfsFeatures={wfsRoutes}
  userLocation={userLocation}
/>

          <ScaleControl position="bottomleft" />
          <MapControls
            setLatLngZoom={setLatLngZoom}
            setUserLocation={setUserLocation}
            setClickedLocation={setClickedLocation}
          />
        </MapContainer>

        <div className="map-info-box">
          <div>Lat: {latLngZoom.lat}°, Lng: {latLngZoom.lng}°</div>
          <div>Zoom: {latLngZoom.zoom}</div>
        </div>
      </div>

      {selectedFeatureID && (
        <FmsPanel featureID={selectedFeatureID} onClose={() => setSelectedFeatureID(null)} />
      )}
    </div>
  );
};

export default MapMain;
