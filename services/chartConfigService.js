class ChartConfigService {
  chartSize;
  ticker;
  prices;
  volume;
  dates;
  name;
  highPricesArray;
  lowPricesArray;

  constructor(
    name,
    ticker,
    prices,
    volume,
    dates,
    chartSize,
    highPricesArray,
    lowPricesArray
  ) {
    this.name = name;
    this.ticker = ticker;
    this.prices = prices;
    this.volume = volume;
    this.dates = dates;
    this.chartSize = chartSize;
    this.highPricesArray = highPricesArray;
    this.lowPricesArray = lowPricesArray;
  }

  createConfig() {
    return JSON.stringify({
      type: 'mixed',
      title: {
        text: this.name,
        adjustLayout: true,
      },
      plotarea: { margin: 'dynamic' },
      'scale-x': {
        labels: this.dates.slice(this.chartSize),
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
          Math.floor((Math.min(...this.highPricesArray) * 0.99) / 10) * 10
        }:
          ${Math.ceil((Math.max(...this.lowPricesArray) * 1.02) / 10) * 10}`,
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
          values: this.prices.slice(this.chartSize),
        },
        {
          type: 'bar',
          scales: 'scale-x,scale-y-2',
          'background-color': '#6382a5',
          'guide-label': {
            text: 'Volume: %v',
            decimals: 0,
          },
          values: this.volume.slice(this.chartSize),
        },
      ],
    });
  }
}

module.exports = ChartConfigService;
