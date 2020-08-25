class ChartConfigService {
  prices = [];
  atr = [];
  ema = [];
  bBandUpper = [];
  bBandMiddle = [];
  bBandLower = [];
  keltnerUpper = [];
  keltnerMiddle = [];
  keltnerLower = [];
  ttmSqueezeDots = [];
  ttmSqueezeHistogram = [];

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

  sanitizeFinnHubDataForIndicators(chartData) {
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

    this.atr = chartData.atr.map((n) => Math.round(n * 100) / 100);
    this.ema = chartData.ema.map((n) => Math.round(n * 100) / 100);
    this.bBandUpper = chartData.upperband.map((n) => Math.round(n * 100) / 100);
    this.bBandMiddle = chartData.middleband.map(
      (n) => Math.round(n * 100) / 100
    );
    this.bBandLower = chartData.lowerband.map((n) => Math.round(n * 100) / 100);

    this.keltnerMiddle = this.ema;
    this.ema.forEach((element, index) => {
      const doubleAtr = this.atr[index] * 2;
      this.keltnerUpper.push(
        Math.round((this.ema[index] + doubleAtr) * 100) / 100
      );
      this.keltnerLower.push(
        Math.round((this.ema[index] - doubleAtr) * 100) / 100
      );
    });

    this.keltnerMiddle.forEach((element, index) => {
      if (this.bBandUpper[index] > this.keltnerUpper[index]) {
        //  Bbands greater than Keltner channels
        this.ttmSqueezeDots.push(true);
      } else {
        this.ttmSqueezeDots.push(false);
      }
    });

    /*
TTM Histogram calc
    https://www.tradingview.com/script/nqQ1DT5a-Squeeze-Momentum-Indicator-LazyBear/

linearReq(
	close - 
		avg(
			avg(
				highest of last 20 highs,
				lower of last 20 lows
				),
			sma of last 20 closes
		)
  )
  
    */

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

    this.dates.reverse();
    this.prices.reverse();
    this.volumes.reverse();

    for (const element in chartData) {
      this.twelveDataHighPrices.push(parseFloat(chartData[element].high));
      this.twelveDataLowPrices.push(parseFloat(chartData[element].low));
    }
  }

  createIndexConfig(name, resolution, chartSize = -253) {
    return JSON.stringify({
      type: 'stock',

      title: {
        text: name + '(' + resolution + ')',
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
      plot: {
        aspect: 'candlestick',
      },
      'scale-y': {
        values: `${
          Math.ceil((Math.max(...this.twelveDataHighPrices) * 1.02) / 10) * 10
        }:
          ${
            Math.floor((Math.min(...this.twelveDataLowPrices) * 0.98) / 10) * 10
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
          values: this.prices.slice(chartSize),
        },
      ],
    });
  }

  createStockConfigBollingerBands(name, resolution, chartSize) {
    return JSON.stringify({
      type: 'mixed',
      title: {
        text: name + '(' + resolution + ')',
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
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
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

  createStockConfigBollingerBands(name, resolution, chartSize) {
    return JSON.stringify({
      type: 'mixed',
      title: {
        text: name + '(' + resolution + ')',
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
        'offset-start': '30%' /* distance from bottom */,
        format: '$%v',
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
        label: {
          text: 'Prices',
        },
      },
      'scale-y-2': {
        'offset-end': '75%' /* distance from the top */,
        placement: 'default',
        blended: true,
        label: {
          text: 'Volume',
        },
      },
      'scale-y-3': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'scale-y-4': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'scale-y-5': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'crosshair-x': {
        'plot-label': {
          text: 'Open: $%open<br>High: $%high<br>Low: $%low<br>Close: $%close',
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
        {
          type: 'line',
          scales: 'scale-x,scale-y-3',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            'line-color': 'rbga(255,0,0,0.5',
            size: 0,
            'border-width': 0,
          },
          values: this.bBandUpper.slice(chartSize),
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-4',
          'background-color': '#6382a5',

          marker: {
            size: 0,
            'border-width': 0,
          },
          values: this.bBandMiddle.slice(chartSize),
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-5',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
            decimals: 2,
          },
          marker: {
            size: 0,
            'border-width': 0,
          },
          values: this.bBandLower.slice(chartSize),
        },
      ],
    });
  }

  createStockConfigBollingerBandsAtr(name, resolution, chartSize) {
    return JSON.stringify({
      type: 'mixed',
      title: {
        text: name + '(' + resolution + ')',
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
        'offset-start': '45%' /* distance from bottom */,
        format: '$%v',
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
        label: {
          text: 'Prices',
        },
      },
      'scale-y-2': {
        'offset-end': '80%' /* distance from the top */,
        placement: 'default',
        blended: true,
        label: {
          text: 'Volume',
        },
      },
      'scale-y-3': {
        'offset-end': '55%' /* distance from the top */,
        'offset-start': '20%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        label: {
          text: 'ATR',
        },
      },
      'scale-y-4': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'scale-y-5': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'scale-y-6': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
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
        {
          type: 'line',
          scales: 'scale-x,scale-y-3',
          'background-color': '#6382a5',
          'guide-label': {
            text: 'ATR: %plot-2-value',
            decimals: 0,
          },
          marker: {
            size: 0,
            'border-width': 0,
          },
          values: this.atr.slice(chartSize),
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-4',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            'line-color': 'rbga(255,0,0,0.5',
            size: 0,
            'border-width': 0,
          },
          values: this.bBandUpper.slice(chartSize),
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-5',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            size: 0,
            'border-width': 0,
          },
          values: this.bBandMiddle.slice(chartSize),
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-6',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
            decimals: 2,
          },
          marker: {
            size: 0,
            'border-width': 0,
          },
          values: this.bBandLower.slice(chartSize),
        },
      ],
    });
  }

  // Using Linda Raschke's Keltner settings
  createStockConfigKeltnerChannels(name, resolution, chartSize) {
    return JSON.stringify({
      type: 'mixed',
      title: {
        text: name + '(' + resolution + ')',
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
        'offset-start': '30%' /* distance from bottom */,
        format: '$%v',
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
        label: {
          text: 'Prices',
        },
      },
      'scale-y-2': {
        'offset-end': '75%' /* distance from the top */,
        placement: 'default',
        blended: true,
        label: {
          text: 'Volume',
        },
      },
      'scale-y-3': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'scale-y-4': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'scale-y-5': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: `${
          Math.floor(
            (Math.min(...this.chartData.l.slice(chartSize)) * 0.98) / 10
          ) * 10
        }:
          ${
            Math.ceil(
              (Math.max(...this.chartData.h.slice(chartSize)) * 1.02) / 10
            ) * 10
          }`,
      },
      'crosshair-x': {
        'plot-label': {
          text: 'Open: $%open<br>High: $%high<br>Low: $%low<br>Close: $%close',
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
        {
          type: 'line',
          scales: 'scale-x,scale-y-3',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            'line-color': 'rbga(255,0,0,0.5',
            size: 0,
            'border-width': 0,
          },
          values: this.keltnerUpper.slice(chartSize),
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-4',
          'background-color': '#6382a5',

          marker: {
            size: 0,
            'border-width': 0,
          },
          values: this.keltnerMiddle.slice(chartSize),
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-5',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
            decimals: 2,
          },
          marker: {
            size: 0,
            'border-width': 0,
          },
          values: this.keltnerLower.slice(chartSize),
        },
      ],
    });
  }

  // Using Linda Raschke's Keltner settings
  createStockConfigTtmSqueeze(name, resolution, chartSize = 0) {
    return JSON.stringify({
      type: 'mixed',
      title: {
        text: name + '(' + resolution + ')',
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
        'offset-start': '45%' /* distance from bottom */,
        format: '$%v',
        values: `${
          Math.floor(Math.min(...this.chartData.l.slice(chartSize)) / 10) * 10
        }:
          ${
            Math.ceil(Math.max(...this.chartData.h.slice(chartSize)) / 10) * 10
          }`,
        label: {
          text: 'Prices',
        },
      },
      'scale-y-2': {
        'offset-end': '80%' /* distance from the top */,
        placement: 'default',
        blended: true,
        label: {
          text: 'Volume',
        },
      },
      'scale-y-3': {
        'offset-end': '55%' /* distance from the top */,
        'offset-start': '20%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        label: {
          text: 'TTM_Squeeze',
        },
      },
      'crosshair-x': {
        'plot-label': {
          text: 'Open: $%open<br>High: $%high<br>Low: $%low<br>Close: $%close',
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
        {
          type: 'line',
          scales: 'scale-x,scale-y-3',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            'line-color': 'rbga(255,0,0,0.5',
            size: 0,
            'border-width': 0,
          },
          values: this.keltnerUpper.slice(chartSize),
        },
      ],
    });
  }
}

module.exports = ChartConfigService;
