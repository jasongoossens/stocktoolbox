global.recentSymbolsArray = [];

class RecentSymbols {
  addSymbolToLastViewed(symbol) {
    const maxLength = 5;

    if (!recentSymbolsArray.includes(symbol)) {
      recentSymbolsArray.unshift(symbol);

      if (recentSymbolsArray.length > maxLength) {
        recentSymbolsArray.splice(maxLength, 1);
      }
    }
    return recentSymbolsArray;
  }
}

module.exports = RecentSymbols;
