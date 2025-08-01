import { useEffect, useState } from 'react';
import axios from 'axios';
import { WMSTileLayer, GeoJSON } from 'react-leaflet';

const FeatureOverlay = ({ onFeatureClick }) => {
  const [features, setFeatures] = useState([]);
  const [config, setConfig] = useState(null);

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://65.1.101.129:5000/api/geoserver-config');
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Fetch WFS features
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!config?.wfs?.featureTypes?.length) return;

      const { workspace, typeName } = config.wfs.featureTypes[0];
      const wfsUrl = `${config.geoserverUrl}${config.wfs.endpoint}?service=WFS&version=1.0.0&request=GetFeature&typeName=${workspace}:${typeName}&outputFormat=application/json`;

      try {
        const res = await axios.get(wfsUrl);
        setFeatures(res.data.features || []);
      } catch (err) {
        console.error('Failed to fetch WFS features:', err);
      }
    };

    fetchFeatures();
  }, [config]);

  // Event handler
  const handleEachFeature = (feature, layer) => {
    layer.on({
      click: () => onFeatureClick?.(feature.id),
    });
    layer.bindTooltip(feature.id || 'Feature');
  };

  // Early return
  if (!config) return null;

  const wmsLayer = config.wms?.layers?.[0];
  const wmsUrl = `${config.geoserverUrl}${config.wms.endpoint}`;

  return (
    <>
      {/* WMS */}
      <WMSTileLayer
        url={wmsUrl}
        layers={wmsLayer.name}
        format="image/png"
        transparent={true}
        version="1.1.0"
        attribution="&copy; GeoServer"
      />

      {/* WFS */}
      {features.length > 0 && (
        <GeoJSON data={features} onEachFeature={handleEachFeature} />
      )}
    </>
  );
};

export default FeatureOverlay;
