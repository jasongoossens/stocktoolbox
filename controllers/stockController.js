const axios = require('axios');
const config = require('config');
const chartConfigService = require('../services/chartConfigService');

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
    axios
      .get(baseUrl + 'stock/candle', {
        params: {
          resolution: 'D',
          from: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            .getTime()
            .toString()
            .substr(0, 10),
          to: Date.now().toString().substr(0, 10),
          symbol: ticker,
          token: token,
        },
      })
      .then(),
  ])
    .then((response) => {
      response.map((r) => {
        data.push(r.data);
      });
      const [company, price, chart] = data;

      let priceData = [];
      let volumeData = [];
      let dates = [];

      chart.t.forEach((element, index) => {
        dates.push(chart.t[index] * 1000);
        priceData.push([
          Math.round(chart.o[index] * 100) / 100,
          Math.round(chart.h[index] * 100) / 100,
          Math.round(chart.l[index] * 100) / 100,
          Math.round(chart.c[index] * 100) / 100,
        ]),
          volumeData.push(chart.v[index]);
      });

      const chartService = new chartConfigService(
        company.name,
        ticker,
        priceData,
        volumeData,
        dates,
        -150,
        chart.h,
        chart.l
      );
      const chartConfig = chartService.createConfig();

      res.render('stock', {
        title: ticker + ': ' + company.name,
        company,
        price,
        chartConfig,
      });
    })
    .catch((error) => console.log('Something went wrong:', error));
};

module.exports = { showStockInformation };
