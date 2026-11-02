const whatsapp = new URL('https://wa.me/5581988429803');
whatsapp.searchParams.set('text', 'Olá, Analúcia! Conheci seu site e gostaria de saber mais sobre o atendimento on-line.');
document.querySelectorAll('[data-whatsapp]').forEach(link => { link.href = whatsapp.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; });
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const opened = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(opened)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();
