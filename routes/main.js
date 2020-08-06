const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');

const baseUrl = 'https://finnhub.io/api/v1/';

router.get('/', (req, res) => {
  let data = [];
  Promise.all([
    axios.get(baseUrl + 'stock/profile2', {
      params: {
        symbol: 'tsla',
        token: config.get('finnHubApiKey'),
      },
    }),
    axios.get(baseUrl + 'stock/metric', {
      params: {
        symbol: 'tsla',
        metric: 'all',
        token: config.get('finnHubApiKey'),
      },
    }),
  ])
    .then((response) => {
      response.map((r, i) => {
        console.log(`Data is ${i}:`, r.data);
        data.push(r.data);
      });
      res.render('index', { title: 'Index', data });
    })
    .catch((error) => console.log('Something went wrong:', error));
});

module.exports = router;
