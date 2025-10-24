import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { WMSTileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import pinIcon from '../../assets/pin.png';
import greenPinIcon from '../../assets/greenpin.png'; // green pin icon

// Default marker (Pending)
const defaultIcon = new L.Icon({
  iconUrl: pinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Completed marker (Green)
const completedIcon = new L.Icon({
  iconUrl: greenPinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const FeatureOverlay = ({ onFeatureClick, onFeaturesLoaded }) => {
  const [features, setFeatures] = useState([]);
  const [config, setConfig] = useState(null);
  const [featureStatus, setFeatureStatus] = useState({});
  const geoJsonRef = useRef(null);

  // --- Fetch GeoServer Config ---
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('/api/geoserver-config');
        setConfig(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch config:', err);
      }
    };
    fetchConfig();
  }, []);

  // --- Fetch WFS Features ---
  useEffect(() => {
    if (!config?.wfs?.featureTypes?.length) return;
    let cancelled = false;

    const fetchFeatures = async () => {
      const { workspace, typeName } = config.wfs.featureTypes[0];
      const wfsUrl = `${config.geoserverUrl}${config.wfs.endpoint}?service=WFS&version=1.0.0&request=GetFeature&typeName=${workspace}:${typeName}&outputFormat=application/json`;

      try {
        const res = await axios.get(wfsUrl);
        if (!cancelled) {
          const feats = (res.data.features || []).map((f) => ({
            ...f,
            name: f.properties?.Name || 'Unnamed', // Extract Name field
          }));

          setFeatures(feats);
          onFeaturesLoaded?.(feats);
        }
      } catch (err) {
        if (!cancelled) console.error('❌ Failed to fetch WFS features:', err);
      }
    };

    fetchFeatures();
    return () => {
      cancelled = true;
    };
  }, [config, onFeaturesLoaded]);

  // --- Fetch Feature Status (live updates every few seconds) ---
  useEffect(() => {
    let cancelled = false;

    const fetchFeatureStatus = async () => {
      try {
        const res = await axios.get('/api/fms/status');
        if (cancelled) return;

        const statusMap = {};
        res.data.forEach((f) => {
          const cleanId = f.id.includes(':') ? f.id.split(':')[1] : f.id;
          statusMap[cleanId] = f.status;
        });

        setFeatureStatus(statusMap);
      } catch (err) {
        console.error('❌ Failed to fetch feature status:', err);
      }
    };

    fetchFeatureStatus();
    const interval = setInterval(fetchFeatureStatus, 2000); // every 2s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // --- Update marker icons live when status changes ---
  useEffect(() => {
    if (!geoJsonRef.current) return;

    geoJsonRef.current.eachLayer((layer) => {
      const feature = layer.feature;
      if (!feature?.properties?.Name) return;

      const featureName = feature.properties.Name;
    const status = featureStatus[featureName];
    const icon = (status === 'Completed' && completedIcon) || defaultIcon;

    if (layer.setIcon) layer.setIcon(icon);
  });
}, [featureStatus]);

  // --- Handle feature click ---
  const handleEachFeature = (feature, layer) => {
  const featureName = feature.properties?.Name || 'Unnamed';
  layer.bindTooltip(featureName, { direction: 'top' });
  layer.on({ click: () => onFeatureClick?.(featureName) });
};

  if (!config) return null;

  const wmsLayer = config.wms?.layers?.[0];
  const wmsUrl = `${config.geoserverUrl}${config.wms.endpoint}`;

  return (
    <>
      {/* Base WMS Layer */}
      <WMSTileLayer
        url={wmsUrl}
        layers={wmsLayer.name}
        format="image/png"
        transparent={true}
        version="1.1.0"
        attribution="&copy; GeoServer"
      />

      {/* Overlay GeoJSON Features */}
      {features.length > 0 && (
        <GeoJSON
          ref={geoJsonRef}
          data={features}
          onEachFeature={handleEachFeature}
          pointToLayer={(feature, latlng) => {
  const featureName = feature.properties?.Name;
  const status = featureStatus[featureName];
  const icon = (status === 'Completed' && completedIcon) || defaultIcon;

  return L.marker(latlng, { icon });
}}
        />
      )}
    </>
  );
};

export default FeatureOverlay;
