(() => {
  const root = document.querySelector('.featured-slider');
  const sliderEl = document.getElementById('featuredSlider');
  if (!root || !sliderEl) return;

  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');
  const dotsEl = root.querySelector('.dots');

  let current = 0;
  let slides = [];
  let timer = null;

  const categoryFrom = (name = '') => {
    const s = name.toLowerCase();
    if (s.includes('katana') || s.includes('samurai')) return 'katana';
    if (s.includes('bedog') || s.includes('golok')) return 'bedog';
    if (s.includes('damascus')) return 'damascus';
    return 'umum';
  };

  const labelOf = (cat) => ({ katana: 'Katana', bedog: 'Bedog', damascus: 'Damascus', umum: 'Produk' })[cat] || 'Produk';

  function buildSlide(p, cat, idx = 0) {
    const el = document.createElement('div');
    el.className = 'slide';
    if (p && p.imageUrl) {
      const img = document.createElement('img');
      img.loading = idx === 0 ? 'eager' : 'lazy';
      if (idx === 0) img.fetchPriority = 'high';
      img.src = p.imageUrl;
      img.alt = p.name;
      el.appendChild(img);
    } else {
      el.classList.add('fallback');
      const visual = document.createElement('div');
      visual.className = 'visual';
      el.appendChild(visual);
    }

    const cap = document.createElement('div');
    cap.className = 'caption';
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = labelOf(cat);
    const title = document.createElement('span');
    title.textContent = `— ${p.name}`;
    const cta = document.createElement('a');
    cta.className = 'btn btn-primary';
    cta.href = `catalog.html#${cat}`;
    cta.innerHTML = '<i class="bi bi-bag"></i> Lihat Katalog';
    cap.appendChild(pill);
    cap.appendChild(title);
    cap.appendChild(cta);
    el.appendChild(cap);
    return el;
  }

  function show(idx) {
    if (!slides.length) return;
    current = (idx + slides.length) % slides.length;
    const all = sliderEl.querySelectorAll('.slide');
    all.forEach(s => s.classList.remove('active'));
    all[current]?.classList.add('active');
    const dots = dotsEl.querySelectorAll('.dot');
    dots.forEach(d => d.classList.remove('active'));
    dots[current]?.classList.add('active');
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }
  function startAutoplay() { stopAutoplay(); timer = setInterval(next, 5000); }
  function stopAutoplay() { if (timer) { clearInterval(timer); timer = null; } }

  prevBtn?.addEventListener('click', () => { prev(); stopAutoplay(); });
  nextBtn?.addEventListener('click', () => { next(); stopAutoplay(); });
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);

  fetch('api/products.php?action=list')
    .then(res => res.json())
    .then(data => {
      const products = (data.products || []).filter(p => p.visible !== false);
      const preferred = ['katana', 'bedog', 'damascus'];
      let picks = preferred.map(cat => products.find(p => categoryFrom(p.name) === cat) || null);
      const hasAny = picks.some(Boolean);
      if (!hasAny) {
        picks = preferred.map(cat => ({ name: `${labelOf(cat)} Unggulan`, imageUrl: '', fallback: true, _cat: cat }));
      }

      // Render slides
      sliderEl.innerHTML = '';
      picks.forEach((p, i) => {
        const cat = p._cat || categoryFrom(p.name);
        const s = buildSlide(p, cat, i);
        if (p.fallback) s.classList.add(`theme-${cat}`);
        sliderEl.appendChild(s);
      });
      // Init active
      sliderEl.firstElementChild?.classList.add('active');
      // Render dots
      dotsEl.innerHTML = picks.map((_, i) => `<button class="dot${i===0?' active':''}" aria-label="Slide ${i+1}"></button>`).join('');
      dotsEl.querySelectorAll('.dot').forEach((d, i) => d.addEventListener('click', () => { show(i); stopAutoplay(); }));
      slides = Array.from(sliderEl.querySelectorAll('.slide'));
      startAutoplay();
    })
    .catch(() => { /* ignore error; slider tidak dirender */ });
})();