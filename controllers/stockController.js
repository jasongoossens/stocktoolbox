const axios = require('axios');
const config = require('config');
const chartConfigService = require('../services/chartConfigService');
const symbolAdderService = require('../services/recentTickerService');

const baseUrl = 'https://finnhub.io/api/v1/';
const token = config.get('finnHubApiKey');

const showStockInformation = (req, res) => {
  let data = [];
  const ticker = req.query.ticker.toUpperCase();
  const symbolAdder = new symbolAdderService();
  symbolAdder.addSymbolToLastViewed(ticker);

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
    axios.get(baseUrl + 'stock/candle', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          .getTime()
          .toString()
          .substr(0, 10),
        to: Date.now().toString().substr(0, 10),
        symbol: ticker,
        token: token,
      },
    }),
    axios.get(baseUrl + 'company-news/', {
      params: {
        symbol: ticker,
        from: new Date(
          new Date().setFullYear(new Date().getFullYear() - 1)
        ).toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        to: new Date().toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        token: token,
      },
    }),
  ])
    .then((response) => {
      response.map((r) => {
        console.log(r);
        data.push(r.data);
      });

      const [company, price, chart, news] = data;

      const chartService = new chartConfigService();
      chartService.sanitizeFinnHubData(chart);
      const chartConfig = chartService.createStockConfig(company.name, -150);

      res.render('stock', {
        title: ticker + ': ' + company.name,
        company,
        price,
        chartConfig,
        news,
        recentSymbolsArray,
      });
    })
    .catch((error) => console.log('Something went wrong:', error));
};

module.exports = { showStockInformation };
