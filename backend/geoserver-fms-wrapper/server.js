const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const fmsRoutes = require('./routes/fms');
const systemoverviewRoutes = require('./routes/systemoverview'); 
const setupWebSocket = require('./socket');

const app = express();
const server = http.createServer(app);
setupWebSocket(server);


app.use(cors());
app.use(express.json());


app.use('/api/fms', fmsRoutes);
app.use('/api/systemoverview', systemoverviewRoutes); 


mongoose.connect('mongodb://65.1.101.129:27017/geoserver_fms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
  server.listen(3000, '0.0.0.0', () => console.log('🚀 Server running on http://65.1.101.129:3000'));
}).catch(console.error);
