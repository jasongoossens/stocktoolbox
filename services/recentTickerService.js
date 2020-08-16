function addSymbolToLastViewed(symbol, lastViewedSymbolsArray) {
  const maxLength = 5;

  if (!lastViewedSymbolsArray.includes(symbol)) {
    lastViewedSymbolsArray.unshift(symbol);

    if (lastViewedSymbolsArray.length > maxLength) {
      lastViewedSymbolsArray.splice(maxLength, 1);
    }
  }

  return lastViewedSymbolsArray;
}

module.exports = addSymbolToLastViewed;
