// routes/distanceMatrix.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

require('dotenv').config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// POST /api/distance-matrix
router.post('/', async (req, res) => {
  try {
    const { origins, destinations } = req.body;
    if (!origins || !destinations) {
      return res.status(400).json({ error: 'Missing origins or destinations' });
    }

    const params = new URLSearchParams({
      origins: origins.join('|'),
      destinations: destinations.join('|'),
      key: GOOGLE_API_KEY,
      mode: 'driving'
    });

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching Distance Matrix:', err.message);
    res.status(500).json({ error: 'Failed to fetch distance data' });
  }
});

module.exports = router;
