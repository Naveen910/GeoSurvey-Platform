import { useEffect, useState } from 'react';
import axios from 'axios';
import { WMSTileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import pinIcon from '../../assets/pin.png';
import greenPinIcon from '../../assets/greenpin.png'; // new green pin

// Default marker
const customIcon = new L.Icon({
  iconUrl: pinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Completed marker
const completedIcon = new L.Icon({
  iconUrl: greenPinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const FeatureOverlay = ({ onFeatureClick, onFeaturesLoaded }) => {
  const [features, setFeatures] = useState([]);
  const [config, setConfig] = useState(null);
  const [featureStatus, setFeatureStatus] = useState({}); // store status mapping

  // Fetch GeoServer config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('/api/geoserver-config');
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Fetch WFS features
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
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to fetch WFS features:', err);
      }
    };

    fetchFeatures();

    return () => { cancelled = true; };
  }, [config, onFeaturesLoaded]);

  // Fetch feature status from backend
  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const res = await axios.get('/api/fms/status');
        const statusMap = {};
        res.data.forEach(f => {
          statusMap[f.id] = f.status; // f.id = featureID
        });
        setFeatureStatus(statusMap);
      } catch (err) {
        console.error('Failed to fetch feature status:', err);
      }
    };
    fetchFeatureStatus();
  }, []);

  const handleEachFeature = (feature, layer) => {
    layer.on({ click: () => onFeatureClick?.(feature.id) });
    layer.bindTooltip(feature.id || 'Feature');
  };

  if (!config) return null;

  const wmsLayer = config.wms?.layers?.[0];
  const wmsUrl = `${config.geoserverUrl}${config.wms.endpoint}`;

  return (
    <>
      <WMSTileLayer
        url={wmsUrl}
        layers={wmsLayer.name}
        format="image/png"
        transparent={true}
        version="1.1.0"
        attribution="&copy; GeoServer"
      />

      {features.length > 0 && (
        <GeoJSON
          data={features}
          onEachFeature={handleEachFeature}
          pointToLayer={(feature, latlng) => {
            const status = featureStatus[feature.id];
            const icon = status?.toLowerCase() === 'completed' ? completedIcon : customIcon;
            return L.marker(latlng, { icon });
          }}
        />
      )}
    </>
  );
};

export default FeatureOverlay;
