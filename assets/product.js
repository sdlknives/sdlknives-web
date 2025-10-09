// Halaman detail produk: render galeri multi-foto dan detail
(function(){
  function qs(name){ const u=new URL(location.href); return u.searchParams.get(name); }
  function rupiah(n){ try { return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0); } catch { return 'Rp ' + (n||0).toLocaleString('id-ID'); } }

  // Kategorisasi dan tema aksen lokal agar tidak bergantung ke katalog
  function inferCategory(name=''){
    const s = String(name || '').toLowerCase();
    if (s.includes('katana') || s.includes('samurai')) return 'katana';
    if (s.includes('bedog') || s.includes('golok')) return 'bedog';
    if (s.includes('damascus')) return 'damascus';
    if (s.includes('alat') || s.includes('aksesori') || s.includes('sarung') || s.includes('sheath') || s.includes('batu asah') || s.includes('whetstone')) return 'alat';
    if (s.includes('chef') || s.includes('dapur')) return 'dapur';
    if (s.includes('lipat') || s.includes('edc')) return 'edc';
    return 'umum';
  }

  const ACCENTS = {
  all: ['#8a2be2','#ef4444','#f59e0b'],
    katana: ['#b91c1c','#d4af37','#f59e0b'],
    bedog: ['#15803d','#22c55e','#10b981'],
  damascus: ['#b91c1c','#ef4444','#f59e0b'],
    dapur: ['#fb7185','#f97316','#f59e0b'],
    edc: ['#8b5cf6','#a78bfa','#c084fc'],
    alat: ['#475569','#64748b','#94a3b8'],
  umum: ['#8a2be2','#ef4444','#f59e0b']
  };
  const ICONS = { katana:'bi-stars', bedog:'bi-fire', damascus:'bi-gem', dapur:'bi-basket', edc:'bi-gear', alat:'bi-tools', umum:'bi-stars' };
  const MICRO_COPY = { katana:'Bilahan panjang bergaya samurai—koleksi premium.', bedog:'Pisau tradisional serbaguna untuk kerja berat.', damascus:'Pola lipatan baja eksotis dan kuat.', dapur:'Chef knife untuk presisi memasak.', edc:'Pisau lipat praktis untuk harian.', umum:'Produk pilihan berkualitas.' };

  async function load(){
    const id = qs('id');
    const container = document.getElementById('productDetail');
    if(!id){ container.innerHTML = '<div class="card">Produk tidak ditemukan.</div>'; return; }
    container.innerHTML = '<div class="card">Memuat detail produk…</div>';
    try{
      let list = [];
      try {
        const res = await fetch('api/products.php?action=list');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        list = (data.products||[]);
      } catch (e1) {
        const res2 = await fetch('data/products.json');
        const data2 = await res2.json();
        list = (data2.products||[]);
      }
      const p = list.find(x=>String(x.id)===String(id));
      if(!p){ container.innerHTML = '<div class="card">Produk tidak ditemukan.</div>'; return; }
      const cat = inferCategory(p.name);
      const imgs = Array.isArray(p.images)&&p.images.length ? p.images : [p.imageUrl || (Array.isArray(p.images)&&p.images[0])].filter(Boolean);
      const vids = Array.isArray(p.videos)&&p.videos.length ? p.videos : (p.videoUrl ? [p.videoUrl] : []);
      const [a1,a2,a3] = ACCENTS[cat] || ACCENTS.all; const root = document.documentElement;
      root.style.setProperty('--accent-1', a1); root.style.setProperty('--accent-2', a2); root.style.setProperty('--accent-3', a3);
      const titleIcon = ICONS[cat] || 'bi-stars';
  const waMsg = encodeURIComponent(`Halo Admin SDL KNIVES, saya minat ${p.name} (ID: ${p.id}). Mohon konsultasi gratis untuk personalisasi bilah & sarung.\nHarga: ${rupiah(p.price)}`);
      let storeReviews = [];
      try { const r = await fetch('data/reviews.json'); storeReviews = await r.json(); } catch {}
      // muat ulasan lokal (GitHub Pages tidak bisa tulis server; simpan di localStorage)
      let localReviews = [];
      try { localReviews = JSON.parse(localStorage.getItem('reviews') || '[]'); } catch { localReviews = []; }
      // normalisasi bentuk: dukung {text} atau {comment}; sisipkan productId bila ada
      localReviews = Array.isArray(localReviews) ? localReviews : [];
      // gabungkan ulasan sesuai produk
      let productReviews = [
        ...storeReviews.filter(rv => String(rv.productId) === String(p.id) || rv.productId === 'all'),
        ...localReviews.filter(rv => String(rv.productId) === String(p.id)).map(rv => ({
          name: rv.name || 'Pelanggan',
          rating: rv.rating || 5,
          text: rv.text || rv.comment || '',
          productId: String(p.id)
        }))
      ];
      const avgStore = storeReviews.length ? (storeReviews.reduce((s,x)=>s+(x.rating||0),0) / storeReviews.length) : null;
      const avgProduct = productReviews.length ? (productReviews.reduce((s,x)=>s+(x.rating||0),0) / productReviews.length) : null;
      const rating = typeof p.rating === 'number' ? p.rating : (avgProduct || avgStore || 4.8);
      const reviews = typeof p.reviews === 'number' ? p.reviews : (productReviews.length || storeReviews.length || 0);
      const compare = (typeof p.compareAtPrice==='number' && p.compareAtPrice>p.price) ? p.compareAtPrice : null;
      const savePct = compare ? Math.round((1 - (p.price/compare)) * 100) : 0;

      container.innerHTML = `
        <nav class="breadcrumbs"><a href="index.html"><i class="bi bi-house-door"></i> Beranda</a> · <a href="catalog.html#${cat}">Katalog</a> · <span>${p.name}</span></nav>
        <div class="product-container">
          <div class="gallery">
            <img class="main zoomable" src="${imgs[0]||''}" alt="${p.name}" loading="eager" decoding="async" fetchpriority="high" />
            <div class="nav"><button class="btn gallery-prev" aria-label="Foto sebelumnya"><i class="bi bi-chevron-left"></i></button><button class="btn gallery-next" aria-label="Foto berikutnya"><i class="bi bi-chevron-right"></i></button></div>
            <div class="thumbs">
              ${imgs.map((src,i)=>`<img src="${src}" alt="${p.name} ${i+1}" data-src="${src}" loading="lazy" decoding="async" />`).join('')}
              ${vids.map((src,i)=>`<div class="thumb video" data-src="${src}" aria-label="Video ${i+1}"><i class="bi bi-play-circle"></i></div>`).join('')}
            </div>
          </div>
            <div class="details">
              <h1 class="title"><i class="bi ${titleIcon}"></i> ${p.name}</h1>
              ${''}
              <div class="price-block">
                <div class="current">${rupiah(p.price)}</div>
                ${compare?`<div class="compare">${rupiah(compare)}</div><div class="save"><i class="bi bi-percent"></i> Hemat ${savePct}%</div>`:''}
              </div>
            <div class="rating">
              <span class="stars">${Array.from({length:5}).map((_,i)=>`<i class="bi ${i < Math.round(rating) ? 'bi-star-fill' : 'bi-star'}"></i>`).join('')}</span>
              <span>${rating.toFixed(1)}</span>
              <span class="reviews-count">(${reviews} ulasan)</span>
            </div>
            <div class="badges">
              <span class="badge">Premium Handmade</span>
              <span class="badge">Quality Control</span>
              <span class="badge">Garansi Service</span>
              ${(()=>{ const stock = typeof p.stock==='number' ? p.stock : null; if(stock===null) return '<span class="badge">Ready Stock</span>'; if(stock<=0) return '<span class="badge">Preorder</span>'; if(stock<=3) return '<span class="badge">Stok Terbatas</span>'; return '<span class="badge">Ready Stock</span>'; })()}
              <span class="badge">COD</span>
            </div>
            ${(p.enableEngrave === true) ? `<div class="engrave-offer"><i class="bi bi-pencil-square"></i> Personalize bilah & sarung — konsultasi gratis</div>` : ''}
            <p class="desc">${p.description||''}</p>
            <ul class="specs">
              <li><i class="bi bi-hammer"></i> Bahan: Carbon/Stainless/Damascus (variasi)</li>
              <li><i class="bi bi-aspect-ratio"></i> Dimensi: custom per model</li>
              <li><i class="bi bi-stars"></i> Finishing: satin/matte/polish</li>
              <li><i class="bi bi-box-seam"></i> Aksesori: sarung opsional</li>
            </ul>
            <div class="usp">
              <div class="title accent-text"><i class="bi bi-stars"></i> Keunggulan Produk</div>
              <div class="usp-grid">
                <div class="usp-item"><i class="bi bi-gem"></i><span>Material Berkualitas</span></div>
                <div class="usp-item"><i class="bi bi-lightning-charge"></i><span>Ketajaman Presisi</span></div>
                <div class="usp-item"><i class="bi bi-stars"></i><span>Desain Elegan</span></div>
                <div class="usp-item"><i class="bi bi-shield-check"></i><span>Pengiriman Aman</span></div>
              </div>
            </div>
            <div class="actions">
  <a class="btn btn-primary" target="_blank" href="https://wa.me/6287767896317?text=${waMsg}"><i class="bi bi-whatsapp"></i> Beli via WA</a>
              <a class="btn" href="catalog.html#${cat}"><i class="bi bi-arrow-left"></i> Kembali ke Katalog</a>
            </div>
            
          </div>
        </div>
        ${(p.enableEngrave === true) ? `<div class="engrave-offer"><i class="bi bi-pencil-square"></i> Personalize bilah & sarung — konsultasi gratis</div>` : ''}
        <section class="related-section section-block">
          <h2 class="accent-text section-title"><i class="bi bi-grid"></i> Produk Terkait</h2>
          <div class="grid" id="relatedProducts" aria-live="polite"></div>
        </section>
        <section class="reviews-section section-block">
          <h2 class="accent-text section-title"><i class="bi bi-chat-quote"></i> Ulasan Pelanggan</h2>
          <div class="reviews-list" id="reviewsList"></div>
          <div class="reviews-controls"><button class="btn" id="reviewsPrev" disabled><i class="bi bi-arrow-left"></i> Sebelumnya</button><button class="btn" id="reviewsLoadMore"><i class="bi bi-plus-circle"></i> Muat lebih banyak</button><span id="reviewsPageInfo" class="muted" style="margin-left:8px"></span></div>
          <form id="addReviewForm" class="card" style="margin-top:12px; display:grid; gap:8px;">
            <div style="display:grid; grid-template-columns: 1fr 120px; gap:8px; align-items:center;">
              <input name="name" placeholder="Nama Anda" aria-label="Nama" />
              <select name="rating" aria-label="Rating">
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>
            <textarea name="text" placeholder="Tulis ulasan singkat…" aria-label="Ulasan"></textarea>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="btn btn-primary" type="submit"><i class="bi bi-send"></i> Kirim Ulasan</button>
              <span class="muted" style="font-size:12px;">Catatan: di GitHub Pages ulasan disimpan di perangkat Anda.</span>
            </div>
          </form>
        </section>
        <section class="fbt-section section-block">
          <h2 class="accent-text section-title"><i class="bi bi-bag-plus"></i> Frequently Bought Together</h2>
          <div class="fbt-list" id="fbtList"></div>
          <div class="fbt-summary"><span id="fbtTotal">Total:</span><button class="btn" id="fbtWhatsApp"><i class="bi bi-whatsapp"></i> Beli Bersama</button></div>
        </section>
      `;

      const main = container.querySelector('.gallery .main');
      const thumbs = container.querySelectorAll('.thumbs img');
      const videoThumbs = container.querySelectorAll('.thumbs .thumb.video');
      let currentIndex = 0;
      thumbs.forEach((t,idx)=>t.addEventListener('click',()=>{ const m = container.querySelector('.gallery .main'); if(m && m.tagName.toLowerCase()==='img'){ m.src = t.dataset.src; m.classList.add('zoomable'); currentIndex = idx; } else if(m){
        const img = document.createElement('img'); img.className='main zoomable'; img.alt = p.name; img.src = t.dataset.src; img.loading='eager'; img.decoding='async'; img.setAttribute('fetchpriority','high'); m.parentElement.replaceChild(img, m); currentIndex = idx; img.addEventListener('click',()=>openLightbox(currentIndex));
      }}));
      function setMainImage(idx){
        const m = container.querySelector('.gallery .main');
        const src = imgs[idx]; currentIndex = idx;
        if(m && m.tagName.toLowerCase()==='img'){ m.src = src; m.classList.add('zoomable'); }
        else if(m){ const img = document.createElement('img'); img.className='main zoomable'; img.alt = p.name; img.src = src; img.loading='eager'; img.decoding='async'; img.setAttribute('fetchpriority','high'); m.parentElement.replaceChild(img, m); img.addEventListener('click',()=>openLightbox(currentIndex)); }
      }
      const btnPrev = container.querySelector('.gallery .gallery-prev');
      const btnNext = container.querySelector('.gallery .gallery-next');
      btnPrev?.addEventListener('click', ()=>{ setMainImage((currentIndex-1+imgs.length)%imgs.length); });
      btnNext?.addEventListener('click', ()=>{ setMainImage((currentIndex+1)%imgs.length); });

      // Thumbnail video: set poster & durasi di thumbnail, dan ganti elemen utama menjadi <video>
      videoThumbs.forEach((el)=>{
        const poster = p.videoPoster || imgs[0] || '';
        if(poster){ el.style.backgroundImage = `url('${poster}')`; }
        try{
          const tmp = document.createElement('video'); tmp.preload = 'metadata'; tmp.src = el.dataset.src; tmp.muted = true;
          tmp.addEventListener('loadedmetadata', ()=>{
            const d = Math.round(tmp.duration||0); const mm = Math.floor(d/60); const ss = (d%60).toString().padStart(2,'0');
            const badge = document.createElement('span'); badge.className='dur'; badge.textContent = `${mm}:${ss}`;
            if(!el.querySelector('.dur')) el.appendChild(badge);
          });
        }catch{}
        el.addEventListener('click',()=>{
          const gallery = container.querySelector('.gallery'); if(!gallery) return;
          const currentMain = gallery.querySelector('.main');
          const v = document.createElement('video'); v.className='main'; v.src = el.dataset.src; v.controls = true; v.autoplay = true; v.muted = true; v.playsInline = true; if(poster) v.poster = poster;
          if(currentMain){ gallery.replaceChild(v, currentMain); }
        });
      });

      // Lightbox dengan navigasi
      function openLightbox(idx){
        currentIndex = idx;
        const lb = document.getElementById('lightbox');
        const photo = lb.querySelector('img');
        photo.src = imgs[currentIndex];
        lb.classList.remove('hidden');
      }
      (function(){
        const img = container.querySelector('.gallery img.main');
        if(!img) return;
        img.addEventListener('click',()=>{ img.classList.toggle('zoom'); });
        img.addEventListener('mousemove',(e)=>{ if(!img.classList.contains('zoom')) return; const r = img.getBoundingClientRect(); const x = ((e.clientX - r.left)/r.width)*100; const y = ((e.clientY - r.top)/r.height)*100; img.style.setProperty('--zoom-x', `${x}%`); img.style.setProperty('--zoom-y', `${y}%`); });
      })();
      function closeLightbox(){ document.getElementById('lightbox').classList.add('hidden'); }
      function next(){ currentIndex = (currentIndex+1) % imgs.length; document.querySelector('#lightbox img').src = imgs[currentIndex]; }
      function prev(){ currentIndex = (currentIndex-1+imgs.length) % imgs.length; document.querySelector('#lightbox img').src = imgs[currentIndex]; }
      // Klik pada gambar utama membuka lightbox (khusus gambar)
      if(main && main.tagName.toLowerCase()==='img'){ main.addEventListener('click',()=>openLightbox(currentIndex)); }
      document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
      document.getElementById('lb-next')?.addEventListener('click', next);
      document.getElementById('lb-prev')?.addEventListener('click', prev);
      document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeLightbox(); if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); });

      // Purchase bar sticky
      const bar = document.getElementById('purchaseBar');
      if(bar){
        bar.innerHTML = `<div class="container inner"><div class="name">${p.name}</div><div class="price">${rupiah(p.price)}</div><div class="actions"><a class="btn btn-primary" target="_blank" href="https://wa.me/6281234567890?text=${waMsg}"><i class="bi bi-whatsapp"></i> Konsultasi & Beli</a></div></div>`;
        bar.classList.remove('hidden');
      }

      // Ulasan pelanggan: filter per productId + Load More
      const reviewsEl = container.querySelector('#reviewsList');
      const reviewsPrevBtn = container.querySelector('#reviewsPrev');
      const reviewsMoreBtn = container.querySelector('#reviewsLoadMore');
      const reviewsPageInfo = container.querySelector('#reviewsPageInfo');
      if(reviewsEl){
        let REVIEW_PAGE = 1; const PAGE_SIZE = 4; const totalPages = Math.max(1, Math.ceil(productReviews.length / PAGE_SIZE));
        function renderReviews(){
          const end = REVIEW_PAGE * PAGE_SIZE; const slice = productReviews.slice(0, end);
          const items = slice.map((rv)=>{
            const stars = Array.from({length:5}).map((_,i)=>`<i class="bi ${i < (rv.rating||0) ? 'bi-star-fill' : 'bi-star'}"></i>`).join('');
            return `<div class="review-item"><div class="head"><div class="name">${rv.name||'Pelanggan'}</div><div class="stars">${stars}</div></div><div class="text">${rv.text||''}</div></div>`;
          }).join('');
          reviewsEl.innerHTML = items || '<div class="card">Belum ada ulasan ditampilkan.</div>';
          if(reviewsPageInfo) reviewsPageInfo.textContent = `Halaman ${REVIEW_PAGE}/${totalPages}`;
          if(reviewsPrevBtn) reviewsPrevBtn.disabled = REVIEW_PAGE <= 1;
          if(reviewsMoreBtn) {
            reviewsMoreBtn.disabled = end >= productReviews.length;
            reviewsMoreBtn.textContent = end >= productReviews.length ? 'Sudah semua' : 'Muat lebih banyak';
          }
        }
        renderReviews();
        reviewsPrevBtn?.addEventListener('click', ()=>{ REVIEW_PAGE = Math.max(1, REVIEW_PAGE - 1); renderReviews(); });
        reviewsMoreBtn?.addEventListener('click', ()=>{ REVIEW_PAGE = REVIEW_PAGE + 1; renderReviews(); });

        // handle submit ulasan lokal
        const addForm = container.querySelector('#addReviewForm');
        addForm?.addEventListener('submit', (e)=>{
          e.preventDefault();
          const name = addForm.name.value.trim();
          const rating = parseInt(addForm.rating.value || '5', 10);
          const text = (addForm.text?.value || '').trim();
          if(!name || !text || !rating){ alert('Isi nama, rating, dan ulasan'); return; }
          const item = { productId: String(p.id), name, rating, text };
          try {
            localReviews.push(item);
            localStorage.setItem('reviews', JSON.stringify(localReviews));
          } catch {}
          productReviews.push(item);
          const rc = container.querySelector('.reviews-count');
          if(rc){ rc.textContent = `(${productReviews.length} ulasan)`; }
          addForm.reset();
          renderReviews();
        });
      }

      // Frequently Bought Together
      const fbtEl = container.querySelector('#fbtList');
      const fbtTotalEl = container.querySelector('#fbtTotal');
      const fbtBtn = container.querySelector('#fbtWhatsApp');
      if(fbtEl && fbtTotalEl && fbtBtn){
        const accessories = (Array.isArray(p.accessories) && p.accessories.length)
          ? p.accessories.map(id => (list||[]).find(x => String(x.id) === String(id))).filter(Boolean)
          : (list||[]).filter(x=>inferCategory(x.name)==='alat').slice(0,3);
        fbtEl.innerHTML = accessories.map((x,i)=>{
          const img = x.imageUrl || (Array.isArray(x.images)? x.images[0] : '');
          return `<div class="fbt-item"><input type="checkbox" class="fbt-check" data-id="${x.id}" data-price="${x.price}" /><img src="${img}" alt="${x.name}" loading="lazy" decoding="async" /><div class="name">${x.name}</div><div class="price">${rupiah(x.price)}</div></div>`;
        }).join('');
        function calcTotal(){
          const checks = Array.from(container.querySelectorAll('.fbt-check'));
          const sum = checks.reduce((s,c)=> s + (c.checked ? parseFloat(c.dataset.price||'0') : 0), 0) + (p.price||0);
          fbtTotalEl.textContent = `Total: ${rupiah(sum)}`;
        }
        calcTotal();
        fbtEl.addEventListener('change', calcTotal);
        fbtBtn.addEventListener('click', ()=>{
          const picks = Array.from(container.querySelectorAll('.fbt-check')).filter(c=>c.checked).map(c=>c.dataset.id);
          const names = picks.map(id=>{ const it=(list||[]).find(x=>String(x.id)===String(id)); return it?it.name:''; }).filter(Boolean);
          const intro = `Halo Admin, saya ingin beli ${p.name} (ID: ${p.id}) bersama: ${names.join(', ')}`;
          window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(intro)}`,'_blank');
        });
      }

      // Produk terkait berdasarkan kategori yang sama
      const relatedEl = container.querySelector('#relatedProducts');
      if (relatedEl) {
        const related = (list||[])
          .filter(x => String(x.id) !== String(p.id) && inferCategory(x.name) === cat)
          .slice(0, 4);
        relatedEl.innerHTML = related.map((x,i)=>{
          const img = x.imageUrl || (Array.isArray(x.images) ? x.images[0] : '');
          return `
          <article class="product-card on-scroll" data-index="${i}">
            <img src="${img}" alt="${x.name}" loading="lazy" decoding="async" />
            <div class="body">
              <div class="name">${x.name}</div>
              <div class="price">${rupiah(x.price)}</div>
              <div class="actions"><a class="btn" href="product.html?id=${x.id}"><i class="bi bi-eye"></i> Lihat</a></div>
            </div>
          </article>
          `;
        }).join('');
      }

      // Set judul halaman dan Structured Data (JSON-LD) untuk SEO
      try {
        document.title = `${p.name} – SDL KNIVES`;
        const ld = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          image: imgs,
          description: p.description || '',
          brand: { "@type": "Brand", name: "SDL KNIVES" },
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            price: p.price,
            availability: "https://schema.org/InStock",
            url: location.href
          }
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(ld);
        document.head.appendChild(script);
      } catch {}

      // Animasi elegan untuk banner ukir di halaman produk
      (function(){
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const offers = container.querySelectorAll('.engrave-offer');
        if (!offers.length) return;
        if (prefersReduced) { offers.forEach(o => o.classList.add('engrave-visible')); return; }
        const anim = document.documentElement.dataset.anim || 'subtle';
        const thrOffer = anim === 'bold' ? 0.08 : 0.25;
        const io = new IntersectionObserver((entries)=>{
          entries.forEach((entry)=>{
            if (!entry.isIntersecting) return;
            entry.target.classList.add('engrave-visible');
            io.unobserve(entry.target);
          });
        }, { threshold: thrOffer });
        offers.forEach(o => io.observe(o));
      })();

      // Animasi reveal elegan untuk seksi terkait di halaman produk (stagger ringan)
      (function(){
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const els = container.querySelectorAll('.section-block, .usp-item, .trust-item, .review-item, .fbt-item');
        if (!els.length) return;
        if (prefersReduced) { els.forEach(el => el.classList.add('visible')); return; }
        const anim = document.documentElement.dataset.anim || 'subtle';
        const thrReveal = anim === 'bold' ? 0.08 : 0.18;
        const io = new IntersectionObserver((entries)=>{
          entries.forEach((e)=>{
            if (!e.isIntersecting) return;
            const el = e.target;
            el.classList.add('reveal');
            const idx = Array.from(els).indexOf(el);
            el.style.transitionDelay = `${(idx % 12) * 40}ms`;
            el.classList.add('visible');
            io.unobserve(el);
          });
        }, { threshold: thrReveal });
        els.forEach(el => io.observe(el));
      })();

      // (Ukir custom dipindah ke katalog; tidak ada handler di halaman produk)
    } catch(e){
      container.innerHTML = `<div class="card">Gagal memuat detail: ${e && e.message ? e.message : 'Tidak diketahui'}</div>`;
    }
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', load); } else { load(); }
})();