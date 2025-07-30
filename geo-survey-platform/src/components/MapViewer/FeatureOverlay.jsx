import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import axios from 'axios';

const FeatureOverlay = ({ workspace, layerName, onFeatureClick }) => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        // Step 1: Get config from backend
        const configRes = await axios.get('http://localhost:5000/api/geoserver-config');
        const config = configRes.data;

        // Step 2: Find the matching WFS layer
        const layer = config.wfs.featureTypes.find(
          (l) => l.workspace === workspace && l.typeName === layerName
        );

        if (!layer) {
          console.warn(`Layer ${workspace}:${layerName} not found in config.`);
          return;
        }

        // Step 3: Build WFS URL
        const wfsBaseUrl = `${config.geoserverUrl}${config.wfs.endpoint}`;
        const wfsUrl = `${wfsBaseUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${workspace}:${layerName}&outputFormat=application/json`;

        // Step 4: Fetch features
        const res = await axios.get(wfsUrl);
        setFeatures(res.data.features);
      } catch (err) {
        console.error('Failed to fetch WFS features', err);
      }
    };

    fetchFeatures();
  }, [workspace, layerName]);

  // Attach click handler to each feature
  const handleEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        onFeatureClick?.(feature.id);
      },
    });
    layer.bindTooltip(feature.id);
  };

  return features.length ? (
    <GeoJSON data={features} onEachFeature={handleEachFeature} />
  ) : null;
};

export default FeatureOverlay;
