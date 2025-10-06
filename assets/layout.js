// Header shadow saat scroll & interaksi pencarian sederhana
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
});