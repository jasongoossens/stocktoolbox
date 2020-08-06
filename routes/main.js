const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');
const c = require('config');

const baseUrl = 'https://finnhub.io/api/v1/';
const token = config.get('finnHubApiKey');

router.get('/', (req, res) => {
  let data = [];
  Promise.all([
    axios.get(baseUrl + 'stock/profile2', {
      params: {
        symbol: 'tsla',
        token: token,
      },
    }),
    axios.get(baseUrl + 'stock/metric', {
      params: {
        symbol: 'tsla',
        metric: 'all',
        token: token,
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

router.get('/search', (req, res) => {
  let data = [];
  const ticker = req.query.ticker.toUpperCase();
  Promise.all([
    axios.get(baseUrl + 'stock/profile2', {
      params: {
        symbol: ticker,
        token: token,
      },
    }),
    axios.get(baseUrl + 'quote', {
      params: {
        symbol: ticker,
        token: token,
      },
    }),
  ])
    .then((response) => {
      response.map((r) => {
        // data = r.data;
        data.push(r.data);
        console.log(data);
      });
      const [company, price] = data;
      console.log(company);
      res.render('search', {
        title: ticker + ': ' + company.name,
        company,
        price,
      });
    })
    .catch((error) => console.log('Something went wrong:', error));
});

module.exports = router;
