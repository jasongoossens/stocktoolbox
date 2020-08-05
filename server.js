const express = require('express');
const server = express();
const finnhubRouter = require('./routes/finnhub');

// server configuration
server.set('view engine', 'ejs');
server.use(express.json());
server.use('/api/stocks', finnhubRouter);
const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

server.get('/', (req, res) => res.render('index', { title: 'Index' }));
server.use((req, res) =>
  res.status(404).render('404', { title: 'Page not found' })
);

// https://stackoverflow.com/questions/25225240/how-do-i-store-a-value-from-an-api-call-with-node-js-express-and-mikeals-npm-re
