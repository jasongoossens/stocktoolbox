const express = require('express');
const server = express();
const main = require('./routes/main');
const finnhubRouter = require('./routes/finnHub');

// server configuration
server.set('view engine', 'ejs');
server.use(express.json());
server.use('/api/stocks', finnhubRouter);
server.use('/', main);
const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

server.use((req, res) =>
  res.status(404).render('404', { title: 'Page not found' })
);