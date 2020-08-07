const express = require('express');
const server = express();
server.set('view engine', 'ejs');
server.use(express.json());
server.use(express.static('public'));
server.use(
  express.static('node_modules/@fortawesome/fontawesome-free/css/all.css')
);
const index = require('./routes/index');
server.use(index);
const stock = require('./routes/stock');
server.use('/stock', stock);
const finnhubRouter = require('./routes/finnHub');
server.use('/api/stocks', finnhubRouter);

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

server.use((req, res) =>
  res.status(404).render('404', { title: 'Page not found' })
);
