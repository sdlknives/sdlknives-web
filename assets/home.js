// Interaksi modern untuk beranda: animasi angka dan parallax bentuk
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    const raw = el.getAttribute('data-count') || '0';
    const isDecimal = raw.includes('.') || raw.includes(',');
    const target = parseFloat(raw.replace(',', '.')) || 0;
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      let val;
      if (isDecimal) {
        val = (target * p).toFixed(1);
      } else {
        val = Math.floor(target * p).toLocaleString('id-ID');
      }
      el.textContent = val;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setupCounters() {
    const stats = document.querySelectorAll('.stat .num');
    if (!stats.length) return;
    if (prefersReduced) { stats.forEach(s => s.textContent = parseInt(s.getAttribute('data-count')||'0',10)); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(s => io.observe(s));
  }

  function setupHeroParallax() {
    const container = document.querySelector('.hero-home');
    const dots = document.querySelectorAll('.hero-shapes .dot');
    if (!container || !dots.length) return;
    if (prefersReduced) return;
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      dots.forEach((d, i) => {
        const dx = (x - 0.5) * (10 + i * 6);
        const dy = (y - 0.5) * (10 + i * 6);
        d.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });
    container.addEventListener('mouseleave', () => {
      dots.forEach(d => d.style.transform = 'translate(0,0)');
    });
  }

  function setupTypewriter() {
    const el = document.querySelector('#tentang .typewriter');
    if (!el) return;
    if (prefersReduced) return;
    const words = (el.getAttribute('data-words') || '').split(';').map(s => s.trim()).filter(Boolean);
    if (!words.length) return;
    const speed = parseInt(el.getAttribute('data-speed') || '70', 10);
    let i = 0, j = 0, deleting = false;
    function tick() {
      const word = words[i] || '';
      if (!deleting) {
        j++;
        if (j > word.length) { deleting = true; setTimeout(tick, 800); return; }
      } else {
        j--;
        if (j === 0) { deleting = false; i = (i + 1) % words.length; }
      }
      el.textContent = word.slice(0, Math.max(0, j));
      setTimeout(tick, deleting ? Math.max(30, speed * 0.6) : speed);
    }
    tick();
  }

  // Hero mosaic: gabungkan 8 foto lokal menjadi satu latar grid (tanpa slide)
  function setupHeroSlideshow(mode = 'default'){
    const hero = document.querySelector('#hero');
    const a = hero?.querySelector('.hero-bg.bg-a');
    const b = hero?.querySelector('.hero-bg.bg-b');
    if (!hero || !a) return;
    if (b) b.style.display = 'none';

    const sources = [
      'foto/bg1 (1).jpg','foto/bg1 (2).jpg','foto/bg1 (3).jpg','foto/bg1 (4).jpg',
      'foto/bg1 (5).jpg','foto/bg1 (6).jpg','foto/bg1 (7).jpg','foto/bg1 (8).jpg'
    ];

    // Bangun grid mosaic di dalam layer bg-a dengan animasi halus
    const mosaic = document.createElement('div');
    mosaic.className = 'hero-mosaic';

    // Range animasi berdasarkan mode
    const cfg = {
      default: { scaleMin: 1.08, scaleMax: 1.14, pan: 6, durMin: 10, durMax: 17, parallax: 8 },
      dramatic: { scaleMin: 1.12, scaleMax: 1.20, pan: 12, durMin: 12, durMax: 18, parallax: 12 },
      calm: { scaleMin: 1.04, scaleMax: 1.08, pan: 4, durMin: 10, durMax: 14, parallax: 4 }
    }[mode] || {
      scaleMin: 1.08, scaleMax: 1.14, pan: 6, durMin: 10, durMax: 17, parallax: 8
    };

    sources.forEach((src, idx) => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      // Hilangkan span vertikal/horizontal agar grid padat tanpa celah

      const img = document.createElement('div');
      img.className = 'img';
      img.style.backgroundImage = `url('${src}')`;
      // Randomisasi parameter animasi agar tiap tile unik
      const dur = cfg.durMin + Math.floor(Math.random() * (cfg.durMax - cfg.durMin + 1));
      const delay = -Math.floor(Math.random() * 6); // desinkron negatif 0–5s
      const scale = cfg.scaleMin + (Math.random() * (cfg.scaleMax - cfg.scaleMin));
      const tx = (Math.random() * (cfg.pan * 2) - cfg.pan) | 0; // -pan..pan px
      const ty = (Math.random() * (cfg.pan * 2) - cfg.pan) | 0; // -pan..pan px
      img.style.setProperty('--dur', `${dur}s`);
      img.style.setProperty('--delay', `${delay}s`);
      img.style.setProperty('--scale', scale.toFixed(2));
      img.style.setProperty('--tx', `${tx}px`);
      img.style.setProperty('--ty', `${ty}px`);

      tile.appendChild(img);
      mosaic.appendChild(tile);
    });
    a.innerHTML = '';
    a.appendChild(mosaic);
    a.style.opacity = '1';

    // Parallax ringan pada mosaic mengikuti gerakan mouse (jika tidak reduce motion)
    if (!prefersReduced) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0..1
        const y = (e.clientY - rect.top) / rect.height; // 0..1
        const dx = (x - 0.5) * cfg.parallax; // amplitudo sesuai mode
        const dy = (y - 0.5) * cfg.parallax;
        mosaic.classList.add('is-parallaxing');
        mosaic.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
      hero.addEventListener('mouseleave', () => {
        mosaic.classList.remove('is-parallaxing');
        mosaic.style.transform = 'translate3d(0,0,0)';
      });
    }

    // Perkuat kontras teks hero dan aktifkan tipografi elegan
    hero.classList.add('contrast-strong', 'hero-type-elegant');
    const headline = hero.querySelector('.headline');
    const sub = hero.querySelector('.sub');
    if (headline) headline.classList.add('accent-animated', 'text-gradient');
    if (sub) sub.classList.add('sub-elegant');
  }

  function init() {
    // Default: gunakan mode 'dramatic' agar lebih hidup. Bisa diganti ke 'calm'.
    setupHeroSlideshow('dramatic');
    setupCounters();
    setupHeroParallax();
    setupTypewriter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Reveal on scroll, tilt cards, magnetic buttons, scroll progress
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupReveal(){
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    els.forEach(el=> io.observe(el));
  }

  function setupTiltCards(){
    if (prefersReduced) return;
    const cards = document.querySelectorAll('.category-card, .feature-card, .adv-card, .guide-card, .shortcut-card, .review-card, .why-card, #tentang.about-card');
    cards.forEach(card=>{
      card.addEventListener('mousemove', (e)=>{
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const rx = y * -6; // rotateX
        const ry = x * 6;  // rotateY
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', ()=>{ card.style.transform = ''; });
    });
  }

  function setupMagneticButtons(){
    if (prefersReduced) return;
    const btns = document.querySelectorAll('.btn');
    btns.forEach(btn=>{
      btn.addEventListener('mousemove', (e)=>{
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const dx = (x - 0.5) * 6; const dy = (y - 0.5) * 6;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
    });
  }

  function setupScrollProgress(){
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    const update = ()=>{
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      bar.style.width = `${Math.max(0, Math.min(1, scrolled)) * 100}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Smooth scroll untuk anchor di halaman beranda
  function setupSmoothScroll(){
    const links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    function getHeaderOffset(){
      const header = document.querySelector('.site-header');
      if (!header) return 0;
      const cs = getComputedStyle(header);
      const isFixed = cs.position === 'fixed' || cs.position === 'sticky';
      if (!isFixed) return 0;
      const rect = header.getBoundingClientRect();
      const top = parseFloat(cs.top) || 0;
      return Math.max(0, rect.height - top);
    }
    links.forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  // Stagger animasi untuk grid kartu di bawah setiap h2
  function setupStagger(){
  const containers = document.querySelectorAll('.feature-grid, .category-grid, .why-grid, #tentang .stats, #tentang .about-highlights');
    if (!containers.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (!e.isIntersecting) return;
        const items = e.target.querySelectorAll(':scope > *');
        items.forEach((it, idx)=>{
          it.classList.add('stagger-item');
          it.style.setProperty('--d', `${idx * 80}ms`);
          setTimeout(()=>{ it.classList.add('show'); }, idx * 80);
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    containers.forEach(c=> io.observe(c));
  }

  // Animasi bolak-balik untuk semua kartu di beranda
  function setupCardAnimations(){
    if (prefersReduced) { document.documentElement.classList.add('reduce-motion'); return; }
    const groups = [
      '.feature-grid .feature-card',
      '.category-grid .category-card',
      '.why-grid .why-card',
      '#featuredProducts .product-card',
      '.faq-list details',
      '.advantages-grid .adv-card',
      '.guide-grid .guide-card',
      '.shortcut-grid .shortcut-card',
      '.reviews-grid .review-card'
    ];
    groups.forEach(sel => {
      const nodes = document.querySelectorAll(sel);
      nodes.forEach((el, idx) => {
        el.classList.add('animated-card');
        el.style.setProperty('--i', idx);
      });
    });
  }

  // Tampilkan sebagian produk di beranda dari API atau fallback JSON
  function setupFeaturedProducts(){
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    const rupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
    async function load(){
      try {
        const res = await fetch('api/products.php?action=list');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
      } catch(e) {
        try {
          const res2 = await fetch('data/products.json');
          const data2 = await res2.json();
          return Array.isArray(data2) ? data2 : (data2.products || []);
        } catch(_) { return []; }
      }
    }
    load().then((list)=>{
      const all = (list || []).filter(p => p && p.visible !== false);
      const picks = all.slice(0, 4);
      if (!picks.length) { container.innerHTML = '<p class="muted">Produk akan segera ditampilkan.</p>'; return; }
      container.innerHTML = picks.map(p => `
        <article class="product-card reveal">
          ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy" />` : '<div class="img" aria-hidden="true"></div>'}
          <div class="body">
            <div class="name">${p.name || 'Produk'}</div>
            <div class="price">${rupiah(p.price)}</div>
            <div class="actions"><a class="btn btn-primary" href="catalog.html"><i class="bi bi-bag"></i> Beli</a></div>
          </div>
        </article>
      `).join('');
    });
  }

  // FAQ accordion: buka satu, tutup yang lain
  function setupFAQAccordion(){
    const list = document.querySelectorAll('.faq-list details');
    if (!list.length) return;
    list.forEach(d => {
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        list.forEach(other => { if (other !== d) other.open = false; });
      });
    });
  }

  // Tracking klik sederhana: simpan hit ke localStorage + log console
  function setupClickTracking(){
    const inc = (key) => {
      try {
        const k = `track_${key}`;
        const cur = parseInt(localStorage.getItem(k) || '0', 10);
        localStorage.setItem(k, String(cur + 1));
      } catch(_) {}
      console.info('[track]', key);
    };

    // Hero WhatsApp & CTA Katalog
    document.querySelectorAll('[data-track]')?.forEach(el => {
      el.addEventListener('click', () => inc(el.getAttribute('data-track')));
    });
    // Kategori tombol Lihat
    document.querySelectorAll('.category-card .actions a')?.forEach(el => {
      el.addEventListener('click', () => inc('category-click'));
    });
    // Help FAB WhatsApp
    const fab = document.querySelector('.help-fab');
    fab?.addEventListener('click', () => inc('wa-fab'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ()=>{
      setupReveal(); setupTiltCards(); setupMagneticButtons(); setupScrollProgress(); setupSmoothScroll(); setupStagger(); setupFeaturedProducts(); setupFAQAccordion(); setupClickTracking(); setupCardAnimations();
    });
  } else {
    setupReveal(); setupTiltCards(); setupMagneticButtons(); setupScrollProgress(); setupSmoothScroll(); setupStagger(); setupFeaturedProducts(); setupFAQAccordion(); setupClickTracking(); setupCardAnimations();
  }
})();