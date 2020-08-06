const express = require('express');
const server = express();
server.use(express.json());
const main = require('./routes/main');
server.use('/', main);
const finnhubRouter = require('./routes/finnHub');
server.use('/api/stocks', finnhubRouter);

server.set('view engine', 'ejs');
const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

server.use((req, res) =>
  res.status(404).render('404', { title: 'Page not found' })
);
