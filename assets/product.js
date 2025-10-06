// Halaman detail produk: render galeri multi-foto dan detail
(function(){
  function qs(name){ const u=new URL(location.href); return u.searchParams.get(name); }
  function rupiah(n){ try { return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0); } catch { return 'Rp ' + (n||0).toLocaleString('id-ID'); } }
  function inferCategory(name=''){ const s=name.toLowerCase(); if(s.includes('katana')||s.includes('samurai')) return 'katana'; if(s.includes('bedog')||s.includes('golok')) return 'bedog'; if(s.includes('damascus')) return 'damascus'; if(s.includes('chef')||s.includes('dapur')) return 'dapur'; if(s.includes('lipat')||s.includes('edc')) return 'edc'; return 'umum'; }
  const MICRO_COPY = { katana:'Bilahan panjang bergaya samurai—koleksi premium.', bedog:'Pisau tradisional serbaguna untuk kerja berat.', damascus:'Pola lipatan baja eksotis dan kuat.', dapur:'Chef knife untuk presisi memasak.', edc:'Pisau lipat praktis untuk harian.', umum:'Produk pilihan berkualitas.' };
  const ACCENTS = {
    all: ['#8a2be2','#2f81f7','#00d1ff'],
    katana: ['#ef4444','#b45309','#f59e0b'],
    bedog: ['#16a34a','#22c55e','#10b981'],
    damascus: ['#3b82f6','#06b6d4','#00d1ff'],
    dapur: ['#fb7185','#f97316','#f59e0b'],
    edc: ['#8b5cf6','#a78bfa','#c084fc'],
    umum: ['#8a2be2','#2f81f7','#00d1ff']
  };

  async function load(){
    const id = qs('id');
    const container = document.getElementById('productDetail');
    if(!id){ container.innerHTML = '<div class="card">Produk tidak ditemukan.</div>'; return; }
    container.innerHTML = '<div class="card">Memuat detail produk…</div>';
    try{
      const res = await fetch('api/products.php?action=list');
      const data = await res.json();
      const list = (data.products||[]);
      const p = list.find(x=>x.id===id);
      if(!p){ container.innerHTML = '<div class="card">Produk tidak ditemukan.</div>'; return; }
      const cat = inferCategory(p.name);
      const imgs = Array.isArray(p.images)&&p.images.length ? p.images : [p.imageUrl].filter(Boolean);
      const vids = Array.isArray(p.videos)&&p.videos.length ? p.videos : (p.videoUrl ? [p.videoUrl] : []);
      const [a1,a2,a3] = ACCENTS[cat] || ACCENTS.all; const root = document.documentElement;
      root.style.setProperty('--accent-1', a1); root.style.setProperty('--accent-2', a2); root.style.setProperty('--accent-3', a3);
      const rating = p.rating || 4.8; const reviews = p.reviews || 27;
      const engravePrice = typeof p.engravePrice==='number' ? p.engravePrice : 50000;
      const engraveStyles = Array.isArray(p.engraveStyles)&&p.engraveStyles.length ? p.engraveStyles : ['standar','script','block'];
      const compare = (typeof p.compareAtPrice==='number' && p.compareAtPrice>p.price) ? p.compareAtPrice : null;
      const savePct = compare ? Math.round((1 - (p.price/compare)) * 100) : 0;
      const enableEngrave = p.enableEngrave !== false;

      container.innerHTML = `
        <nav class="breadcrumbs"><a href="index.html"><i class="bi bi-house-door"></i> Beranda</a> · <a href="catalog.html#${cat}">Katalog</a> · <span>${p.name}</span></nav>
        <div class="product-container">
          <div class="gallery">
            <img class="main" src="${imgs[0]||''}" alt="${p.name}" />
            <div class="thumbs">
              ${imgs.map((src,i)=>`<img src="${src}" alt="${p.name} ${i+1}" data-src="${src}" />`).join('')}
              ${vids.map((src,i)=>`<div class="thumb video" data-src="${src}" aria-label="Video ${i+1}"><i class="bi bi-play-circle"></i></div>`).join('')}
            </div>
          </div>
          <div class="details">
            <h1 class="title"><i class="bi bi-gem"></i> ${p.name}</h1>
            ${enableEngrave ? `
            <div class="custom-engrave">
              <h4><i class="bi bi-pencil-square"></i> Ukir Custom Nama/Desain</h4>
              <p class="muted">Kami menerima ukir nama atau logo pada bilah/sarung. Cocok untuk hadiah atau koleksi pribadi.</p>
              <div class="engrave-form">
                <input type="text" id="engrave-name" placeholder="Nama/Teks yang diukir" />
                <select id="engrave-style">
                  ${engraveStyles.map(s=>`<option value="${s}">${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}
                </select>
                <div class="engrave-price">Mulai ${rupiah(engravePrice)}</div>
                <button class="btn" id="engrave-whatsapp"><i class="bi bi-whatsapp"></i> Minta Ukir Custom</button>
              </div>
              <div class="hint">Karakter diizinkan: huruf, angka, spasi, - _ . (maks 24)</div>
              <div id="engrave-error" class="engrave-error" style="display:none"></div>
              <div class="engrave-preview"><span class="label">Preview:</span> <span id="engrave-sample" class="sample">Nama Anda</span></div>
            </div>
            ` : ''}
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
            </div>
            <p class="desc">${p.description||''}</p>
            <ul class="specs">
              <li><i class="bi bi-hammer"></i> Bahan: Carbon/Stainless/Damascus (variasi)</li>
              <li><i class="bi bi-aspect-ratio"></i> Dimensi: custom per model</li>
              <li><i class="bi bi-stars"></i> Finishing: satin/matte/polish</li>
              <li><i class="bi bi-box-seam"></i> Aksesori: sarung opsional</li>
            </ul>
            <div class="actions">
              <a class="btn btn-primary" target="_blank" href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20minat%20${encodeURIComponent(p.name)}%20(ID:%20${p.id})%20Harga:%20${encodeURIComponent(rupiah(p.price))}"><i class="bi bi-whatsapp"></i> Tanya & Beli</a>
              <a class="btn" href="catalog.html#${cat}"><i class="bi bi-arrow-left"></i> Kembali ke Katalog</a>
            </div>
            
          </div>
        </div>
      `;

      const main = container.querySelector('.gallery .main');
      const thumbs = container.querySelectorAll('.thumbs img');
      const videoThumbs = container.querySelectorAll('.thumbs .thumb.video');
      let currentIndex = 0;
      thumbs.forEach((t,idx)=>t.addEventListener('click',()=>{ const m = container.querySelector('.gallery .main'); if(m && m.tagName.toLowerCase()==='img'){ m.src = t.dataset.src; currentIndex = idx; } else if(m){
        const img = document.createElement('img'); img.className='main'; img.alt = p.name; img.src = t.dataset.src; m.parentElement.replaceChild(img, m); currentIndex = idx; img.addEventListener('click',()=>openLightbox(currentIndex));
      }}));

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
        bar.innerHTML = `<div class="container inner"><div class="name">${p.name}</div><div class="price">${rupiah(p.price)}</div><div class="actions"><a class="btn btn-primary" target="_blank" href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20minat%20${encodeURIComponent(p.name)}%20(ID:%20${p.id})%20Harga:%20${encodeURIComponent(rupiah(p.price))}"><i class="bi bi-whatsapp"></i> Beli Sekarang</a></div></div>`;
        bar.classList.remove('hidden');
      }

      // CTA ukir custom via WhatsApp dengan validasi dan preview mini
      if(enableEngrave){
        const engraveBtn = container.querySelector('#engrave-whatsapp');
        const nameInput = container.querySelector('#engrave-name');
        const styleSelect = container.querySelector('#engrave-style');
        const errBox = container.querySelector('#engrave-error');
        const sample = container.querySelector('#engrave-sample');
        const ALLOWED = /^[A-Za-z0-9\s\-_.]{1,24}$/;

        function applyStylePreview(style){
          if(!sample) return;
          sample.style.fontStyle = 'normal'; sample.style.textTransform = 'none'; sample.style.letterSpacing = 'normal';
          if(style==='script'){ sample.style.fontStyle = 'italic'; }
          if(style==='block'){ sample.style.textTransform = 'uppercase'; sample.style.letterSpacing = '0.5px'; }
          if(style==='kanji'){ sample.style.fontFamily = 'serif'; sample.style.letterSpacing = '0.5px'; }
        }
        function updateSample(){ if(sample){ const val = nameInput?.value?.trim(); sample.textContent = val || 'Nama Anda'; } }
        styleSelect?.addEventListener('change', ()=>applyStylePreview(styleSelect.value));
        nameInput?.addEventListener('input', ()=>{ nameInput.classList.remove('error'); if(errBox) errBox.style.display='none'; updateSample(); });
        applyStylePreview(styleSelect?.value||'standar'); updateSample();

        engraveBtn?.addEventListener('click', ()=>{
          const nameTxt = nameInput?.value?.trim() || '';
          const style = styleSelect?.value || 'standar';
          if(!ALLOWED.test(nameTxt)){
            if(errBox){ errBox.textContent = 'Harap isi 1–24 karakter: huruf, angka, spasi, - _ .'; errBox.style.display = 'block'; }
            nameInput?.classList.add('error');
            return;
          }
          const intro = `Halo Admin, saya ingin ukir custom untuk ${p.name} (ID: ${p.id}).`;
          const detail = ` Teks: ${nameTxt}; Gaya: ${style}.`;
          const url = `https://wa.me/6281234567890?text=${encodeURIComponent(intro + detail)}`;
          window.open(url, '_blank');
        });
      }
    } catch(e){
      container.innerHTML = `<div class="card">Gagal memuat detail: ${e.message}</div>`;
    }
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', load); } else { load(); }
})();