import React, { useEffect, useState } from 'react';
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
import GeoServerLayer from '../../components/MapViewer/GeoServerLayer';

import zoomInIcon from '../../assets/MapViewer/zoomin.png';
import zoomOutIcon from '../../assets/MapViewer/zoomout.png';
import locateIcon from '../../assets/MapViewer/locate.png';
import geoIcon from '../../assets/geo.png';

const tileLayers = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  topographic: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const createGeoIcon = () =>
  L.icon({
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

const MapControls = ({ setLatLngZoom, setUserLocation, setClickedLocation }) => {
  const map = useMap();

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();
  const locate = () => map.locate({ setView: true, maxZoom: 16 });

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

      setUserLocation(null);
      setClickedLocation({ lat, lng });
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

    updateInfo();

    return () => {
      map.off('moveend', updateInfo);
      map.off('click', handleMapClick);
      map.off('locationfound', handleLocationFound);
    };
  }, [map, setLatLngZoom, setUserLocation, setClickedLocation]);

  return (
    <div className="map-controls">
      <button onClick={zoomIn}><img src={zoomInIcon} alt="Zoom In" /></button>
      <button onClick={zoomOut}><img src={zoomOutIcon} alt="Zoom Out" /></button>
      <button onClick={locate}><img src={locateIcon} alt="Locate Me" /></button>
    </div>
  );
};


const ClickPopup = ({ clickedLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!clickedLocation) return;

    const { lat, lng } = clickedLocation;

    const popup = L.popup()
      .setLatLng([lat, lng])
      .setContent(`
        <div style="font-size: 13px">
          <strong>Clicked Location</strong><br/>
          Lat: ${lat.toFixed(4)}<br/>
          Lng: ${lng.toFixed(4)}<br/>
          <button style="
            margin-top: 6px;
            padding: 4px 8px;
            font-size: 13px;
            background: #2196f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          "
          onclick="window.open('https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}', '_blank')"
          >
            Open Street View
          </button>
        </div>
      `);

    popup.openOn(map);

    return () => {
      map.closePopup(popup);
    };
  }, [clickedLocation, map]);

  return null;
};

const MapMain = ({ selectedBasemap, searchQuery }) => {
  const [latLngZoom, setLatLngZoom] = useState({
    lat: 17.4021,
    lng: 78.4867,
    zoom: 14,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);

  const geoIconInstance = createGeoIcon();

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

        {/* ✅ Show popup directly on click */}
        {clickedLocation && <ClickPopup clickedLocation={clickedLocation} />}

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={geoIconInstance}>
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
  );
};

export default MapMain;
