const axios = require('axios');
const config = require('config');
const moment = require('moment');
const chartConfigService = require('../services/chartConfigService');
const symbolAdderService = require('../services/recentTickerService');
const c = require('config');

const baseUrl = 'https://finnhub.io/api/v1/';
const finnHubToken = process.env.FINNHUB_API_KEY || config.get('finnHubApiKey');
const twelveDataToken =
  process.env.TWELVEDATA_API_KEY || config.get('twelveDataApiKey');

const showStockInformation = (req, res) => {
  let data = [];
  const ticker = req.query.ticker.toUpperCase();
  let apiError = {
    error: false,
    message: '',
  };
  const symbolAdder = new symbolAdderService();

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
    // EMA
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          .getTime()
          .toString()
          .substr(0, 10),
        to: Date.now().toString().substr(0, 10),
        symbol: ticker,
        indicator: 'ema',
        timeperiod: 20,
        token: finnHubToken,
      },
    }), // ATR
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          .getTime()
          .toString()
          .substr(0, 10),
        to: Date.now().toString().substr(0, 10),
        symbol: ticker,
        indicator: 'atr',
        timeperiod: 10,
        token: finnHubToken,
      },
    }), // Bollinger bands
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          .getTime()
          .toString()
          .substr(0, 10),
        to: Date.now().toString().substr(0, 10),
        symbol: ticker,
        indicator: 'bbands',
        timeperiod: 20,
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

      const [company, price, chart, atrChart, bbandsChart, news] = data;
      chart['atr'] = atrChart.atr;
      chart['upperband'] = bbandsChart.upperband;
      chart['middleband'] = bbandsChart.middleband;
      chart['lowerband'] = bbandsChart.lowerband;

      if (Object.keys(company).length === 0) {
        apiError = {
          error: true,
          message: 'I encountered an error while contacting the API',
        };
        console.log('Not found: ', apiError.message);
        return res.render('stock', {
          title: 'Ticker not found',
          apiError,
        });
      } else {
        symbolAdder.addSymbolToLastViewed(ticker);
        const chartService = new chartConfigService();
        chartService.sanitizeFinnHubData(chart);
        const chartConfig = chartService.createStockConfig(company.name, -150);
        chartService.sanitizeFinnHubDataForIndicators(chart);
        const chartConfigWithIndicators = chartService.createStockConfigWithBollingerBands(
          company.name,
          -150
        );

        //res.send(configg);
        res.render('stock', {
          apiError,
          title: ticker + ': ' + company.name,
          company,
          price,
          chartConfig,
          chartConfigWithIndicators,
          news,
          recentSymbolsArray,
        });
      }
    })
    .catch((error) => console.log('Something went wrong:', error));
};

module.exports = { showStockInformation };
