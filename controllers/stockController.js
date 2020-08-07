const axios = require('axios');
const config = require('config');

const baseUrl = 'https://finnhub.io/api/v1/';
const token = config.get('finnHubApiKey');

const showStockInformation = (req, res) => {
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
        data.push(r.data);
      });
      const [company, price] = data;
      res.render('stock', {
        title: ticker + ': ' + company.name,
        company,
        price,
      });
    })
    .catch((error) => console.log('Something went wrong:', error));
};

module.exports = { showStockInformation };
