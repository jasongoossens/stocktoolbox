const express = require('express');
const server = express();
server.disable('etag').disable('x-powered-by');
server.set('view engine', 'ejs');
const cookieParser = require('cookie-parser');
server.use(cookieParser());
server.use(express.json());
server.use(express.static('public'));
const index = require('./routes/index');
server.use(index);
const stock = require('./routes/stock');
server.use('/stock', stock);

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

server.use((req, res) =>
  res.status(404).render('404', { title: 'Page not found' })
);
