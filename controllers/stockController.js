const axios = require('axios');
const config = require('config');
const fs = require('fs');

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

      const chartConfig = JSON.stringify({
        type: 'mixed',
        title: {
          text: company.name,
        },
        'scale-x': {
          labels: dates,
          step: 'day',
          transform: {
            type: 'date',
            all: '%D,<br>%m/%d',
          },
        },
        'scale-y': {
          'offset-start': '35%',
          format: '$%v',
          values: `${Math.floor((Math.min(...chart.l) * 0.99) / 10) * 10}:
            ${Math.ceil((Math.max(...chart.h) * 1.02) / 10) * 10}`,
          label: {
            text: 'Prices',
          },
        },
        'scale-y-2': {
          'offset-end': '75%',
          placement: 'default',
          blended: true,
          label: {
            text: 'Volume',
          },
        },
        series: [
          {
            type: 'stock',
            scales: 'scale-x,scale-y',
            'trend-up': {
              'background-color': 'red',
              'line-color': 'red',
              'border-color': 'red',
            },
            'trend-down': {
              'background-color': 'none',
              'line-color': 'orange',
              'border-color': 'orange',
            },
            plot: {
              aspect: 'candlestick',

              tooltip: {
                text:
                  'On %kl:<br>Open: $%open<br>Hifsdfgh: $%high<br>Low: $%low<br>Close: $%close<br>',
              },
            },
            values: priceData,
          },
          {
            type: 'bar',
            scales: 'scale-x,scale-y-2',
            values: volumeData,
          },
        ],
      });

      console.log('new chart is:', dates);

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
