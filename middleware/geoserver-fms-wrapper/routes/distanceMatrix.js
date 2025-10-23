const express = require('express');
const axios = require('axios');
const router = express.Router();

require('dotenv').config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

router.post('/', async (req, res) => {
  try {
    const { origins, destinations } = req.body;
    if (!origins || !destinations || origins.length === 0 || destinations.length === 0) {
      return res.status(400).json({ error: 'Missing or empty origins/destinations' });
    }

    const params = new URLSearchParams({
      origins: origins.join('|'),
      destinations: destinations.join('|'),
      key: GOOGLE_API_KEY,
      mode: 'driving'
    });

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
    const response = await axios.get(url);

    // DEBUG: log full response
    console.log('Distance Matrix API response:', response.data);

    if (!response.data.rows || !Array.isArray(response.data.rows) || response.data.rows.length === 0) {
      return res.status(500).json({ error: 'Distance Matrix API returned no rows' });
    }

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching Distance Matrix:', err.message, err.response?.data);
    res.status(500).json({ error: 'Failed to fetch distance data', details: err.message });
  }
});

module.exports = router;
