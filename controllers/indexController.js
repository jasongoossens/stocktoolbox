const axios = require('axios');
const config = require('config');

const baseUrl = 'https://finnhub.io/api/v1/';
const token = config.get('finnHubApiKey');

const showIndex = (req, res) => {
  let data;
  axios
    .get(baseUrl + 'news/', {
      params: {
        category: 'general',
        token: token,
      },
    })
    .then((response) => {
      data = response.data.filter((n) => n.category !== 'technology');
      res.render('index', { title: 'Index', data });
    })
    .catch((error) => console.log('Something went wrong:', error));
};

module.exports = { showIndex };
