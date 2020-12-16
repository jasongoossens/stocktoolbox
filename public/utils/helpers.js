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

const chartOne = document.getElementById('technical-chart');
const chartTwo = document.getElementById('technical-chart2');
function toggleChart() {
  if (chartOne.style.display == 'none') {
    chartOne.style.display = 'block';
    chartTwo.style.display = 'none';
  } else {
    chartOne.style.display = 'none';
    chartTwo.style.display = 'block';
  }
}
