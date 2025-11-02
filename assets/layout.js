
// Header shadow saat scroll & interaksi pencarian sederhana
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const net = navigator.connection && navigator.connection.effectiveType ? navigator.connection.effectiveType : '';
  if (header) {
    // Awal: tampilkan header dengan animasi halus
    header.classList.add('revealed');
  }

  // Perilaku scroll: tambah bayangan & hide/show saat arah scroll turun/naik
  let lastY = window.scrollY || document.documentElement.scrollTop || 0;
  let ticking = false;

  const updateOnScroll = () => {
    if (!header) return;
    const y = window.scrollY || document.documentElement.scrollTop || 0;

    // Bayangan saat halaman discroll
    header.classList.toggle('scrolled', y > 8);

    // Hide saat scroll turun, reveal saat scroll naik atau dekat atas
    if (!prefersReduced) {
      const scrollingDown = y > lastY;
      if (scrollingDown && y > 80) {
        header.classList.add('hidden');
        header.classList.remove('revealed');
      } else {
        header.classList.remove('hidden');
        header.classList.add('revealed');
      }
    }

    lastY = y;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  };

  // Inisialisasi state saat load
  updateOnScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Auto-reveal saat kursor mendekati tepi atas viewport
  document.addEventListener('mousemove', (e) => {
    if (!header) return;
    if (e.clientY < 72) {
      header.classList.remove('hidden');
      header.classList.add('revealed');
    }
  });

  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = search.value.trim();
        if (q.length) {
          const url = `catalog.html?q=${encodeURIComponent(q)}`;
          window.location.href = url;
        } else {
          window.location.href = 'catalog.html';
        }
      }
    });
  }

  // Dropdown Profil (hover/click) dan tutup saat klik di luar
  const dropdowns = Array.from(document.querySelectorAll('.has-dropdown'));
  dropdowns.forEach(dd => {
    const link = dd.querySelector('a');
    if (!link) return;
    link.addEventListener('click', (e) => {
      // hanya toggle jika link tidak menuju anchor spesifik
      const href = link.getAttribute('href') || '';
      if (href.endsWith('profile.html')) {
        e.preventDefault();
        dd.classList.toggle('open');
      }
    });
  });
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
  });

  // Footnote: update tahun dinamis di semua halaman
  const yearNodes = Array.from(document.querySelectorAll('.site-footer .footnote span:first-child'));
  const year = new Date().getFullYear();
  yearNodes.forEach(node => { node.textContent = `© ${year} SDL KNIVES`; });

  // Animasi logo saat halaman dimuat
  const logo = document.querySelector('.brand .logo');
  if (logo) {
    logo.classList.add('logo-animated');
  }

  // Observer animasi untuk elemen dengan class "reveal" agar konsisten di semua halaman
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (revealEls.length) {
    if (prefersReduced) {
      revealEls.forEach(el => el.classList.add('revealed'));
    } else {
      const anim = document.documentElement.dataset.anim || 'subtle';
      const threshold = anim === 'bold' ? 0.08 : 0.18;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold });
      revealEls.forEach(el => observer.observe(el));
    }
  }

  // Integrasi AOS: set atribut default dan inisialisasi jika library tersedia
  const initAOS = () => {
    if (!window.AOS) return;
    try {
      // Beri default data-aos jika belum diset
      document.querySelectorAll('.reveal').forEach(el => {
        if (!el.dataset.aos) el.setAttribute('data-aos', 'fade-up');
      });
      document.querySelectorAll('.feature-card, .why-card, .category-card').forEach((el, idx) => {
        if (!el.dataset.aos) el.setAttribute('data-aos', 'fade-up');
        if (!el.dataset.aosDelay) el.setAttribute('data-aos-delay', String((idx % 8) * 60));
      });
      document.querySelectorAll('.product-card').forEach((el, idx) => {
        if (!el.dataset.aos) el.setAttribute('data-aos', 'zoom-in');
        if (!el.dataset.aosDelay) el.setAttribute('data-aos-delay', String((idx % 10) * 40));
      });

      AOS.init({
        once: true,
        duration: 600,
        offset: 50,
        easing: 'ease-out'
      });

      // Refresh saat ada elemen baru ditambahkan (mis. daftar produk dinamis)
      const mo = new MutationObserver((mutations) => {
        let added = false;
        for (const m of mutations) {
          for (const n of m.addedNodes) {
            if (n.nodeType !== 1) continue;
            const el = /** @type {HTMLElement} */(n);
            const cards = el.matches('.product-card') ? [el] : el.querySelectorAll('.product-card');
            if (cards.length) {
              cards.forEach((c, idx) => {
                if (!c.dataset.aos) c.setAttribute('data-aos', 'zoom-in');
                if (!c.dataset.aosDelay) c.setAttribute('data-aos-delay', String((idx % 10) * 40));
              });
              added = true;
            }
          }
        }
        if (added) {
          try { AOS.refreshHard(); } catch { try { AOS.refresh(); } catch {} }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } catch {}
  };

  // Inisialisasi AOS segera jika sudah termuat, atau saat window load
  if (window.AOS) { initAOS(); }
  else { window.addEventListener('load', initAOS, { once: true }); }

  // Parallax ringan untuk hero background pada .bg-modern dan .bg-modern-catalog
  const heroParallaxTargets = Array.from(document.querySelectorAll('.bg-modern, .bg-modern-catalog'));
  if (heroParallaxTargets.length) {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    let rafId = null;
    const applyParallax = () => {
      rafId = null;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const offset = Math.max(-60, Math.min(60, Math.round(y * 0.12))); // efek halus & dibatasi
      heroParallaxTargets.forEach(el => {
        el.style.backgroundPosition = `center calc(50% + ${offset}px)`;
      });
    };
    const onScrollParallax = () => {
      if (mediaQuery.matches) return; // disable di mobile
      if (net === '2g' || net === 'slow-2g') return; // disable di jaringan lambat
      if (rafId === null) rafId = requestAnimationFrame(applyParallax);
    };
    applyParallax();
    window.addEventListener('scroll', onScrollParallax, { passive: true });

    // Pause saat tab tidak terlihat agar hemat baterai
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        applyParallax();
      }
    });
  }

  // Tambahkan rel noopener untuk semua link yang membuka tab baru
  try {
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
      const rel = (a.getAttribute('rel') || '').split(' ').filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });
  } catch {}
});