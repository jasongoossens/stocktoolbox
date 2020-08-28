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
  const nrOfDaysHourlyChart = 20;
  const emaTimePeriod = 20;
  const atrTimePeriod = 10;
  const bollingerBandsTimePeriod = 20;
  const momentumTimePeriod = 20;
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
    // EMA(20) daily
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: moment().subtract(1, 'years').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'ema',
        timeperiod: emaTimePeriod,
        token: finnHubToken,
      },
    }), // ATR(10) daily
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: moment().subtract(1, 'years').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'atr',
        timeperiod: atrTimePeriod,
        token: finnHubToken,
      },
    }), // Bollinger bands daily
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: moment().subtract(1, 'years').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'bbands',
        timeperiod: bollingerBandsTimePeriod,
        token: finnHubToken,
      },
    }), // Momentum daily
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: 'D',
        adjusted: true,
        from: moment().subtract(1, 'years').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'mom',
        timeperiod: momentumTimePeriod,
        token: finnHubToken,
      },
    }),
    // EMA(20) hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(nrOfDaysHourlyChart, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'ema',
        timeperiod: emaTimePeriod,
        token: finnHubToken,
      },
    }), // ATR(10) hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(nrOfDaysHourlyChart, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'atr',
        timeperiod: atrTimePeriod,
        token: finnHubToken,
      },
    }), // Bollinger bands hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(nrOfDaysHourlyChart, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'bbands',
        timeperiod: bollingerBandsTimePeriod,
        token: finnHubToken,
      },
    }), // Momentum hourly
    axios.get(baseUrl + 'indicator', {
      params: {
        resolution: '60',
        adjusted: true,
        from: moment().subtract(nrOfDaysHourlyChart, 'days').unix(),
        to: moment().unix(),
        symbol: ticker,
        indicator: 'mom',
        timeperiod: momentumTimePeriod,
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
        dailyMomentumChart,
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
      dailyChart['momentum'] = dailyMomentumChart.mom;
      hourlyChart['atr'] = hourlyAtrChart.atr;
      hourlyChart['upperband'] = hourlyBbandsChart.upperband;
      hourlyChart['middleband'] = hourlyBbandsChart.middleband;
      hourlyChart['lowerband'] = hourlyBbandsChart.lowerband;
      hourlyChart['momentum'] = hourlyMomentumChart.mom;

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

        const dailyChartService = new chartConfigService();
        dailyChartService.sanitizeFinnHubDataForIndicators(dailyChart);
        const chartConfigWithIndicators = dailyChartService.createStockConfigBollingerBands(
          company.name,
          'daily',
          -150
        );
        const chartConfigTtmSqueezeDaily = dailyChartService.createStockConfigTtmSqueeze(
          company.name,
          'daily'
        );

        const hourlyChartService = new chartConfigService();
        hourlyChartService.sanitizeFinnHubDataForIndicators(hourlyChart);
        const chartConfigTtmSqueezeHourly = hourlyChartService.createStockConfigTtmSqueeze(
          company.name,
          'hourly'
        );

        res.render('stock', {
          apiError,
          title: ticker + ': ' + stockInformation.name,
          stockInformation,
          chartConfigWithIndicators,
          chartConfigTtmSqueezeHourly,
          chartConfigTtmSqueezeDaily,
          news,
          recentSymbolsArray,
        });
      }
    })
    .catch((error) => console.log('Something went wrong:', error));
};

// /* Debug Axios calls */
// axios.interceptors.request.use(
//   function (request) {
//     //console.log(request);
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

module.exports = { showStockInformation };
