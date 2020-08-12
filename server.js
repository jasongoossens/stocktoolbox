const express = require('express');
const server = express();
server.set('view engine', 'ejs');
server.use(express.json());
server.use(express.static('public'));
const index = require('./routes/index');
server.use(index);
const stock = require('./routes/stock');
server.use('/stock', stock);
// const finnhubRouter = require('./routes/finnHub');
// const twelveDataRouter = require('./routes/twelveData');
//server.use('/api/stocks', finnhubRouter);
// server.use('/api/stocks', twelveDataRouter);

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

server.use((req, res) =>
  res.status(404).render('404', { title: 'Page not found' })
);
