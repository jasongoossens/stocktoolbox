const express = require('express');
const config = require('config');
const axios = require('axios');

const server = express();

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

// supported symbols call
const baseUrl = 'https://finnhub.io/api/v1/';
const endpoint = 'stock/symbol';

try {
  axios
    .get(baseUrl + endpoint, {
      params: { exchange: 'US', token: config.get('apiKey') },
    })
    .then((response) => console.log(response));
} catch (error) {
  console.log(error);
}
