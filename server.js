const express = require('express');
const config = require('config');

const server = express();

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));

console.log(config.get('apiKey'));
