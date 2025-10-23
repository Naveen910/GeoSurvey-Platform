import { useEffect, useState } from 'react';
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
  const [featureStatus, setFeatureStatus] = useState({}); // status map

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
          const feats = res.data.features || [];
          setFeatures(feats);
          onFeaturesLoaded?.(feats);
          console.log(`✅ Loaded ${feats.length} WFS features`);
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

  // --- Fetch Feature Status ---
  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const res = await axios.get('/api/fms/status');
        const statusMap = {};

        // Map ID → status
        res.data.forEach((f) => {
          // Normalize ID (strip workspace if present)
          const cleanId = f.id.includes(':') ? f.id.split(':')[1] : f.id;
          statusMap[cleanId] = f.status;
        });

        setFeatureStatus(statusMap);
      } catch (err) {
      }
    };
    fetchFeatureStatus();
  }, []);

  // --- Handle feature click ---
  const handleEachFeature = (feature, layer) => {
    layer.on({ click: () => onFeatureClick?.(feature.id) });
    layer.bindTooltip(feature.id || 'Feature');
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
          data={features}
          onEachFeature={handleEachFeature}
          pointToLayer={(feature, latlng) => {
            // Normalize feature.id (remove workspace prefix)
            const cleanId = feature.id.includes(':')
              ? feature.id.split(':')[1]
              : feature.id;

            const status = featureStatus[cleanId];

            const icon = (status === 'Completed' && completedIcon) || defaultIcon;

            return L.marker(latlng, { icon });
          }}
        />
      )}
    </>
  );
};

export default FeatureOverlay;
