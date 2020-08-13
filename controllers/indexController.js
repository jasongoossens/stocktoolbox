const axios = require('axios');
const config = require('config');
const chartConfigService = require('../services/chartConfigService');

const finnHubBaseUrl = 'https://finnhub.io/api/v1/';
const twelveDataBaseUrl = 'https://api.twelvedata.com/';
const finnHubToken = config.get('finnHubApiKey') || process.env.FINNHUB_API_KEY;
const twelveDataToken =
  config.get('twelveDataApiKey') || process.env.TWELVEDATA_API_KEY;

const showIndex = (req, res) => {
  let data = [];
  let cachedData;
  let cachedTime;
  let apiError = {
    error: false,
    message: '',
  };

  Promise.all([
    axios.get(finnHubBaseUrl + 'news/', {
      params: {
        category: 'general',
        token: finnHubToken,
      },
    }),
    axios.get(finnHubBaseUrl + 'calendar/earnings', {
      params: {
        from: new Date(
          new Date().setDate(new Date().getDate() - 2)
        ).toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        to: new Date(
          new Date().setDate(new Date().getDate() + 2)
        ).toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        token: finnHubToken,
      },
    }),
    // TODO: need to add caching here - limit is 12 req/minutes or 800/day
    // surpassing the limit results in a code 429

    axios.get(twelveDataBaseUrl + 'time_series', {
      params: {
        symbol: 'GSPC,IXIC,VIX',
        interval: '1day',
        outputsize: 253,
        apikey: twelveDataToken,
      },
    }),
  ])
    .then((response) => {
      response.map((r) => {
        if (r !== undefined) {
          data.push(r.data);
        }
      });

      const [news, calendar, indexCharts] = data;
      const earningsCalendar = sanitizeEarningsData(calendar);

      const indexPricesArray = [];

      if (indexCharts.status === 'error') {
        apiError = {
          error: true,
          message: 'I encountered an error while contacting the API.',
          code: indexCharts.message,
        };

        res.render('index', {
          title: 'Index',
          news,
          earningsCalendar,
          apiError,
        });
      } else {
        // Order is S&P, Nasdaq, VIX
        for (const element in indexCharts) {
          indexPricesArray.push(Array.from(indexCharts[element].values));
        }

        const [sAndP, nasdaq, vix] = indexPricesArray;
        const sAndPchartService = new chartConfigService();
        sAndPchartService.sanitizeTwelveDataData(sAndP);
        const sAndPChartConfig = sAndPchartService.createIndexConfig('SP500');
        const nasdaqChartService = new chartConfigService();
        nasdaqChartService.sanitizeTwelveDataData(nasdaq);
        const nasdaqChartConfig = nasdaqChartService.createIndexConfig(
          'Nasdaq'
        );
        const vixChartService = new chartConfigService();
        vixChartService.sanitizeTwelveDataData(vix);
        const vixChartConfig = vixChartService.createIndexConfig('VIX');

        res.render('index', {
          title: 'Index',
          news,
          earningsCalendar,
          sAndPChartConfig,
          nasdaqChartConfig,
          vixChartConfig,
        });
      }
    })
    .catch((error) => console.log('Something went wrong:', error));
};

function sanitizeEarningsData(calendar) {
  let { earningsCalendar } = calendar;
  earningsCalendar = earningsCalendar.filter((event) => event.epsEstimate != 0);

  return earningsCalendar;
}

module.exports = { showIndex };
