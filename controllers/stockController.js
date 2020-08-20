const axios = require('axios');
const config = require('config');
const moment = require('moment');
const chartConfigService = require('../services/chartConfigService');
const symbolAdderService = require('../services/recentTickerService');

const baseUrl = 'https://finnhub.io/api/v1/';
const finnHubToken = process.env.FINNHUB_API_KEY || config.get('finnHubApiKey');
const twelveDataToken =
  process.env.TWELVEDATA_API_KEY || config.get('twelveDataApiKey');

const showStockInformation = (req, res) => {
  let data = [];
  const ticker = req.query.ticker.toUpperCase();
  const symbolAdder = new symbolAdderService();
  symbolAdder.addSymbolToLastViewed(ticker);

  Promise.all([
    axios.get(baseUrl + 'stock/profile2', {
      params: {
        symbol: ticker,
        token: finnHubToken,
      },
    }),
    axios.get(baseUrl + 'quote', {
      params: {
        symbol: ticker,
        token: finnHubToken,
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
        token: finnHubToken,
      },
    }),
    axios.get(baseUrl + 'company-news/', {
      params: {
        symbol: ticker,
        from: moment().subtract(1, 'years').format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        token: finnHubToken,
      },
    }),
  ])
    .then((response) => {
      response.map((r) => {
        data.push(r.data);
      });

      const [company, price, chart, news] = data;
      console.log(company);
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
