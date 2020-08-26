const axios = require('axios');
const config = require('config');
const moment = require('moment');
const chartConfigService = require('../services/chartConfigService');
const symbolAdderService = require('../services/recentTickerService');
const StockInformationService = require('../services/stockInformationService');

const baseUrl = 'https://finnhub.io/api/v1/';
const finnHubToken = process.env.FINNHUB_API_KEY || config.get('finnHubApiKey');
const twelveDataToken =
  process.env.TWELVEDATA_API_KEY || config.get('twelveDataApiKey');

const showStockInformation = (req, res) => {
  const dailyChartDays = 20;
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
    // EMA(20)
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
    }), // ATR(10)
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
    // EMA(20) hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(dailyChartDays, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'ema',
        timeperiod: 20,
        token: finnHubToken,
      },
    }), // ATR(10) hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(dailyChartDays, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'atr',
        timeperiod: 10,
        token: finnHubToken,
      },
    }), // Bollinger bands hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(dailyChartDays, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'bbands',
        timeperiod: 20,
        token: finnHubToken,
      },
    }), // Momentum hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(dailyChartDays, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'mom',
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

      const [
        company,
        dailyChart,
        dailyAtrChart,
        dailyBbandsChart,
        hourlyChart,
        hourlyAtrChart,
        hourlyBbandsChart,
        hourlyMomentumChart,
        news,
      ] = data;

      Object.keys(dailyChart).forEach((key) =>
        dailyChart[key] === undefined ? delete dailyChart[key] : {}
      );
      Object.keys(hourlyChart).forEach((key) =>
        hourlyChart[key] === undefined ? delete hourlyChart[key] : {}
      );

      dailyChart['atr'] = dailyAtrChart.atr;
      dailyChart['upperband'] = dailyBbandsChart.upperband;
      dailyChart['middleband'] = dailyBbandsChart.middleband;
      dailyChart['lowerband'] = dailyBbandsChart.lowerband;
      hourlyChart['momentum'] = hourlyMomentumChart.mom;
      hourlyChart['atr'] = hourlyAtrChart.atr;
      hourlyChart['upperband'] = hourlyBbandsChart.upperband;
      hourlyChart['middleband'] = hourlyBbandsChart.middleband;
      hourlyChart['lowerband'] = hourlyBbandsChart.lowerband;

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

        const stockInfoService = new StockInformationService(
          company,
          dailyChart
        );
        const stockInformation = stockInfoService.getStockInformation();

        const chartServiceDaily = new chartConfigService();
        chartServiceDaily.sanitizeFinnHubData(dailyChart);
        chartServiceDaily.sanitizeFinnHubDataForIndicators(dailyChart);
        const chartConfigWithIndicators = chartServiceDaily.createStockConfigBollingerBands(
          company.name,
          'daily',
          -150
        );
        
        const chartServiceHourly = new chartConfigService();
        chartServiceHourly.sanitizeFinnHubDataForIndicators(hourlyChart);
        const chartConfigTtmSqueezeHourly = chartServiceHourly.createStockConfigTtmSqueeze(
          company.name,
          'hourly'
        );

        res.render('stock', {
          apiError,
          title: ticker + ': ' + stockInformation.name,
          stockInformation,
          chartConfigWithIndicators,
          chartConfigTtmSqueezeHourly,
          news,
          recentSymbolsArray,
        });
      }
    })
    .catch((error) => console.log('Something went wrong:', error));
};

// axios.interceptors.request.use(
//   function (request) {
//     //console.log(request);
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

module.exports = { showStockInformation };
