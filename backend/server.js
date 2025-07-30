const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 

const geoConfig = {
  geoserverUrl: 'http://65.1.101.129:8080/geoserver',
  wms: {
    endpoint: '/wms',
    layers: [
      {
        name: 'topp:states',
        workspace: 'topp',
        layer: 'states',
      },
    ],
  },
  wfs: {
    endpoint: '/wfs',
    featureTypes: [
      {
        name: 'topp:states',
        workspace: 'topp',
        typeName: 'states',
      },
    ],
  }
};

app.get('/api/geoserver-config', (req, res) => {
  res.json(geoConfig);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 GeoServer config API running on port ${PORT}`);
});
