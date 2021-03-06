const express = require('express');
const router = express.Router();
const config = require('config');
const axios = require('axios');

const baseUrl = 'https://finnhub.io/api/v1/';
const token = config.get('finnHubApiKey');

// GET /api/stocks/symbols
// Get all supported symbols
// https://finnhub.io/api/v1/stock/symbol?exchange=US
router.get('/symbols', (req, res) => {
  console.log(req);
  axios
    .get(baseUrl + 'stock/symbol', {
      params: { exchange: 'US', token: token },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/stocks/:symbol
// Get company information for a specific symbol
// https://finnhub.io/api/v1/stock/profile2?symbol=AAPL
router.get('/symbols/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'stock/profile2', {
      params: {
        symbol: req.params.symbol,
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/stocks/basicfinancials/:symbol
// Get company information for a specific symbol
// https://finnhub.io/api/v1/stock/metric?symbol=AAPL&metric=all
router.get('/basicfinancials/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'stock/metric', {
      params: {
        symbol: req.params.symbol,
        metric: 'all',
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/stocks/news/
// Get market news
// https://finnhub.io/api/v1/news?category=general
router.get('/news', (req, res) => {
  axios
    .get(baseUrl + 'news/', {
      params: {
        category: 'general',
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/stocks/news/:symbol
// Get news for a specific symbol
// https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2020-04-30&to=2020-05-01
router.get('/news/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'company-news/', {
      params: {
        symbol: req.params.symbol,
        from: new Date(
          new Date().setFullYear(new Date().getFullYear() - 1)
        ).toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        to: new Date().toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/stocks/peers/:symbol
// Get company peers
// https://finnhub.io/api/v1/stock/peers?symbol=AAPL
router.get('/peers/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'stock/peers', {
      params: {
        symbol: req.params.symbol,
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/stocks/10q/:symbol
// Get quarterly financial statements for a company
// https://finnhub.io/api/v1/stock/financials-reported?symbol=AAPL&freq=quarterly
router.get('/10q/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'stock/financials-reported', {
      params: {
        symbol: req.params.symbol,
        freq: 'quarterly',
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/stocks/10k/:symbol
// Get annual financial statements for a company
// https://finnhub.io/api/v1/stock/financials-reported?symbol=AAPL&freq=annual
router.get('/10k/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'stock/financials-reported', {
      params: {
        symbol: req.params.symbol,
        freq: 'annual',
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/calendar
// Get historical (past month) and coming earnings (coming month)
// https://finnhub.io/api/v1/calendar/earnings?from=2020-03-12&to=2020-03-15
router.get('/calendar', (req, res) => {
  axios
    .get(baseUrl + 'calendar/earnings', {
      params: {
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        to: new Date(),
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/price/:symbol
// Get current price
// https://finnhub.io/api/v1/quote?symbol=AAPL
router.get('/price/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'quote', {
      params: {
        symbol: req.params.symbol.toUpperCase(),
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

// GET /api/chart/:symbol
// Get historical prices
// https://finnhub.io/api/v1/quote?symbol=AAPL
router.get('/chart/:symbol', (req, res) => {
  axios
    .get(baseUrl + 'stock/candle', {
      params: {
        resolution: 'D',
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          .getTime()
          .toString()
          .substr(0, 10),
        to: Date.now().toString().substr(0, 10),
        symbol: req.params.symbol.toUpperCase(),
        token: token,
      },
    })
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
});

router.get('/test/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  getSymbolInfo(symbol)
    .then((e) => {
      res.send(e.description);
    })
    .catch((e) => console.log(e));
});

//  Get info on one symbol
const getSymbolInfo = async (symbol) => {
  return await axios
    .get(baseUrl + 'stock/symbol', {
      params: { exchange: 'US', token: token },
    })
    .then((response) => {
      const { data } = response;
      return data.find((s) => s.symbol === symbol);
    })
    .catch((err) => {
      return new Error(
        'I encountered a problem while connecting to Finnhub API:',
        err.message
      );
    });
};

module.exports = router;
