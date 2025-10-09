
// Header shadow saat scroll & interaksi pencarian sederhana
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  if (header) {
    // Awal: tampilkan header dengan animasi halus
    header.classList.add('revealed');
  }

  // Perilaku scroll: tambah bayangan & hide/show saat arah scroll turun/naik
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(el => observer.observe(el));
  }
});