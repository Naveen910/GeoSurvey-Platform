import { useEffect, useState } from 'react';
import axios from 'axios';
import { WMSTileLayer, GeoJSON } from 'react-leaflet';

const FeatureOverlay = ({ onFeatureClick, onFeaturesLoaded }) => {
  const [features, setFeatures] = useState([]);
  const [config, setConfig] = useState(null);

  // Fetch config once
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

  // Fetch WFS features once after config loads
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
          onFeaturesLoaded?.(feats); // send features to MapMain
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to fetch WFS features:', err);
      }
    };

    fetchFeatures();

    return () => { cancelled = true; }; // cleanup on unmount
  }, [config, onFeaturesLoaded]);

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
        <GeoJSON data={features} onEachFeature={handleEachFeature} />
      )}
    </>
  );
};

export default FeatureOverlay;
