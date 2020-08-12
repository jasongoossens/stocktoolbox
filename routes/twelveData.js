const express = require('express');
const router = express.Router();
const config = require('config');
const axios = require('axios');

const baseUrl = 'https://api.twelvedata.com/';
const token = config.get('twelveDataApiKey');
console.log(token);
// GET /api/price/:symbol
// Get current price
// https://api.twelvedata.com/time_series?symbol=VIX&interval=1day&outputsize=253
router.get('/tw/price/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'time_series', {
      params: {
        symbol: req.params.symbol.toUpperCase(),
        interval: '1day',
        outputsize: 253,
        apikey: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

module.exports = router;
