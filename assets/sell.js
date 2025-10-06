// Interaksi memukau untuk katalog Bedog & Katana
(function () {
  let prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  try { mql.addEventListener('change', (e) => { prefersReduced = e.matches; }); } catch(_) { /* Safari fallback */ mql.addListener((e)=>{ prefersReduced = e.matches; }); }
  // Ripple untuk tombol
  function setupRipple() {
    document.addEventListener('click', function (e) {
      const target = e.target.closest('.btn');
      if (!target) return;
      if (prefersReduced) {
        target.classList.add('rip-highlight');
        setTimeout(()=>target.classList.remove('rip-highlight'), 180);
        return;
      }
      const rect = target.getBoundingClientRect();
      const span = document.createElement('span');
      span.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      target.appendChild(span);
      span.addEventListener('animationend', () => span.remove());
    });
  }

  // Tilt efek untuk kartu produk
  function setupTilt() {
    if (prefersReduced) return; // disable tilt untuk reduced motion
    const strength = 8; // derajat tilt max
    function onMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * -strength;
      const ry = (x - 0.5) * strength;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
    function onLeave(e) {
      e.currentTarget.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
    }
    function attach() {
      document.querySelectorAll('.product-card').forEach((card) => {
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
      });
    }
    const obs = new MutationObserver(attach);
    obs.observe(document.getElementById('catalog'), { childList: true });
    attach();
  }

  // Parallax ringan untuk banner
  function setupParallax() {
    const banner = document.querySelector('.banner .banner-inner');
    if (!banner) return;
    if (prefersReduced) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY * 0.08;
        banner.style.transform = `translate3d(0, ${y}px, 0)`;
        ticking = false;
      });
    }, { passive: true });
  }

  function init() {
    setupRipple();
    setupTilt();
    setupParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Penyesuaian aksen saat hash kategori berubah (sinkron dengan katalog.html)
(function(){
  const root = document.documentElement;
  const ACCENTS = {
    all: ['#8a2be2','#2f81f7','#00d1ff'],
    katana: ['#ef4444','#b45309','#f59e0b'],
    bedog: ['#16a34a','#22c55e','#10b981'],
    damascus: ['#3b82f6','#06b6d4','#00d1ff'],
    dapur: ['#fb7185','#f97316','#f59e0b'],
    edc: ['#8b5cf6','#a78bfa','#c084fc'],
    alat: ['#475569','#64748b','#94a3b8']
  };
  function apply(cat){
    const [a1,a2,a3] = ACCENTS[cat] || ACCENTS.all;
    root.style.setProperty('--accent-1', a1);
    root.style.setProperty('--accent-2', a2);
    root.style.setProperty('--accent-3', a3);
  }
  function onHash(){
    const cat = (location.hash || '').replace('#','') || 'all';
    apply(cat);
  }
  window.addEventListener('hashchange', onHash);
  onHash();
})();

// Animasi muncul bertahap saat scroll untuk grid besar
(function(){
  function setupIntersectionReveal(){
    const opts = { root: null, threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const idx = parseInt(el.getAttribute('data-index') || '0', 10);
        // Stagger berbasis index agar terasa bertahap
        el.style.transitionDelay = prefersReduced ? '0ms' : `${(idx % 12) * 40}ms`;
        el.classList.add('visible');
        observer.unobserve(el);
      });
    }, opts);

    function attach(){
      document.querySelectorAll('.product-card.on-scroll').forEach((card)=>observer.observe(card));
    }
    const catalog = document.getElementById('catalog');
    if (catalog) {
      const mo = new MutationObserver(attach);
      mo.observe(catalog, { childList: true, subtree: true });
    }
    attach();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupIntersectionReveal);
  } else {
    setupIntersectionReveal();
  }
})();