const theme = localStorage.getItem('theme');
const toggler = document.querySelector('#toggler');
const body = document.body;

if (theme === 'colorful') {
  toggler.classList.remove('fa-star-o');
  toggler.classList.add('fa-star');
  body.classList.remove('light');
  body.classList.add('colorful');
} else {
  toggler.classList.remove('fa-star');
  toggler.classList.add('fa-star-o');
  body.classList.add('light');
  body.classList.remove('colorful');
}

function switchTheme() {
  if (body.classList.contains('colorful')) {
    toggler.classList.add('fa-star-o');
    toggler.classList.remove('fa-star');
    body.classList.remove('colorful');
    body.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    toggler.classList.remove('fa-star-o');
    toggler.classList.add('fa-star');
    body.classList.remove('light');
    body.classList.add('colorful');
    localStorage.setItem('theme', 'colorful');
  }
}

function toggleBetweenIndicesAndEtfs() {
  const toggler = document.querySelector('#chart-toggler');
  if (toggler.classList.contains('fa-line-chart')) {
    toggler.classList.remove('fa-line-chart');
    toggler.classList.add('fa-bar-chart');
  } else {
    toggler.classList.remove('fa-bar-chart');
    toggler.classList.add('fa-line-chart');
  }
}
