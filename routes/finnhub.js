const express = require('express');
const router = express.Router();
const config = require('config');
const axios = require('axios');

const baseUrl = 'https://finnhub.io/api/v1/';
const endpoint = 'stock/symbol';

let cachedTime;
let cachedData;

// GET /api/stocks/symbols
// Get all supported symbols
router.get('/symbols', (req, res) => {
  if (cachedTime && cachedTime > Date.now() - 30 * 1000) {
    return cachedData;
  }
  axios
    .get(baseUrl + endpoint, {
      params: { exchange: 'US', token: config.get('apiKey') },
    })
    .then((response) => {
      cachedData = response.data;
      cachedTime = Date.now();
      console.log(cachedData);
    })
    .catch((err) =>
      console.log('Could not connect to Finnhub API:', err.message)
    );
});

module.exports = router;
