class ChartConfigService {
  prices = [];
  volumes = [];
  dates = [];
  chartData = [];

  sanitizeFinnHubData(chartData) {
    chartData.t.forEach((element, index) => {
      this.dates.push(chartData.t[index] * 1000);
      this.prices.push([
        Math.round(chartData.o[index] * 100) / 100,
        Math.round(chartData.h[index] * 100) / 100,
        Math.round(chartData.l[index] * 100) / 100,
        Math.round(chartData.c[index] * 100) / 100,
      ]),
        this.volumes.push(chartData.v[index]);
    });
    console.log(chartData);
    this.chartData = chartData;
  }

  sanitizeTwelveDataData(chartData) {
    // transform to arrays of c,h,l,o
    // or just take the lows - need to return a wildly different chart then
  }
  
  createIndexConfig(name) {}

  createStockConfig(name, chartSize) {
    return JSON.stringify({
      type: 'mixed',
      title: {
        text: name,
        adjustLayout: true,
      },
      plotarea: { margin: 'dynamic' },
      'scale-x': {
        labels: this.dates.slice(chartSize),
        step: 'day',
        transform: {
          type: 'date',
          all: '%dd/%m',
        },
      },
      'scale-y': {
        'offset-start': '35%',
        format: '$%v',
        values: `${
          Math.floor((Math.min(...this.chartData.h) * 0.99) / 10) * 10
        }:
          ${Math.ceil((Math.max(...this.chartData.l) * 1.02) / 10) * 10}`,
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
      'crosshair-x': {
        'plot-label': {
          text: 'Open: $%open<br>High: $%high<br>Low: $%low<br>Close: $%close',
          decimals: 2,
        },
        'scale-label': {
          text: '%v',
          decimals: 2,
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
          'trend-equal': {
            'background-color': 'red',
            'line-color': 'red',
            'border-color': 'red',
          },
          plot: {
            aspect: 'candlestick',
          },
          values: this.prices.slice(chartSize),
        },
        {
          type: 'bar',
          scales: 'scale-x,scale-y-2',
          'background-color': '#6382a5',
          'guide-label': {
            text: 'Volume: %v',
            decimals: 0,
          },
          values: this.volumes.slice(chartSize),
        },
      ],
    });
  }
}

module.exports = ChartConfigService;
