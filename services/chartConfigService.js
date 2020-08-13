class ChartConfigService {
  prices = [];
  volumes = [];
  dates = [];
  chartData = [];
  twelveDataHighPrices = [];
  twelveDataLowPrices = [];

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
    this.chartData = chartData;
  }

  sanitizeTwelveDataData(chartData) {
    for (const element in chartData) {
      this.dates.push(chartData[element].datetime);
      this.prices.push([
        Math.round(chartData[element].open * 100) / 100,
        Math.round(chartData[element].high * 100) / 100,
        Math.round(chartData[element].low * 100) / 100,
        Math.round(chartData[element].close * 100) / 100,
      ]),
        this.volumes.push(chartData[element].volume);
    }

    for (const element in chartData) {
      this.twelveDataHighPrices.push(parseFloat(chartData[element].high));
      this.twelveDataLowPrices.push(parseFloat(chartData[element].low));
    }
  }

  createIndexConfig(name) {
    return JSON.stringify({
      type: 'stock',

      title: {
        text: name,
        adjustLayout: true,
      },
      plotarea: { margin: 'dynamic' },
      'scale-x': {
        labels: this.dates,
        step: 'day',
        transform: {
          type: 'date',
          all: '%dd/%m',
        },
      },
      plot: {
        aspect: 'candlestick',
      },
      'scale-y': {
        values: `${
          Math.floor((Math.min(...this.twelveDataHighPrices) * 0.99) / 10) * 10
        }:
          ${
            Math.ceil((Math.max(...this.twelveDataLowPrices) * 1.02) / 10) * 10
          }`,
        label: {
          text: 'Prices',
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
          values: this.prices,
        },
      ],
    });
  }

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
        values: `${Math.floor((Math.min(...this.chartData.h) * 0.99) / 10) * 10}:
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
