(() => {
  const tape = document.getElementById('testimonialsTape');
  if (!tape) return;

  const modal = null; // Modal dinonaktifkan
  const closeBtn = null;

  const buildStars = (n = 5) => Array.from({ length: Math.max(0, Math.min(5, n)) }).map(() => '<i class="bi bi-star-fill"></i>').join('');
  const buildCard = (r, i = 0) => `
    <article class="review-card" style="--i:${i}">
      <div class="quote"><i class="bi bi-quote"></i></div>
      <p class="text">${(r.text || '').replace(/</g,'&lt;')}</p>
      <div class="meta">
        <span class="name">${r.name || 'Pelanggan'}</span>
        <span class="stars" aria-label="Rating">${buildStars(r.rating || 5)}</span>
      </div>
    </article>
  `;

  function pickSubset(items, max = 6) {
    const rated = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const unique = rated.filter((r, idx, arr) => {
      const key = (r.name || '') + (r.text || '');
      return arr.findIndex(x => ((x.name||'') + (x.text||'')) === key) === idx;
    });
    // shuffle ringan untuk variasi
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    return unique.slice(0, Math.max(1, max));
  }

  function setModal(_) { /* no-op: modal disabled */ }

  function openModal(_) { /* no-op: modal disabled */ }

  function closeModal() { /* no-op: modal disabled */ }

  function renderMarquee(items) {
    const html = items.map((r, i) => buildCard(r, i)).join('');
    // duplikasi untuk loop tanpa henti
    const htmlDup = items.map((r, i) => buildCard(r, i)).join('');
    tape.innerHTML = html + htmlDup;
    tape.classList.add('marquee');
    // Durasi dinamis berdasarkan jumlah item
    const durSec = Math.max(16, items.length * 6);
    tape.style.setProperty('--tape-duration', `${durSec}s`);
    tape.addEventListener('mouseenter', () => tape.classList.add('paused'));
    tape.addEventListener('mouseleave', () => tape.classList.remove('paused'));

    // Tombol detail dihapus, tidak ada handler
  }

  function fallback() {
    const samples = [
      { name: 'Rizal', rating: 5, text: 'Kualitas tajam dan finishing rapi. Recommended!' },
      { name: 'Ayu', rating: 5, text: 'Bedog-nya mantap untuk outdoor. Pengiriman cepat.' },
      { name: 'Deni', rating: 4, text: 'Damascus pattern cantik, cocok buat koleksi.' },
      { name: 'Sari', rating: 5, text: 'Chef knife enak dipakai, potongannya presisi.' }
    ];
    renderDisplay(samples);
  }

  function renderSlider(items) {
    tape.classList.remove('marquee');
    tape.classList.add('reviews-slider');
    tape.style.removeProperty('--tape-duration');
    tape.innerHTML = items.map((r, i) => `<div class="reviews-slide${i===0?' active':''}">${buildCard(r, i)}</div>`).join('') +
      '<div class="reviews-controls"><button class="icon-btn prev" aria-label="Sebelumnya"><i class="bi bi-chevron-left"></i></button><button class="icon-btn next" aria-label="Berikutnya"><i class="bi bi-chevron-right"></i></button></div>';
    const slides = Array.from(tape.querySelectorAll('.reviews-slide'));
    let current = 0;
    const show = (idx) => {
      current = (idx + slides.length) % slides.length;
      slides.forEach(s => s.classList.remove('active'));
      slides[current].classList.add('active');
    };
    const prev = tape.querySelector('.prev');
    const next = tape.querySelector('.next');
    let timer = setInterval(() => show(current + 1), 5000);
    const stop = () => { clearInterval(timer); };
    const start = () => { stop(); timer = setInterval(() => show(current + 1), 5000); };
    prev?.addEventListener('click', () => { show(current - 1); stop(); });
    next?.addEventListener('click', () => { show(current + 1); stop(); });
    tape.addEventListener('mouseenter', stop);
    tape.addEventListener('mouseleave', start);
    // Tombol detail dihapus, tidak ada handler
  }

  function renderDisplay(items) {
    if (items.length <= 3) return renderSlider(items);
    return renderMarquee(items);
  }

  fetch('data/reviews.json')
    .then(res => res.json())
    .then(data => {
      const all = Array.isArray(data) ? data : (data.reviews || []);
      const items = pickSubset(all, 6); // tampilkan sebagian saja
      if (!items.length) return fallback();
      renderDisplay(items);
    })
    .catch(fallback);

  // Modal disabled: tidak ada handler
})();