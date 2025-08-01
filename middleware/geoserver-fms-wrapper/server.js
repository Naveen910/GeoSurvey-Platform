const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const fmsRoutes = require('./routes/fms');
const systemoverviewRoutes = require('./routes/systemoverview');
const setupWebSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

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

// GeoServer Config API
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

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://65.1.101.129:${PORT}`);
});
