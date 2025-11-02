// Catalog page inline logic moved to external file to comply with CSP
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const net = navigator.connection && navigator.connection.effectiveType ? navigator.connection.effectiveType : '';
window.__catalogModern = true;
const WHATSAPP_NUMBER = '6287767896317';

const rupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const buildWA = (p) => {
  const message = `Halo Admin SDL KNIVES,%0A%0A` +
    `Saya ingin konsultasi gratis personalisasi bilah & sarung.%0A` +
    `Produk: ${encodeURIComponent(p.name)}%0A` +
    `Harga Produk: ${encodeURIComponent(rupiah(p.price))}%0A` +
    `Gambar: ${encodeURIComponent(p.imageUrl)}%0A` +
    `Link Katalog: ${encodeURIComponent(window.location.href)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};

async function loadProducts() {
  const el = document.getElementById('catalog');
  el.setAttribute('aria-busy', 'true');
  el.innerHTML = '<div class="card" role="status" aria-live="polite">Memuat data produk…</div>';
  async function renderList(products){
    if (!Array.isArray(products) || !products.length) {
      el.innerHTML = '<div class="card" role="status" aria-live="polite">Belum ada produk ditampilkan.</div>';
      el.removeAttribute('aria-busy');
      return;
    }
    el.innerHTML = products.filter(p => p.visible !== false).map(p => `
      <article class="product-card" data-id="${p.id}">
        <a class="image-link" href="product.html?id=${p.id}" aria-label="Lihat detail ${p.name}">
          <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </a>
        <div class="body">
          <h3 class="name"><i class="bi ${iconFor(inferCategory(p.name))}"></i> ${p.name}</h3>
          <div class="price">${rupiah(p.price)}</div>
${(p.enableEngrave === true) ? `<div class="engrave-offer"><i class="bi bi-pencil-square"></i> Personalize bilah & sarung — konsultasi gratis</div>` : ''}
          <p>${p.description || ''}</p>
          <a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="${buildWA(p)}"><i class="bi bi-whatsapp"></i> Beli via WA</a>
        </div>
      </article>
    `).join('');
    el.removeAttribute('aria-busy');
  }

  try {
    const res = await fetch('api/products.php?action=list');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    await renderList(data.products || []);
  } catch (e) {
    try {
      const res2 = await fetch('data/products.json');
      const data2 = await res2.json();
      await renderList(data2.products || []);
    } catch (e2) {
      el.innerHTML = `<div class="card" role="alert">Gagal memuat data produk.</div>`;
      el.removeAttribute('aria-busy');
    }
  }
}

function inferCategory(name = '') {
  const s = name.toLowerCase();
  if (s.includes('pisau')) return 'pisau';
  if (s.includes('carok')) return 'carok';
  if (s.includes('paket') || s.includes('paketan')) return 'paketan';
  if (s.includes('kampak') || s.includes('kapak') || s.includes('kopak')) return 'kampak';
  if (s.includes('katana') || s.includes('samurai')) return 'katana';
  if (s.includes('Golok') || s.includes('golok')) return 'Golok';
  if (s.includes('damascus')) return 'damascus';
  if (s.includes('alat') || s.includes('aksesori') || s.includes('sarung') || s.includes('sheath') || s.includes('batu asah') || s.includes('whetstone')) return 'alat';
  if (s.includes('chef') || s.includes('dapur')) return 'dapur';
  if (s.includes('lipat') || s.includes('edc')) return 'edc';
  return 'umum';
}

function categoryLabel(cat) {
  return ({ pisau: 'Pisau', carok: 'Carok', paketan: 'Paketan', kampak: 'Kampak', katana: 'Katana', Golok: 'Golok', damascus: 'Damascus', dapur: 'Dapur', edc: 'EDC', alat: 'Alat & Aksesori', umum: 'Umum' })[cat] || 'Umum';
}

function iconFor(cat) {
  const map = {
    pisau: 'bi-scissors',
    carok: 'bi-lightning-charge',
    paketan: 'bi-box-seam',
    kampak: 'bi-hammer',
    katana: 'bi-stars',
    Golok: 'bi-shield-check',
    damascus: 'bi-gem',
    dapur: 'bi-egg-fried',
    edc: 'bi-backpack',
    alat: 'bi-tools',
    umum: 'bi-award'
  };
  return map[cat] || map.umum;
}

const MICRO_COPY = {
  pisau: 'Beragam pisau untuk kebutuhan harian maupun koleksi.',
  carok: 'Bilah khas carok dengan karakter tajam dan tradisi kuat.',
  paketan: 'Bundel hemat: kombinasi produk terbaik dalam satu paket.',
  kampak: 'Kampak/kapak untuk kerja berat, outdoor, dan utilitas.',
  katana: 'Bilahan panjang bergaya samurai untuk koleksi dan display elegan.',
  Golok: 'Pisau tradisional serbaguna untuk kerja berat dan aktivitas outdoor.',
  damascus: 'Eksotis dengan pola lipatan baja, performa sekaligus estetika.',
  dapur: 'Chef knife dan utilitas dapur untuk presisi memasak harian.',
  edc: 'Pisau lipat praktis untuk penggunaan harian (Everyday Carry).',
  alat: 'Sarung, perawatan, batu asah dan aksesori pendukung lainnya.'
};

const ACCENTS = {
  all: ['#8a2be2','#ef4444','#f59e0b'],
  pisau: ['#ef4444','#f59e0b','#8a2be2'],
  carok: ['#b91c1c','#ef4444','#f59e0b'],
  paketan: ['#22c55e','#14b8a6','#06b6d4'],
  kampak: ['#475569','#64748b','#94a3b8'],
  katana: ['#b91c1c','#d4af37','#f59e0b'],
  Golok: ['#15803d','#22c55e','#10b981'],
  damascus: ['#b91c1c','#ef4444','#f59e0b'],
  dapur: ['#fb7185','#f97316','#f59e0b'],
  edc: ['#8b5cf6','#a78bfa','#c084fc'],
  alat: ['#475569','#64748b','#94a3b8']
};

function applyTheme(cat = 'all') {
  const [a1, a2, a3] = ACCENTS[cat] || ACCENTS.all;
  const root = document.documentElement;
  root.style.setProperty('--accent-1', a1);
  root.style.setProperty('--accent-2', a2);
  root.style.setProperty('--accent-3', a3);
}

function updateBanner(cat = 'all') {
  const titleEl = document.querySelector('.banner h1');
  const heroEl = document.getElementById('categoryHero');
  const iconMap = { pisau: 'bi-scissors', carok: 'bi-lightning-charge', paketan: 'bi-box-seam', kampak: 'bi-hammer', katana: 'bi-lightning-charge', Golok: 'bi-fire', damascus: 'bi-gem', dapur: 'bi-basket', edc: 'bi-gear', alat: 'bi-tools', all: 'bi-stars' };
  const label = cat === 'all' ? 'Golok & Katana Collection' : `${categoryLabel(cat)} Collection`;
  if (titleEl) {
    titleEl.classList.remove('swap');
    void titleEl.offsetWidth;
    titleEl.textContent = label;
    titleEl.classList.add('swap');
  }
  if (heroEl) {
    heroEl.classList.remove('swap');
    void heroEl.offsetWidth;
    heroEl.innerHTML = `<i class="bi ${iconMap[cat] || 'bi-stars'}"></i><span>${MICRO_COPY[cat] || 'Telusuri koleksi premium kami.'}</span>`;
    heroEl.classList.add('swap');
  }
}

const HERO_IMAGES = [
  'produk/golok4.jpg',
  'produk/mandau.jpg',
  'produk/kukri.jpg',
  'produk/krambit.jpg',
  'produk/jumbo.jpg',
  'produk/chopper.jpg',
  'produk/fillet.jpg',
  'produk/pisau.jpg'
].filter(src => !!src);

function setupHeroRotation() {
  const el = document.querySelector('.banner .hero-bg');
  if (!el || !HERO_IMAGES.length) return;
  let i = 0;
  const setBg = (src) => {
    el.classList.remove('fade-in');
    void el.offsetWidth;
    el.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.25)), url('${src}')`;
    el.classList.add('fade-in');
  };
  setBg(HERO_IMAGES[0]);
  const delay = (prefersReduced || net === '2g' || net === 'slow-2g') ? 9000 : 5000;
  setInterval(() => {
    i = (i + 1) % HERO_IMAGES.length;
    setBg(HERO_IMAGES[i]);
  }, delay);
}
document.addEventListener('DOMContentLoaded', setupHeroRotation);

let PRODUCTS = [];
let PAGE = 1;
const PAGE_SIZE = 6;
let SORT = 'asc';
let SHOW_PREVIOUS = true;

function renderCatalog(list) {
  const el = document.getElementById('catalog');
  if (!list.length) { el.innerHTML = '<div class="card" role="status" aria-live="polite">Belum ada produk ditampilkan.</div>'; return; }
  el.innerHTML = list.map((p, i) => {
    const imgs = Array.isArray(p.images) && p.images.length ? p.images : [p.imageUrl].filter(Boolean);
    const alt = imgs[1] || '';
    const features = [
      'Handmade',
      (String(p.name||'').toLowerCase().includes('damascus') ? 'Baja Damascus' : null),
      (p.enableEngrave ? 'Ukir Custom' : null)
    ].filter(Boolean);
    return `
    <article class="product-card on-scroll reveal rich" data-id="${p.id}" data-index="${i}">
      <div class="ribbon">${categoryLabel(p.category || inferCategory(p.name))}</div>
      <span class="stock-badge ${((p.visible===false)?'sold':'')}">${(p.visible===false)?'Terjual':'Ready'}</span>
      <div class="image-wrap">
        <a class="image-link" href="product.html?id=${p.id}" aria-label="Lihat detail ${p.name}">
          <img loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw" src="${imgs[0] || ''}" data-alt="${alt}" alt="${p.name}" />
        </a>
        <button class="quick-view" data-id="${p.id}" aria-label="Quick View"><i class="bi bi-eye"></i></button>
      </div>
      <div class="body">
        <h3 class="name"><i class="bi ${iconFor(p.category || inferCategory(p.name))}"></i> ${p.name}</h3>
        <div class="meta-row">
          <div class="price price-tag"><span class="dot"></span>${rupiah(p.price)}</div>
          <div class="rating" aria-label="Rating 5 dari 5">
            <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
          </div>
        </div>
        ${(p.enableEngrave === true) ? `<div class=\"engrave-offer\"><i class=\"bi bi-pencil-square\"></i> Personalize bilah & sarung — konsultasi gratis</div>` : ''}
        ${features.length ? `<div class="features">${features.map(f => `<span class="pill">${f}</span>`).join(' ')}</div>` : ''}
        <p class="desc">${p.description || ''}</p>
        <div class="actions" style="display:flex; gap:8px; flex-wrap:wrap;">
          <a class="btn detail-btn" href="product.html?id=${p.id}" data-id="${p.id}"><i class="bi bi-eye"></i> Detail</a>
          <a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="${buildWA(p)}"><i class="bi bi-whatsapp"></i> Beli via WA</a>
        </div>
      </div>
    </article>`;
  }).join('');
  setupDetailEvents();
  setupHoverSwap();
  prioritizeVisibleImages();
}

function appendCatalog(list) {
  const el = document.getElementById('catalog');
  if (!list.length) return;
  const html = list.map((p, i) => {
    const imgs = Array.isArray(p.images) && p.images.length ? p.images : [p.imageUrl].filter(Boolean);
    const alt = imgs[1] || '';
    const features = [
      'Handmade',
      (String(p.name||'').toLowerCase().includes('damascus') ? 'Baja Damascus' : null),
      (p.enableEngrave ? 'Ukir Custom' : null)
    ].filter(Boolean);
    return `
    <article class="product-card on-scroll reveal rich" data-id="${p.id}" data-index="${i}">
      <div class="ribbon">${categoryLabel(p.category || inferCategory(p.name))}</div>
      <span class="stock-badge ${((p.visible===false)?'sold':'')}">${(p.visible===false)?'Terjual':'Ready'}</span>
      <div class="image-wrap">
        <img loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw" src="${imgs[0] || ''}" data-alt="${alt}" alt="${p.name}" />
        <button class="quick-view" data-id="${p.id}" aria-label="Quick View"><i class="bi bi-eye"></i></button>
      </div>
      <div class="body">
        <h3 class="name"><i class="bi ${iconFor(p.category || inferCategory(p.name))}"></i> ${p.name}</h3>
        <div class="meta-row">
          <div class="price price-tag"><span class="dot"></span>${rupiah(p.price)}</div>
          <div class="rating" aria-label="Rating 5 dari 5">
            <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
          </div>
        </div>
        ${(p.enableEngrave === true) ? `<div class=\"engrave-offer\"><i class=\"bi bi-pencil-square\"></i> Personalize bilah & sarung — konsultasi gratis</div>` : ''}
        ${features.length ? `<div class="features">${features.map(f => `<span class="pill">${f}</span>`).join(' ')}</div>` : ''}
        <p class="desc">${p.description || ''}</p>
        <div class="actions" style="display:flex; gap:8px; flex-wrap:wrap;">
          <a class="btn detail-btn" href="product.html?id=${p.id}" data-id="${p.id}"><i class="bi bi-eye"></i> Detail</a>
          <a class="btn btn-primary" target="_blank" href="${buildWA(p)}"><i class="bi bi-whatsapp"></i> Konsultasi Gratis & Beli</a>
        </div>
      </div>
    </article>`;
  }).join('');
  el.insertAdjacentHTML('beforeend', html);
  setupDetailEvents();
  setupHoverSwap();
  prioritizeVisibleImages();
}

function renderBySections(listAll) {
  const el = document.getElementById('catalog');
  const order = ['katana', 'Golok', 'damascus', 'dapur', 'edc', 'alat', 'umum'];
  const sections = order.map(cat => {
    const items = listAll.filter(p => p.category === cat);
    if (!items.length) return '';
    const heading = `<h2 id="${cat}" class="section-title">${categoryLabel(cat)} <a class="link" href="#${cat}">Lihat semua</a></h2>`;
    const copy = MICRO_COPY[cat] ? `<p class="muted" style="margin:-6px 0 10px 0;">${MICRO_COPY[cat]}</p>` : '';
    const grid = `<section class="grid">
      ${items.map((p, i) => `
        <article class="product-card on-scroll reveal" data-id="${p.id}" data-index="${i}">
          <div class="ribbon">${categoryLabel(p.category)}</div>
          <span class="stock-badge ${((p.visible===false)?'sold':'')}">${(p.visible===false)?'Terjual':'Ready'}</span>
          <img loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw" src="${p.imageUrl}" alt="${p.name}" />
          <div class="body">
            <h3 class="name"><i class="bi ${iconFor(p.category || inferCategory(p.name))}"></i> ${p.name}</h3>
            <div class="price price-tag"><span class="dot"></span>${rupiah(p.price)}</div>
            ${(p.enableEngrave === true) ? `<div class="engrave-offer"><i class="bi bi-pencil-square"></i> Ukir custom bilah tersedia</div>` : ''}
            <p>${p.description || ''}</p>
            <div class="actions" style="display:flex; gap:8px; flex-wrap:wrap;">
              <a class="btn detail-btn" href="product.html?id=${p.id}" data-id="${p.id}"><i class="bi bi-eye"></i> Detail</a>
              <a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="${buildWA(p)}"><i class="bi bi-whatsapp"></i> Beli via WA</a>
            </div>
          </div>
        </article>
      `).join('')}
    </section>`;
    return `${heading}${copy}${grid}`;
  }).filter(Boolean).join('\n');
  el.innerHTML = sections || '<div class="card" role="status" aria-live="polite">Belum ada produk ditampilkan.</div>';
  setupDetailEvents();
}

function renderUnifiedGrid(listAll) {
  const el = document.getElementById('catalog');
  const html = listAll.map((p, i) => `
    <article class="product-card on-scroll reveal" data-id="${p.id}" data-index="${i}">
      <span class="stock-badge ${((p.visible===false)?'sold':'')}">${(p.visible===false)?'Terjual':'Ready'}</span>
      <img loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw" src="${p.imageUrl}" alt="${p.name}" />
      <div class="body">
        <h3 class="name"><i class="bi ${iconFor(p.category || inferCategory(p.name))}"></i> ${p.name}</h3>
        <div class="price price-tag"><span class="dot"></span>${rupiah(p.price)}</div>
        ${(p.enableEngrave === true) ? `<div class=\"engrave-offer\"><i class=\"bi bi-pencil-square\"></i> Ukir custom bilah tersedia</div>` : ''}
        <p>${p.description || ''}</p>
        <div class="actions" style="display:flex; gap:8px; flex-wrap:wrap;">
          <a class="btn detail-btn" href="product.html?id=${p.id}" data-id="${p.id}"><i class="bi bi-eye"></i> Detail ${p.name}</a>
          <a class="btn btn-primary" target="_blank" href="${buildWA(p)}"><i class="bi bi-whatsapp"></i> Beli via WA</a>
        </div>
      </div>
    </article>
  `).join('');
  el.innerHTML = html || '<div class="card" role="status" aria-live="polite">Belum ada produk ditampilkan.</div>';
  setupDetailEvents();
}

function sortList(list) {
  if (SORT === 'newest') {
    const getNum = (id) => parseInt(String(id).replace(/\D/g, '') || '0', 10);
    return [...list].sort((a, b) => getNum(b.id) - getNum(a.id));
  }
  return [...list].sort((a, b) => SORT === 'asc' ? (a.price - b.price) : (b.price - a.price));
}

function updatePager(total) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  PAGE = Math.min(Math.max(1, PAGE), totalPages);
  const pageInfo = document.getElementById('pageInfo');
  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  if (pageInfo) pageInfo.textContent = `Halaman ${PAGE}/${totalPages}`;
  if (prev) { prev.disabled = PAGE <= 1; prev.setAttribute('aria-disabled', prev.disabled ? 'true' : 'false'); }
  if (next) { next.disabled = PAGE >= totalPages; next.setAttribute('aria-disabled', next.disabled ? 'true' : 'false'); }
}

function renderCategoryChips() {
  const chipsEl = document.getElementById('chips');
  if (!chipsEl) return;
  const present = new Set(PRODUCTS.map(p => p.category));
  const order = ['pisau','carok','paketan','kampak','Golok','katana','damascus','dapur','edc','alat'];
  const html = [
    `<button class="chip active" data-filter="all"><i class="bi bi-stars"></i> Semua</button>`,
    ...order.filter(cat => present.has(cat)).map(cat => `<button class="chip" data-filter="${cat}">${categoryLabel(cat)}</button>`)
  ].join('\n');
  chipsEl.innerHTML = html;
}

function setupChips() {
  renderCategoryChips();
  const chips = document.querySelectorAll('#chips .chip');
  const chipsWrap = document.getElementById('chips');
  chipsWrap?.setAttribute('role', 'toolbar');
  const params = new URLSearchParams(location.search);
  const query = (params.get('q') || '').toLowerCase();
  const searchInput = document.getElementById('searchInput');
  if (searchInput && params.get('q')) searchInput.value = params.get('q');

  let currentCat = 'all';
  const applyFilters = (cat, q) => {
    currentCat = cat || 'all';
    PAGE = 1;
    let list = SHOW_PREVIOUS ? PRODUCTS : PRODUCTS.filter(p => p.visible !== false);
    if (cat && cat !== 'all') list = list.filter(p => p.category === cat);
    if (q) list = list.filter(p => (`${p.name} ${(p.description||'')}`).toLowerCase().includes(q));
    list = sortList(list);
    applyTheme(currentCat);
    updateBanner(currentCat);
    const pagerEl = document.getElementById('pager');
    if (currentCat === 'all') {
      pagerEl?.classList.add('hidden');
      renderUnifiedGrid(list);
    } else {
      pagerEl?.classList.remove('hidden');
      updatePager(list.length);
      const start = 0;
      const end = PAGE_SIZE;
      renderCatalog(list.slice(start, end));
      const prev = document.getElementById('prevPage');
      const next = document.getElementById('nextPage');
      const loadMore = document.getElementById('loadMore');
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      if (loadMore) {
        loadMore.style.display = 'inline-block';
        loadMore.disabled = end >= list.length;
        loadMore.setAttribute('aria-disabled', loadMore.disabled ? 'true' : 'false');
      }
    }
  };

  chips.forEach(ch => {
    ch.setAttribute('aria-pressed', ch.classList.contains('active') ? 'true' : 'false');
    ch.addEventListener('click', () => {
      chips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed','false'); });
      ch.classList.add('active');
      ch.setAttribute('aria-pressed','true');
      const key = ch.dataset.filter;
      applyFilters(key, query);
    });
    ch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ch.click(); }
    });
  });

  // Toggle tampilkan produk sebelumnya (terjual/arsip)
  const prevToggle = document.getElementById('showPrevious');
  if (prevToggle && !prevToggle.dataset.bound) {
    prevToggle.dataset.bound = '1';
    prevToggle.checked = SHOW_PREVIOUS;
    prevToggle.addEventListener('change', (e) => {
      SHOW_PREVIOUS = !!e.target.checked;
      PAGE = 1;
      applyFilters(currentCat, query);
    });
  }

  let initialCat = (location.hash || '').replace('#', '') || 'all';
  if (![...chips].some(c => c.dataset.filter === initialCat)) initialCat = 'all';
  chips.forEach(c => { if (c.dataset.filter === initialCat) { c.classList.add('active'); c.setAttribute('aria-pressed','true'); } else { c.setAttribute('aria-pressed','false'); } });
  applyFilters(initialCat, query);

  window.addEventListener('hashchange', () => {
    const newCat = (location.hash || '').replace('#', '') || 'all';
    chips.forEach(c => { const active = c.dataset.filter === newCat; c.classList.toggle('active', active); c.setAttribute('aria-pressed', active ? 'true' : 'false'); });
    PAGE = 1;
    applyFilters(newCat, query);
  });

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      SORT = e.target.value;
      PAGE = 1;
      applyFilters(currentCat, query);
    });
  }

  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  prev?.addEventListener('click', () => { PAGE = Math.max(1, PAGE - 1); applyFilters(currentCat, query); });
  next?.addEventListener('click', () => { PAGE = PAGE + 1; applyFilters(currentCat, query); });

  const loadMore = document.getElementById('loadMore');
  if (loadMore && !loadMore.dataset.bound) {
    loadMore.dataset.bound = '1';
    loadMore.addEventListener('click', () => {
      let list = SHOW_PREVIOUS ? PRODUCTS : PRODUCTS.filter(p => p.visible !== false);
      if (currentCat && currentCat !== 'all') list = list.filter(p => p.category === currentCat);
      if (query) list = list.filter(p => (`${p.name} ${(p.description||'')}`).toLowerCase().includes(query));
      list = sortList(list);
      PAGE = PAGE + 1;
      const start = (PAGE - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      appendCatalog(list.slice(start, end));
      updatePager(list.length);
      const pageInfo = document.getElementById('pageInfo');
      if (pageInfo) pageInfo.textContent = `Halaman ${PAGE}/${Math.max(1, Math.ceil(list.length / PAGE_SIZE))}`;
      if (end >= list.length) { loadMore.disabled = true; loadMore.setAttribute('aria-disabled', 'true'); loadMore.textContent = 'Sudah semua'; }
    });
  }
}

loadProducts = async function () {
  const el = document.getElementById('catalog');
  el.innerHTML = Array.from({length: 6}).map(() => `
    <article class="product-card skeleton">
      <div class="img"></div>
      <div class="body">
        <div class="line w-50"></div>
      </div>
    </article>
  `).join('');
  // Preferensi sumber data: json | api | supabase | (fallback berurutan)
  const params = new URLSearchParams(location.search);
  const srcPref = String((window.CATALOG_SOURCE || params.get('source') || '')).toLowerCase();
  try {
    if (srcPref === 'json') {
      const resJ = await fetch('data/products.json');
      if (!resJ.ok) throw new Error(`HTTP ${resJ.status}`);
      const dataJ = await resJ.json();
      PRODUCTS = (dataJ.products || [])
        .map(p => {
          const imgs = normalizeImagesArray(p.images);
          return {
            ...p,
            images: imgs,
            imageUrl: derivePrimaryImage({ ...p, images: imgs }),
            category: p.category || inferCategory(p.name)
          };
        });
      setupChips();
      return;
    } else if (srcPref === 'api') {
      const resA = await fetch('api/products.php?action=list');
      if (!resA.ok) throw new Error(`HTTP ${resA.status}`);
      const dataA = await resA.json();
      PRODUCTS = (dataA.products || [])
        .map(p => {
          const imgs = normalizeImagesArray(p.images);
          return {
            ...p,
            images: imgs,
            imageUrl: derivePrimaryImage({ ...p, images: imgs }),
            category: p.category || inferCategory(p.name)
          };
        });
      setupChips();
      return;
    } else if (srcPref === 'supabase' && window.supaListProducts) {
      const rowsS = await window.supaListProducts();
      PRODUCTS = (rowsS || [])
        .map(p => {
          const imgs = normalizeImagesArray(p.images);
          return {
            ...p,
            id: String(p.id),
            images: imgs,
            imageUrl: derivePrimaryImage({ ...p, images: imgs }),
            enableEngrave: p.enableEngrave ?? p.enable_engrave ?? false,
            category: p.category || inferCategory(p.name)
          };
        });
      setupChips();
      return;
    }
  } catch (ePref) {
    // Jika preferensi gagal, teruskan ke fallback di bawah
  }
  try {
    if (window.supaListProducts) {
      const rows = await window.supaListProducts();
      PRODUCTS = (rows || [])
        .map(p => {
          const imgs = normalizeImagesArray(p.images);
          return {
            ...p,
            id: String(p.id),
            images: imgs,
            imageUrl: derivePrimaryImage({ ...p, images: imgs }),
            enableEngrave: p.enableEngrave ?? p.enable_engrave ?? false,
            category: p.category || inferCategory(p.name)
          };
        });
      setupChips();
    } else {
      const res = await fetch('api/products.php?action=list');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      PRODUCTS = (data.products || [])
        .map(p => {
          const imgs = normalizeImagesArray(p.images);
          return {
            ...p,
            images: imgs,
            imageUrl: derivePrimaryImage({ ...p, images: imgs }),
            category: p.category || inferCategory(p.name)
          };
        });
      setupChips();
    }
  } catch (e) {
    try {
      const res2 = await fetch('data/products.json');
      if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
      const data2 = await res2.json();
      PRODUCTS = (data2.products || [])
        .map(p => {
          const imgs = normalizeImagesArray(p.images);
          return {
            ...p,
            images: imgs,
            imageUrl: derivePrimaryImage({ ...p, images: imgs }),
            category: p.category || inferCategory(p.name)
          };
        });
      setupChips();
    } catch (e2) {
      el.innerHTML = `<div class="card" role="alert">Gagal memuat data katalog: ${(e && e.message) || ''} ${(e2 && e2.message) || ''}</div>`;
    }
  }
};

loadProducts();
window.addEventListener('load', () => { document.querySelector('#catalog')?.classList.add('visible'); }, { passive: true });

function prioritizeVisibleImages(){
  try{
    const imgs = Array.from(document.querySelectorAll('.product-card img'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach((en)=>{
        const im = en.target;
        if(en.isIntersecting){
          im.setAttribute('fetchpriority','high');
          im.setAttribute('loading','eager');
        } else {
          im.setAttribute('fetchpriority','low');
          im.setAttribute('loading','lazy');
        }
      });
    }, { rootMargin: prefersReduced ? '100px 0px' : '160px 0px', threshold: prefersReduced ? 0.02 : 0.08 });
    imgs.forEach(im=>io.observe(im));
  }catch{}
}

function setupDetailEvents() {
  const modal = document.getElementById('productModal');
  const closeEls = modal?.querySelectorAll('[data-close]');
  const openHandlers = (e) => {
    const btn = e.target.closest('.detail-btn') || e.target.closest('.quick-view') || e.target.closest('.product-card');
    if (!btn) return;
    const id = btn.dataset.id || btn.getAttribute('data-id');
    if (!id) return;
    const p = (PRODUCTS || []).find(x => x.id === id);
    if (!p) return;
    openProductModal(p);
  };
  document.querySelectorAll('.product-card').forEach(c => c.addEventListener('click', (e) => {
    if (e.target.closest('.btn') || e.target.closest('.image-link')) return;
    openHandlers(e);
  }));
  document.querySelectorAll('.quick-view').forEach(q => q.addEventListener('click', openHandlers));
  closeEls?.forEach(el => el.addEventListener('click', closeProductModal));
  modal?.addEventListener('click', (e) => { if (e.target.dataset.close) closeProductModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProductModal(); });
}

function openProductModal(p) {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  const imgs = Array.isArray(p.images) && p.images.length ? p.images : [p.imageUrl];
  const main = modal.querySelector('.gallery .main');
  const thumbs = modal.querySelector('.gallery .thumbs');
  const nameEl = modal.querySelector('.details .name');
  const priceEl = modal.querySelector('.details .price');
  const descEl = modal.querySelector('.details .desc');
  const waEl = modal.querySelector('.details .wa');
  const detailLink = modal.querySelector('.details .outline');
  // Index saat ini & setter gambar utama
  let currentIndex = 0;
  const setMain = (i) => {
    if (!main) return;
    currentIndex = (i + imgs.length) % imgs.length;
    main.src = imgs[currentIndex];
    main.alt = `${p.name} ${currentIndex+1}`;
  };
  if (main) setMain(0);
  if (thumbs) {
    thumbs.innerHTML = imgs.map((src, i) => `<img src="${src}" alt="${p.name} ${i+1}" data-src="${src}" data-index="${i}" />`).join('');
    thumbs.querySelectorAll('img').forEach(t => t.addEventListener('click', () => {
      const i = Number(t.dataset.index || 0);
      setMain(i);
    }));
  }
  if (nameEl) nameEl.textContent = p.name;
  if (priceEl) priceEl.textContent = rupiah(p.price);
  if (descEl) descEl.textContent = p.description || '';
  if (waEl) waEl.href = buildWA(p);
  if (detailLink) detailLink.href = `product.html?id=${p.id}`;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  // Gesture swipe kiri/kanan untuk mengganti gambar utama
  const next = () => setMain(currentIndex + 1);
  const prev = () => setMain(currentIndex - 1);
  if (main) {
    const supportsPointer = 'PointerEvent' in window;
    let startX = 0;
    let deltaX = 0;
    let swiping = false;
    const threshold = 28; // ~28px untuk trigger

    const getX = (ev) => (supportsPointer ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : 0));
    const onStart = (ev) => { startX = getX(ev); deltaX = 0; swiping = true; };
    const onMove = (ev) => { if (!swiping) return; deltaX = getX(ev) - startX; };
    const onEnd = () => {
      if (!swiping) return;
      if (Math.abs(deltaX) > threshold) { deltaX < 0 ? next() : prev(); }
      swiping = false; deltaX = 0; startX = 0;
    };

    // Hindari duplikasi binding antar buka modal
    main.onpointerdown = null; main.onpointermove = null; main.onpointerup = null; main.onpointercancel = null;
    main.ontouchstart = null; main.ontouchmove = null; main.ontouchend = null;

    if (supportsPointer) {
      main.onpointerdown = onStart;
      main.onpointermove = onMove;
      main.onpointerup = onEnd;
      main.onpointercancel = onEnd;
    } else {
      main.ontouchstart = onStart;
      main.ontouchmove = onMove;
      main.ontouchend = onEnd;
    }
  }
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

// Button click pop animation
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  document.addEventListener('click', function(e){
    const btn = e.target.closest('.btn');
    if (!btn) return;
    btn.classList.add('btn-pop');
    btn.addEventListener('animationend', function(){ btn.classList.remove('btn-pop'); }, { once: true });
  });
})();

// Swap gambar saat hover/focus bila tersedia gambar alternatif
function setupHoverSwap(){
  const imgs = document.querySelectorAll('.product-card.rich .image-wrap img');
  imgs.forEach(img => {
    const alt = img.getAttribute('data-alt');
    if (!alt) return;
    const orig = img.src;
    const enter = ()=>{ img.src = alt; };
    const leave = ()=>{ img.src = orig; };
    img.addEventListener('mouseenter', enter);
    img.addEventListener('mouseleave', leave);
    img.addEventListener('focus', enter);
    img.addEventListener('blur', leave);
  });
}

// Engrave offer reveal animation
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setupEngraveReveal(root = document){
    const offers = root.querySelectorAll('.engrave-offer');
    if (!offers.length) return;
    if (prefersReduced) { offers.forEach(o => o.classList.add('engrave-visible')); return; }
    const anim = document.documentElement.dataset.anim || 'subtle';
    const ioThreshold = anim === 'bold' ? 0.08 : 0.25;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if (!entry.isIntersecting) return;
        entry.target.classList.add('engrave-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: ioThreshold });
    offers.forEach(o => io.observe(o));
  }
  const catalog = document.getElementById('catalog');
  if (catalog) {
    const mo = new MutationObserver(() => setupEngraveReveal(catalog));
    mo.observe(catalog, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setupEngraveReveal());
  } else {
    setupEngraveReveal();
  }
})();
// Helper untuk normalisasi gambar agar selalu berupa URL string
function normalizeImagesArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(x => {
      if (!x) return '';
      if (typeof x === 'string') return x;
      if (typeof x === 'object') return x.path || x.url || x.image_url || x.imageUrl || '';
      return '';
    })
    .filter(Boolean);
}

function derivePrimaryImage(p) {
  if (p.imageUrl) return p.imageUrl;
  if (p.image_url) return p.image_url;
  const imgs = normalizeImagesArray(p.images);
  return imgs[0] || '';
}