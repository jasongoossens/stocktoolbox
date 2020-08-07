const axios = require('axios');
const config = require('config');
const googleCharts = require('google-charts-node');
const fs = require('fs');

const baseUrl = 'https://finnhub.io/api/v1/';
const token = config.get('finnHubApiKey');

// Define your chart drawing function
function drawChart() {
  const data = google.visualization.arrayToDataTable([
    ['City', '2010 Population'],
    ['New York City, NY', 8175000],
    ['Los Angeles, CA', 3792000],
    ['Chicago, IL', 2695000],
    ['Houston, TX', 2099000],
    ['Philadelphia, PA', 1526000],
  ]);

  const options = {
    title: 'Population of Largest U.S. Cities',
    chartArea: { width: '50%' },
    hAxis: {
      title: 'Total Population',
      minValue: 0,
    },
    vAxis: {
      title: 'City',
    },
  };

  const chart = new google.visualization.BarChart(container);
  chart.draw(data, options);
}

(async () => {
  try {
    const image = await googleCharts.render(drawChart, {
      width: 400,
      height: 300,
    });
    fs.writeFileSync('./public/charts/google-chart.png', image);
  } catch (error) {
    console.log('Charting went wrong:', error);
  }
})();

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
      console.log(chart);
      let restructeredChartData = [];
      chart.t.forEach((element, index) => {
        restructeredChartData.push([
          chart.t[index],
          chart.o[index],
          chart.h[index],
          chart.l[index],
          chart.c[index],
          chart.v[index],
        ]);
      });

      console.log('new chart is:', restructeredChartData);
      res.render('stock', {
        title: ticker + ': ' + company.name,
        company,
        price,
      });
    })
    .catch((error) => console.log('Something went wrong:', error));
};

module.exports = { showStockInformation };
