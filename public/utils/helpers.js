function switchTheme() {
  const toggler = document.querySelector('#toggler');
  const body = document.body;

  if (body.classList.contains('barebones')) {
    toggler.classList.remove('fa-star-o');
    body.classList.remove('barebones');
    toggler.classList.add('fa-star');
    body.classList.add('colorful');
  } else {
    body.classList.remove('colorful');
    toggler.classList.remove('fa-star');
    body.classList.add('barebones');
    toggler.classList.add('fa-star-o');
  }
}
