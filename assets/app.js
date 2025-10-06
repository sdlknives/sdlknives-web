// Interaksi UI dasar: toggle menu, toggle tema, dan animasi muncul
(function () {
  const root = document.body;

  function applySavedTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') root.classList.add('light');
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;
    const isLight = root.classList.contains('light');
    icon.className = 'bi ' + (isLight ? 'bi-moon' : 'bi-brightness-high');
    btn.title = isLight ? 'Tema gelap' : 'Tema terang';
  }

  function toggleTheme() {
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
    updateThemeIcon();
  }

  function setupMenuToggle() {
    const nav = document.querySelector('.nav');
    const btn = document.getElementById('menuToggle');
    if (!nav || !btn) return;
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const within = nav.contains(e.target) || btn.contains(e.target);
      if (!within) nav.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') nav.classList.remove('open');
    });
  }

  function setupRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .product-card').forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  function init() {
    applySavedTheme();
    setupMenuToggle();
    setupRevealAnimations();
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();