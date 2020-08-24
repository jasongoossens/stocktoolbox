class StockInformationService {
  prices = [];
  company = [];

  constructor(company, pricesArray) {
    this.prices = pricesArray;
    this.company = company;
    console.log(this.prices.atr.slice(-5));
  }

  getStockInformation() {
    const [previousClose, currentClose] = this.prices.c.slice(-2);

    return {
      name: this.company.name,
      exchange: this.company.exchange,
      country: this.company.country,
      sector: this.company.finnhubIndustry,
      marketCap: this.company.marketCapitalization,
      prices: {
        currentClose: currentClose,
        previousClose: previousClose,
        fiftyTwoWeekHigh: Math.max(...this.prices.h),
        fiftyTwoWeekLow: Math.min(...this.prices.l),
        atr: this.prices.atr.slice(-1)[0],
      },
    };
  }
}

module.exports = StockInformationService;
