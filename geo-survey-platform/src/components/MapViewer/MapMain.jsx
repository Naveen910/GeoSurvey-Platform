import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  ScaleControl,
  Marker,
  Popup,
  Circle
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapViewer/mapmain.css';
import GeoServerLayer from '../../components/MapViewer/GeoServerLayer';

import zoomInIcon from '../../assets/MapViewer/zoomin.png';
import zoomOutIcon from '../../assets/MapViewer/zoomout.png';
import locateIcon from '../../assets/MapViewer/locate.png';
//import refreshIcon from '../../assets/MapViewer/refresh.png';
import geoIcon from '../../assets/geo.png'; 


const tileLayers = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  topographic: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};


const userLocationIcon = L.icon({
  iconUrl: geoIcon,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});


const MapUpdater = ({ lat, lng, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);

  return null;
};

const MapControls = ({ setLatLngZoom, setUserLocation }) => {
  const map = useMap();

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();
  const locate = () => map.locate({ setView: true, maxZoom: 16 });
  /*const refresh = () => {
    const current = map.getCenter();
    const zoom = map.getZoom();
    map.setView(current, zoom);
  };*/

  useEffect(() => {
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
      setLatLngZoom(prev => ({
        ...prev,
        lat: lat.toFixed(4),
        lng: lng.toFixed(4),
      }));
    };

    const handleLocationFound = (e) => {
      const { lat, lng } = e.latlng;
      setUserLocation({ lat, lng });
      setLatLngZoom(prev => ({
        ...prev,
        lat: lat.toFixed(4),
        lng: lng.toFixed(4),
      }));
    };

    map.on('moveend', updateInfo);
    map.on('click', handleMapClick);
    map.on('locationfound', handleLocationFound);

    updateInfo(); // on mount

    return () => {
      map.off('moveend', updateInfo);
      map.off('click', handleMapClick);
      map.off('locationfound', handleLocationFound);
    };
  }, [map, setLatLngZoom, setUserLocation]);

  return (
    <div className="map-controls">
      <button onClick={zoomIn}><img src={zoomInIcon} alt="Zoom In" /></button>
      <button onClick={zoomOut}><img src={zoomOutIcon} alt="Zoom Out" /></button>
      <button onClick={locate}><img src={locateIcon} alt="Locate Me" /></button>
      {/* <button onClick={refresh}><img src={refreshIcon} alt="Refresh" /></button> */}
    </div>
  );
};

const MapMain = ({ selectedBasemap, searchQuery }) => {
  const [latLngZoom, setLatLngZoom] = useState({
    lat: 17.3850,
    lng: 78.4867,
    zoom: 18,
  });

  const [userLocation, setUserLocation] = useState(null);

  // Search effect
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
          } else {
            alert('No results found');
          }
        })
        .catch(err => {
          console.error("Geocoding error:", err);
        });
    }
  }, [searchQuery]);

  // GeoServer layer config
  const [geoConfig, setGeoConfig] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({});

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
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater lat={latLngZoom.lat} lng={latLngZoom.lng} zoom={latLngZoom.zoom} />
        <TileLayer url={tileLayers[selectedBasemap]} />

        {geoConfig?.layers.map((layer, idx) => (
          <GeoServerLayer
            key={idx}
            geoserverUrl={geoConfig.geoserverUrl}
            workspace={layer.workspace}
            layerName={layer.layer}
            visible={visibleLayers[`${layer.workspace}:${layer.layer}`]}
          />
        ))}

        {/* Location marker and circle */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={50}
              pathOptions={{
                fillColor: '#2196f3',
                color: '#2196f3',
                fillOpacity: 0.2,
              }}
            />
          </>
        )}

        <ScaleControl position="bottomleft" />
        <MapControls setLatLngZoom={setLatLngZoom} setUserLocation={setUserLocation} />
      </MapContainer>

      {/* Bottom Right Info Box */}
      <div className="map-info-box">
        <div>Lat: {latLngZoom.lat}°, Lng: {latLngZoom.lng}°</div>
        <div>Zoom: {latLngZoom.zoom}</div>
      </div>
    </div>
  );
};

export default MapMain;
