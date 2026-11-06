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

// Avaliações carregadas a partir dos textos originais confirmados.
(async function initReviews() {
  const section = document.querySelector('#avaliacoes');
  if (!section) return;
  try {
    const response = await fetch('reviews.json');
    if (!response.ok) return;
    const data = await response.json();
    const entries = Array.isArray(data.reviews) ? data.reviews.filter(item => typeof item.author === 'string' && item.author.trim() && (typeof item.text === 'string' || Number.isInteger(item.rating))) : [];
    if (!entries.length) return;
    const source = new URL(data.googleUrl);
    if (source.protocol !== 'https:' || !/(^|\.)(google\.com|google\.com\.br|goo\.gl|g\.page|maps\.app\.goo\.gl)$/.test(source.hostname)) return;
    section.querySelector('.reviews-source').href = source.href;
    const carousel = section.querySelector('.review-carousel');
    const stage = section.querySelector('.review-stage');
    const dots = section.querySelector('.review-dots');
    const counter = section.querySelector('.review-counter');
    const pause = section.querySelector('.review-pause');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0, timer = null, visible = false, paused = reduced.matches, hovering = false;
    const cards = [], buttons = [];
    entries.forEach((entry, index) => {
      const card = document.createElement('article');
      card.className = 'review-card'; card.hidden = index !== 0;
      card.setAttribute('aria-label', `Avaliação ${index + 1} de ${entries.length}`);
      const top = document.createElement('div'); top.className = 'review-top';
      const avatar = document.createElement('span'); avatar.className = 'review-avatar'; avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = entry.author.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('');
      const identity = document.createElement('div');
      const author = document.createElement('p'); author.className = 'review-author'; author.textContent = entry.author;
      const platform = document.createElement('span'); platform.className = 'review-platform'; platform.textContent = 'Avaliação publicada no Google';
      identity.append(author, platform); top.append(avatar, identity); card.append(top);
      if (Number.isInteger(entry.rating) && entry.rating >= 1 && entry.rating <= 5) {
        const stars = document.createElement('div'); stars.className = 'review-stars'; stars.setAttribute('aria-label', `${entry.rating} de 5 estrelas`); stars.textContent = '★'.repeat(entry.rating); card.append(stars);
      }
      const quote = document.createElement('blockquote'); quote.className = 'review-text';
      quote.textContent = entry.text?.trim() || 'Avaliação sem comentário escrito.';
      if (!entry.text?.trim()) quote.classList.add('review-no-text');
      card.append(quote);
      const fullReview = document.createElement('a'); fullReview.className = 'review-full text-link'; fullReview.href = source.href; fullReview.target = '_blank'; fullReview.rel = 'noopener noreferrer'; fullReview.textContent = 'Trecho da avaliação · Ler no Google ↗'; card.append(fullReview);
      stage.append(card); cards.push(card);
      const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', `Mostrar avaliação de ${entry.author}`);
      button.addEventListener('click', () => { show(index, true); schedule(); }); dots.append(button); buttons.push(button);
    });
    function show(index, announce = false) {
      current = (index + cards.length) % cards.length;
      cards.forEach((card, i) => { card.hidden = i !== current; card.classList.toggle('active', i === current); buttons[i].setAttribute('aria-current', String(i === current)); });
      counter.setAttribute('aria-live', announce ? 'polite' : 'off'); counter.textContent = `${current + 1} de ${cards.length} avaliações`;
    }
    function schedule() {
      clearTimeout(timer);
      if (cards.length < 2 || paused || hovering || !visible || document.hidden || carousel.contains(document.activeElement)) return;
      timer = setTimeout(() => { show(current + 1); schedule(); }, Math.max(8000, (entries[current].text?.length || 0) * 65));
    }
    function syncPause() { pause.setAttribute('aria-pressed', String(paused)); pause.textContent = paused ? 'Reproduzir' : 'Pausar'; }
    pause.addEventListener('click', () => { paused = !paused; syncPause(); schedule(); });
    section.querySelector('[data-review-prev]').addEventListener('click', () => { show(current - 1, true); schedule(); });
    section.querySelector('[data-review-next]').addEventListener('click', () => { show(current + 1, true); schedule(); });
    carousel.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1), true); schedule(); } });
    carousel.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    carousel.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    carousel.addEventListener('focusin', schedule);
    carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', () => { if (reduced.matches) { paused = true; syncPause(); schedule(); } });
    show(0); syncPause(); section.hidden = false;
    if ('IntersectionObserver' in window) {
      if (!reduced.matches) section.classList.add('reveal-pending');
      const observer = new IntersectionObserver(items => { items.forEach(item => { visible = item.isIntersecting; if (visible) section.classList.remove('reveal-pending'); schedule(); }); }, { threshold: 0.15 });
      observer.observe(section);
    } else { visible = true; schedule(); }
  } catch (error) { console.warn('Não foi possível carregar as avaliações.', error); }
})();
