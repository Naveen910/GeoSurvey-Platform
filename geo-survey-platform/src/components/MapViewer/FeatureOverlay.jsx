import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import axios from 'axios';

const FeatureOverlay = ({ workspace, layerName, onFeatureClick }) => {
  
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      const wfsUrl = `http://65.1.101.129:8080/geoserver/${workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${workspace}:${layerName}&outputFormat=application/json`;
      try {
        const res = await axios.get(wfsUrl);
        setFeatures(res.data.features);
      } catch (err) {
        console.error('Failed to fetch WFS features', err);
      }
    };

    fetchFeatures();
  }, [workspace, layerName]);

  const handleEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        onFeatureClick(feature.id);
      },
    });
    layer.bindTooltip(feature.id);
  };

  return features.length ? (
    <GeoJSON data={features} onEachFeature={handleEachFeature} />
  ) : null;
};

export default FeatureOverlay;
