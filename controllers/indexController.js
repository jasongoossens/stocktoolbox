const axios = require('axios');
const config = require('config');
const chartConfigService = require('../services/chartConfigService');

const finnHubBaseUrl = 'https://finnhub.io/api/v1/';
const twelveDataBaseUrl = 'https://api.twelvedata.com/';
const finnHubToken = config.get('finnHubApiKey');
const twelveDataToken = config.get('twelveDataApiKey');

const showIndex = (req, res) => {
  let data = [];

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
    // TODO: need to add caching here - limit is 12 req/minutes
    axios.get(twelveDataBaseUrl + 'time_series', {
      params: {
        symbol: 'IXIC,GSPC,VIX',
        interval: '1day',
        outputsize: 253,
        apikey: twelveDataToken,
      },
    }),
  ])
    .then((response) => {
      response.map((r) => {
        data.push(r.data);
      });
      const [news, calendar, indexCharts] = data;
      const earningsCalendar = sanitizeEarningsData(calendar);

      console.log(indexCharts.VIX);

      // loop over the 3 indices,
      // sanitize their data,
      // and return an array of chartConfig object
      // const chartService = new chartConfigService();
      // chartService.sanitizeTwelveDataData(chart);
      // const chartConfig = chartService.createConfig(company.name);

      res.render('index', { title: 'Index', news, earningsCalendar });
    })
    .catch((error) => console.log('Something went wrong:', error));
};

function sanitizeEarningsData(calendar) {
  let { earningsCalendar } = calendar;
  earningsCalendar = earningsCalendar.filter((event) => event.epsEstimate != 0);

  return earningsCalendar;
}

module.exports = { showIndex };
