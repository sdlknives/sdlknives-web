// Render dan form ulasan sederhana: memuat dari JSON lalu menambah lokal
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.reviews-grid');
  const form = document.getElementById('reviewForm');
  const src = 'data/reviews.json';

  let base = [];
  let local = [];

  try {
    local = JSON.parse(localStorage.getItem('reviews') || '[]');
  } catch (e) { local = []; }

  const stars = (n = 5) => {
    const full = '<i class="bi bi-star-fill"></i>';
    const empty = '<i class="bi bi-star"></i>';
    return full.repeat(Math.max(0, Math.min(5, n))) + empty.repeat(Math.max(0, 5 - n));
  };

  function render(list) {
    if (!grid) return;
    grid.innerHTML = list.map(r => `
      <article class="review-card">
        <div class="stars">${stars(parseInt(r.rating || 5, 10))}</div>
        <div class="quote">“${(r.comment || '').replace(/"/g, '\"')}”</div>
        <div class="meta">${r.name || 'Pelanggan'}${r.product ? ', membeli ' + r.product : ''}</div>
      </article>
    `).join('');
  }

  async function load() {
    try {
      const res = await fetch(src);
      base = await res.json();
    } catch (e) { base = []; }
    render([...(base || []), ...(local || [])]);
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const rating = parseInt(form.rating.value || '5', 10);
    const comment = form.comment.value.trim();
    if (!name || !comment || !rating) { alert('Isi nama, rating, dan ulasan'); return; }
    const item = { name, rating, comment };
    local.push(item);
    localStorage.setItem('reviews', JSON.stringify(local));
    form.reset();
    render([...(base || []), ...(local || [])]);
  });

  load();
});