const express = require('express');
const server = express();
const finnhubRouter = require('./routes/finnhub');

// server configuration
server.use(express.json());
server.use('/api/stocks', finnhubRouter);
const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));
