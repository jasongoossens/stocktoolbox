const axios = require('axios');
const config = require('config');
const e = require('express');

const baseUrl = 'https://finnhub.io/api/v1/';
const token = config.get('finnHubApiKey');

const showIndex = (req, res) => {
  let data = [];

  Promise.all([
    axios.get(baseUrl + 'news/', {
      params: {
        category: 'general',
        token: token,
      },
    }),
    axios.get(baseUrl + 'calendar/earnings', {
      params: {
        from: new Date(
          new Date().setDate(new Date().getDate() - 5)
        ).toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        to: new Date(
          new Date().setDate(new Date().getDate() + 5)
        ).toLocaleDateString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        token: token,
      },
    }),
  ])
    .then((response) => {
      response.map((r) => {
        data.push(r.data);
      });
      const [news, calendar] = data;

      const earningsCalendar = sanitizeEarningsData(calendar);
      console.log(earningsCalendar);
      res.render('index', { title: 'Index', news, earningsCalendar });
    })
    .catch((error) => console.log('Something went wrong:', error));
};

function sanitizeEarningsData(calendar) {
  let { earningsCalendar } = calendar;
  earningsCalendar = earningsCalendar.filter((event) => event.epsEstimate != 0);

  return earningsCalendar;
}

module.exports = { showIndex };
