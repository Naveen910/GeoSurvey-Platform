const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const fmsRoutes = require('./routes/fms');
const systemoverviewRoutes = require('./routes/systemoverview');
const distanceMatrixRoutes = require('./routes/distanceMatrix');

const setupWebSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));


// WebSocket setup
setupWebSocket(server);

// MongoDB connection
mongoose.connect('mongodb://65.1.101.129:27017/geoserver_fms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(console.error);

// REST API Routes
app.use('/api/fms', fmsRoutes);
app.use('/api/systemoverview', systemoverviewRoutes);
app.use('/api/distance-matrix', distanceMatrixRoutes);


// GeoServer Config API
const geoConfig = {
  geoserverUrl: '/geoserver',
  wms: {
    endpoint: '/wms',
    layers: [
      {
        name: 'gujarat:GCP_locations',
        workspace: 'gujarat',
        layer: 'GCP_locations',
      },
    ],
  },
  wfs: {
    endpoint: '/wfs',
    featureTypes: [
      {
        name: 'gujarat:GCP_locations',
        workspace: 'gujarat',
        typeName: 'GCP_locations',
      },
    ],
  }
};

app.get('/api/geoserver-config', (req, res) => {
  res.json(geoConfig);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://65.1.101.129:${PORT}`);
});
