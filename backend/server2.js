
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Replace with your actual GeoServer WFS endpoint and layer
const GEOSERVER_WFS_URL = 'http://65.1.101.129:8080/geoserver/wfs';
const LAYER_NAME = 'topp:states'; // e.g., 'survey:sites'

/**
 * Step 1: Get lat/lon from GeoServer using WFS
 */
async function getLatLonFromGeoServer(featureId) {
  const url = `${GEOSERVER_WFS_URL}?service=WFS&version=1.0.0&request=GetFeature&typeName=${LAYER_NAME}&outputFormat=application/json&cql_filter=id='${featureId}'`;

  const response = await axios.get(url);
  const features = response.data.features;

  if (!features || features.length === 0) {
    throw new Error('Feature not found');
  }

  const geometry = features[0].geometry;
  const coords = geometry.type === 'Point'
    ? geometry.coordinates
    : geometry.type === 'Polygon'
      ? getPolygonCentroid(geometry.coordinates[0])
      : null;

  if (!coords) {
    throw new Error('Unsupported geometry type');
  }

  return coords; // [lon, lat]
}



app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
