const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEOSERVER_URL = '/geoserver/rest';
const auth = {
  username: 'admin',
  password: 'geoserver',
};

// Helper to extract metric value by name + optional identifier
const getMetricValue = (metrics, name, identifier = null) => {
  const metric = metrics.find(
    (m) => m.name === name && (identifier === null || m.identifier === identifier)
  );
  return metric?.available ? metric.value : 'N/A';
};

// Helper to convert bytes to GB with 2 decimal points
const bytesToGB = (bytes) => {
  const gb = parseFloat(bytes) / (1024 ** 3);
  return isNaN(gb) ? 'N/A' : `${gb.toFixed(2)} GB`;
};

// Helper to format percentage with 2 decimals
const formatPercentage = (value) => {
  const percent = parseFloat(value);
  return isNaN(percent) ? 'N/A' : `${percent.toFixed(2)}%`;
};

router.get('/overview', async (req, res) => {
  try {
    const [workspaces, layers, systemStatus] = await Promise.all([
      axios.get(`${GEOSERVER_URL}/workspaces.json`, { auth }),
      axios.get(`${GEOSERVER_URL}/layers.json`, { auth }),
      axios.get(`${GEOSERVER_URL}/about/system-status.json`, { auth }),
    ]);

    const totalLayers = layers?.data?.layers?.layer?.length || 0;
    const metrics = systemStatus?.data?.metrics?.metric || [];

    // Fetch raw values
    const memoryUsageRaw = getMetricValue(metrics, 'GEOSERVER_JVM_MEMORY_USAGE');
    const freeSpaceRaw = getMetricValue(metrics, 'PARTITION_FREE', '/');
    const freePhysicalMemoryRaw = getMetricValue(metrics, 'MEMORY_FREE');

    // Format with units
    const memoryUsage = memoryUsageRaw !== 'N/A' ? formatPercentage(memoryUsageRaw) : 'N/A';
    const freeSpace = freeSpaceRaw !== 'N/A' ? bytesToGB(freeSpaceRaw) : 'N/A';
    const freePhysicalMemory = freePhysicalMemoryRaw !== 'N/A' ? bytesToGB(freePhysicalMemoryRaw) : 'N/A';

    const overview = {
      totalLayers,
      memoryUsage,
      freeSpace,
      freePhysicalMemory,
    };

    res.json(overview);
  } catch (error) {
    console.error('❌ Error fetching GeoServer overview:', error.message);
    res.status(500).json({ error: 'Failed to fetch GeoServer overview' });
  }
});

module.exports = router;
