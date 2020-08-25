class StockInformationService {
  prices = [];
  company = [];

  constructor(company, pricesArray) {
    this.prices = pricesArray;
    this.company = company;
  }

  getStockInformation() {
    const [previousClose, currentClose] = this.prices.c.slice(-2);
    // 3 month avg volume
    console.log(
      this.prices.v.slice(-1) /
        (this.prices.v.slice(-62).reduce((total, current) => current + total) /
          62)
    );

    return {
      name: this.company.name,
      ticker: this.company.ticker,
      exchange: this.company.exchange,
      country: this.company.country,
      sector: this.company.finnhubIndustry,
      marketCap: this.company.marketCapitalization,
      prices: {
        currentClose: currentClose,
        dailyDifference: currentClose - previousClose,
        dailyDifferencePercent:
          ((currentClose - previousClose) / previousClose) * 100,
        previousClose: previousClose,
        fiftyTwoWeekHigh: Math.max(...this.prices.h),
        fiftyTwoWeekLow: Math.min(...this.prices.l),
        atr: this.prices.atr.slice(-1)[0],
        // 3 month avg volume
        relativeVolume:
          this.prices.v.slice(-1) /
          (this.prices.v
            .slice(-62)
            .reduce((total, current) => current + total) /
            62),
      },
    };
  }
}

module.exports = StockInformationService;
