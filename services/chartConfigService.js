const helpers = require('../utils/helpers');

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
  momentum = [];
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
        helpers.roundToTwoDigits(chartData.o[index]),
        helpers.roundToTwoDigits(chartData.h[index]),
        helpers.roundToTwoDigits(chartData.l[index]),
        helpers.roundToTwoDigits(chartData.c[index]),
      ]),
        this.volumes.push(chartData.v[index]);
    });
    this.chartData = chartData;
  }

  sanitizeFinnHubDataForIndicators(chartData) {
    chartData.t.forEach((element, index) => {
      this.dates.push(chartData.t[index] * 1000);
      this.prices.push([
        helpers.roundToTwoDigits(chartData.o[index]),
        helpers.roundToTwoDigits(chartData.h[index]),
        helpers.roundToTwoDigits(chartData.l[index]),
        helpers.roundToTwoDigits(chartData.c[index]),
      ]),
        this.volumes.push(chartData.v[index]);
    });

    this.atr = chartData.atr.map((n) =>
      n === 0 ? null : helpers.roundToTwoDigits(n)
    );
    this.ema = chartData.ema.map((n) =>
      n === 0 ? null : helpers.roundToTwoDigits(n)
    );
    this.momentum =
      chartData.momentum !== undefined
        ? chartData.momentum.map((n) => helpers.roundToTwoDigits(n))
        : '';
    this.bBandUpper = chartData.upperband.map((n) =>
      n === 0 ? null : helpers.roundToTwoDigits(n)
    );
    this.bBandMiddle = chartData.middleband.map((n) =>
      n === 0 ? null : helpers.roundToTwoDigits(n)
    );
    this.bBandLower = chartData.lowerband.map((n) =>
      n === 0 ? null : helpers.roundToTwoDigits(n)
    );

    this.keltnerMiddle = this.ema;
    this.ema.forEach((element, index) => {
      let doubleAtr;

      if (element === null) {
        doubleAtr = null;
      } else {
        doubleAtr = 2 * this.atr[index];
      }

      this.keltnerUpper.push(
        element == null ? null : helpers.roundToTwoDigits(element + doubleAtr)
      );
      this.keltnerLower.push(
        element == null ? null : helpers.roundToTwoDigits(element - doubleAtr)
      );
    });

    this.keltnerMiddle.forEach((element, index) => {
      if (
        this.bBandUpper[index] > this.keltnerUpper[index] &&
        this.bBandLower[index] < this.keltnerLower[index]
      ) {
        //  Bbands greater than Keltner channels == no squeeze
        this.ttmSqueezeDots.push(null);
      } else {
        this.ttmSqueezeDots.push(0);
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
        helpers.roundToTwoDigits(chartData[element].open),
        helpers.roundToTwoDigits(chartData[element].high),
        helpers.roundToTwoDigits(chartData[element].low),
        helpers.roundToTwoDigits(chartData[element].close),
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

  getScaleX(dates, chartSize) {
    return {
      labels: dates.slice(chartSize),
      step: 'day',
      transform: {
        type: 'date',
        all: '%dd/%m',
      },
    };
  }

  getScaleValues(lowPrices, highPrices, chartSize) {
    return `${Math.floor(Math.min(...lowPrices.slice(chartSize)) / 10) * 10}:
    ${Math.ceil(Math.max(...highPrices.slice(chartSize)) / 10) * 10}`;
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
        values: this.getScaleValues(
          this.twelveDataLowPrices,
          this.twelveDataHighPrices
        ),
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
      'scale-x': this.getScaleX(this.dates, chartSize),
      'scale-y': {
        'offset-start': '35%',
        format: '$%v',
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
      'scale-y-3': {
        'offset-start': '35%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      'scale-y-4': {
        'offset-start': '35%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      'scale-y-5': {
        'offset-start': '35%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
      'scale-x': this.getScaleX(this.dates, chartSize),
      'scale-y': {
        'offset-start': '45%' /* distance from bottom */,
        format: '$%v',
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      'scale-y-5': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      'scale-y-6': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
      'scale-x': this.getScaleX(this.dates, chartSize),
      'scale-y': {
        'offset-start': '30%' /* distance from bottom */,
        format: '$%v',
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      'scale-y-4': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      'scale-y-5': {
        'offset-start': '30%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
      'scale-x': this.getScaleX(this.dates, chartSize),
      'scale-y': {
        'offset-start': '45%' /* distance from bottom */,
        format: '$%v',
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
      // squeeze dots
      'scale-y-3': {
        'offset-end': '55%' /* distance from the top */,
        'offset-start': '20%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        label: {
          text: 'TTM_Squeeze',
        },
      },
      // squeeze momentum
      'scale-y-4': {
        'offset-end': '55%' /* distance from the top */,
        'offset-start': '20%' /* distance from bottom */,
        placement: 'default',
        blended: true,
      },
      // bbol upper
      'scale-y-5': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      // bbol lower
      'scale-y-6': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      // keltner upper
      'scale-y-7': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
      },
      // keltner lower
      'scale-y-8': {
        'offset-start': '45%' /* distance from bottom */,
        placement: 'default',
        blended: true,
        values: this.getScaleValues(
          this.chartData.l,
          this.chartData.h,
          chartSize
        ),
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
          scales: 'scale-x,scale-y-3,scale-y-4',
          'background-color': '#ff0',
          'guide-label': {
            text: '',
          },
          values: this.ttmSqueezeDots.slice(chartSize),
          'line-width': 7,
        },
        {
          type: 'bar',
          scales: 'scale-x,scale-y-3,scale-y-4',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            'background-color': '#FF0066',
            size: 0,
          },
          values: this.momentum.slice(chartSize),
          'line-color': '#FF0000',
          'line-width': 3,
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-5',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            backgroundColor: '#FF0000',
            size: 0,
            'border-width': 0,
          },
          values: this.bBandUpper.slice(chartSize),
          'line-color': '#FF0000',
          'line-width': 1,
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-6',

          'guide-label': {
            text: '',
            decimals: 2,
          },
          marker: {
            backgroundColor: '#FF0000',
            size: 0,
            'border-width': 0,
          },
          values: this.bBandLower.slice(chartSize),
          'line-color': '#FF0000',
          'line-width': 1,
        },
        {
          type: 'line',
          scales: 'scale-x,scale-y-7',
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
          scales: 'scale-x,scale-y-8',
          'background-color': '#6382a5',
          'guide-label': {
            text: '',
          },
          marker: {
            'line-color': 'rbga(255,0,0,0.5',
            size: 0,
            'border-width': 0,
          },
          values: this.keltnerLower.slice(chartSize),
        },
      ],
    });
  }
}

module.exports = ChartConfigService;
