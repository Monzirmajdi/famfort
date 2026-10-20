const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('a[href^="#"]').forEach((item) => item.removeAttribute('data-active'));
    link.setAttribute('data-active', 'true');
  });
});
