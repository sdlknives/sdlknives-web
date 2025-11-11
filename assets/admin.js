// Admin panel logic moved from inline script to comply with CSP
const USE_SUPABASE = !!(window && window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
const rupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
let currentId = null;
let uploadedImages = []; // Store uploaded image data
let uploadedVideos = []; // Store uploaded video data

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

// Image upload functionality
function initImageUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('imageFiles');
  const previewGrid = document.getElementById('imagePreviewGrid');
  const addUrlBtn = document.getElementById('addUrlBtn');
  const imageUrlInput = document.getElementById('imageUrl');

  // Click to select files
  uploadArea.addEventListener('click', () => fileInput.click());

  // Drag and drop functionality
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    if (imageFiles.length) handleFileSelection(imageFiles);
    if (videoFiles.length) handleVideoFileSelection(videoFiles);
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    if (imageFiles.length) handleFileSelection(imageFiles);
    if (videoFiles.length) handleVideoFileSelection(videoFiles);
  });

  // Add URL button
  addUrlBtn.addEventListener('click', () => {
    const url = imageUrlInput.value.trim();
    if (url) {
      addImageFromUrl(url);
      imageUrlInput.value = '';
    }
  });

  // Enter key on URL input
  imageUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addUrlBtn.click();
    }
  });
}

// Video upload functionality
function initVideoUpload() {
  const uploadArea = document.getElementById('videoUploadArea');
  const fileInput = document.getElementById('videoFiles');
  const addUrlBtn = document.getElementById('addVideoUrlBtn');
  const urlInput = document.getElementById('videoUrl');
  if (!uploadArea) return;
  uploadArea.addEventListener('click', () => fileInput?.click());
  uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
  uploadArea.addEventListener('dragleave', () => { uploadArea.classList.remove('dragover'); });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    handleVideoFileSelection(files);
  });
  fileInput?.addEventListener('change', (e) => { const files = Array.from(e.target.files||[]); handleVideoFileSelection(files); });
  addUrlBtn?.addEventListener('click', () => { const url = urlInput?.value.trim(); if (url) { addVideoFromUrl(url); if (urlInput) urlInput.value=''; } });
  urlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addUrlBtn?.click(); });
}

async function handleVideoFileSelection(files) {
  if (!files || files.length === 0) return;
  if (uploadedVideos.length + files.length > 5) { alert('Maksimal 5 video per produk'); return; }
  try {
    showVideoUploadProgress(true);
    if (USE_SUPABASE) {
      const results = [];
      for (const file of files) {
        try {
          const meta = await window.supaUploadImage(file);
          uploadedVideos.push(meta);
          results.push({ ok: true, name: file.name });
        } catch (err) {
          results.push({ ok: false, name: file.name, error: err?.message || String(err) });
        }
      }
      updateVideoPreview();
      const errs = results.filter(r => !r.ok).map(r => `${r.name}: ${r.error}`);
      if (errs.length) alert('Beberapa file gagal diupload\n' + errs.join('\n'));
    } else {
      const formData = new FormData();
      files.forEach(file => formData.append('videos[]', file));
      const response = await fetch('api/upload.php', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success && result.uploaded_files?.length) {
        result.uploaded_files.forEach(f => uploadedVideos.push({ type:'upload', path:f.path, filename:f.filename, original_name:f.original_name }));
        updateVideoPreview();
      }
      if (result.errors?.length) alert('Beberapa file gagal diupload\n' + result.errors.join('\n'));
    }
  } catch (error) {
    alert('Gagal mengupload video: ' + (error?.message || error));
  } finally {
    showVideoUploadProgress(false);
  }
}

function addVideoFromUrl(url) {
  if (uploadedVideos.some(v => v.path === url)) { alert('URL video sudah ditambahkan'); return; }
  if (uploadedVideos.length >= 5) { alert('Maksimal 5 video per produk'); return; }
  uploadedVideos.push({ type:'url', path:url, filename:url.split('/').pop()||'video', original_name:url });
  updateVideoPreview();
}

function updateVideoPreview() {
  // Render gabungan gambar + video ke grid yang sama
  renderMediaPreviewGrid();
  const cnt = document.getElementById('videoUploadCount');
  if (cnt) cnt.textContent = `${uploadedVideos.length}/5`;
  renderVideoUploadTable();
}

function removeVideo(index) { uploadedVideos.splice(index, 1); updateVideoPreview(); }
function moveVideoLeft(index) { if (index <= 0 || index >= uploadedVideos.length) return; const tmp = uploadedVideos[index-1]; uploadedVideos[index-1]=uploadedVideos[index]; uploadedVideos[index]=tmp; updateVideoPreview(); }
function moveVideoRight(index) { if (index < 0 || index >= uploadedVideos.length-1) return; const tmp = uploadedVideos[index+1]; uploadedVideos[index+1]=uploadedVideos[index]; uploadedVideos[index]=tmp; updateVideoPreview(); }

function showVideoUploadProgress(show) {
  const area = document.getElementById('videoUploadArea');
  if (!area) return;
  const overlay = area.querySelector('.loading-overlay');
  if (show) { area.classList.add('loading'); if (overlay) overlay.style.display='flex'; area.style.pointerEvents='none'; }
  else { area.classList.remove('loading'); if (overlay) overlay.style.display='none'; area.style.pointerEvents='auto'; }
}

function clearVideoUpload() {
  uploadedVideos = [];
  updateVideoPreview();
  const files = document.getElementById('videoFiles');
  const url = document.getElementById('videoUrl');
  if (files) files.value = '';
  if (url) url.value = '';
}

async function handleFileSelection(files) {
  if (files.length === 0) return;

  // Check total images limit
  if (uploadedImages.length + files.length > 5) {
    alert('Maksimal 5 gambar per produk');
    return;
  }

  try {
    showUploadProgress(true);
    if (USE_SUPABASE) {
      const results = [];
      for (const file of files) {
        try {
          const meta = await window.supaUploadImage(file);
          uploadedImages.push(meta);
          results.push({ ok: true, name: file.name });
        } catch (err) {
          results.push({ ok: false, name: file.name, error: err.message || String(err) });
        }
      }
      updateImagePreview();
      const errs = results.filter(r => !r.ok).map(r => `${r.name}: ${r.error}`);
      if (errs.length) alert('Beberapa file gagal diupload:\n' + errs.join('\n'));
    } else {
      const formData = new FormData();
      files.forEach(file => formData.append('images[]', file));
      const response = await fetch('api/upload.php', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success && result.uploaded_files.length > 0) {
        result.uploaded_files.forEach(file => {
          uploadedImages.push({ type: 'upload', path: file.path, filename: file.filename, original_name: file.original_name });
        });
        updateImagePreview();
      }
      if (result.errors.length > 0) alert('Beberapa file gagal diupload:\n' + result.errors.join('\n'));
    }
  } catch (error) {
    alert('Gagal mengupload gambar: ' + error.message);
  } finally {
    showUploadProgress(false);
  }
}

function addImageFromUrl(url) {
  // Check if URL is already added
  if (uploadedImages.some(img => img.path === url)) {
    alert('URL gambar sudah ditambahkan');
    return;
  }

  // Check total images limit
  if (uploadedImages.length >= 5) {
    alert('Maksimal 5 gambar per produk');
    return;
  }

  uploadedImages.push({
    type: 'url',
    path: url,
    filename: url.split('/').pop() || 'image',
    original_name: url
  });

  updateImagePreview();
}

function updateImagePreview() {
  const grid = document.getElementById('imagePreviewGrid');
  const cnt = document.getElementById('uploadCount');
  if (!uploadedImages.length && !uploadedVideos.length) {
    if (grid) grid.innerHTML = '';
    if (cnt) cnt.textContent = '0/5';
    renderUploadTable();
    renderVideoUploadTable();
    return;
  }
  renderMediaPreviewGrid();
  if (cnt) cnt.textContent = `${uploadedImages.length}/5`;
  renderUploadTable();
}

function renderMediaPreviewGrid() {
  const grid = document.getElementById('imagePreviewGrid');
  if (!grid) return;
  const imageCards = uploadedImages.map((img, index) => `
    <div class="image-preview-item">
      ${index === 0 ? '<span class="primary-badge">Utama</span>' : ''}
      <img src="${img.path}" alt="${img.filename}" loading="lazy" />
      <div class="image-actions">
        ${index > 0 ? `<button type=\"button\" class=\"move-btn left\" onclick=\"moveImageLeft(${index})\" title=\"Pindah kiri\"><i class=\"bi bi-arrow-left\"></i></button>` : ''}
        ${index < uploadedImages.length - 1 ? `<button type=\"button\" class=\"move-btn right\" onclick=\"moveImageRight(${index})\" title=\"Pindah kanan\"><i class=\"bi bi-arrow-right\"></i></button>` : ''}
        ${index !== 0 ? `<button type=\"button\" class=\"primary-btn\" onclick=\"setPrimaryImage(${index})\" title=\"Jadikan utama\"><i class=\"bi bi-star\"></i></button>` : ''}
        <button type="button" class="remove-btn" onclick="removeImage(${index})" title="Hapus gambar"><i class="bi bi-x"></i></button>
      </div>
    </div>
  `);
  const videoCards = uploadedVideos.map((vid, index) => `
    <div class="image-preview-item">
      <video src="${vid.path}" muted playsinline controls preload="metadata"></video>
      <div class="image-actions">
        ${index > 0 ? `<button type=\"button\" class=\"move-btn left\" onclick=\"moveVideoLeft(${index})\" title=\"Pindah kiri\"><i class=\"bi bi-arrow-left\"></i></button>` : ''}
        ${index < uploadedVideos.length - 1 ? `<button type=\"button\" class=\"move-btn right\" onclick=\"moveVideoRight(${index})\" title=\"Pindah kanan\"><i class=\"bi bi-arrow-right\"></i></button>` : ''}
        <button type="button" class="remove-btn" onclick="removeVideo(${index})" title="Hapus video"><i class="bi bi-x"></i></button>
      </div>
    </div>
  `);
  grid.innerHTML = [...imageCards, ...videoCards].join('');
}

function removeImage(index) {
  uploadedImages.splice(index, 1);
  updateImagePreview();
}

function showUploadProgress(show) {
  const uploadArea = document.getElementById('uploadArea');
  const overlay = uploadArea.querySelector('.loading-overlay');
  if (show) {
    uploadArea.classList.add('loading');
    if (overlay) overlay.style.display = 'flex';
    uploadArea.style.pointerEvents = 'none';
  } else {
    uploadArea.classList.remove('loading');
    if (overlay) overlay.style.display = 'none';
    uploadArea.style.pointerEvents = 'auto';
  }
}

function clearImageUpload() {
  uploadedImages = [];
  updateImagePreview();
  document.getElementById('imageFiles').value = '';
  document.getElementById('imageUrl').value = '';
}

function setPrimaryImage(index) {
  if (index <= 0 || index >= uploadedImages.length) return;
  const [img] = uploadedImages.splice(index, 1);
  uploadedImages.unshift(img);
  updateImagePreview();
}

function moveImageLeft(index) {
  if (index <= 0 || index >= uploadedImages.length) return;
  const tmp = uploadedImages[index - 1];
  uploadedImages[index - 1] = uploadedImages[index];
  uploadedImages[index] = tmp;
  updateImagePreview();
}

function moveImageRight(index) {
  if (index < 0 || index >= uploadedImages.length - 1) return;
  const tmp = uploadedImages[index + 1];
  uploadedImages[index + 1] = uploadedImages[index];
  uploadedImages[index] = tmp;
  updateImagePreview();
}

// Render tabel daftar gambar terunggah
function renderUploadTable() {
  const tbody = document.getElementById('uploadedImagesTbody');
  if (!tbody) return;
  if (!uploadedImages.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="muted">Belum ada gambar</td></tr>';
    return;
  }
  tbody.innerHTML = uploadedImages.map((img, index) => {
    const source = img.type === 'url' ? 'URL' : 'Upload';
    let host = '';
    try { host = img.type === 'url' ? new URL(img.path).host : 'Storage'; } catch {}
    const primary = index === 0 ? '<span class="pill green">Utama</span>' : '';
    return `
      <tr>
        <td><img class="thumb" src="${img.path}" alt="${img.filename}" /></td>
        <td>${img.filename} ${primary}</td>
        <td>${source}${host ? ` • ${host}` : ''}</td>
        <td class="actions">
          ${index > 0 ? `<button type="button" class="btn small" onclick="moveImageLeft(${index})" title="Ke atas"><i class="bi bi-arrow-up"></i></button>` : ''}
          ${index < uploadedImages.length - 1 ? `<button type="button" class="btn small" onclick="moveImageRight(${index})" title="Ke bawah"><i class="bi bi-arrow-down"></i></button>` : ''}
          ${index !== 0 ? `<button type="button" class="btn small" onclick="setPrimaryImage(${index})" title="Jadikan utama"><i class="bi bi-star"></i></button>` : ''}
          <button type="button" class="btn small danger" onclick="removeImage(${index})" title="Hapus"><i class="bi bi-trash"></i></button>
          <a class="btn small" href="${img.path}" target="_blank" rel="noopener noreferrer" title="Buka"><i class="bi bi-box-arrow-up-right"></i></a>
        </td>
      </tr>
    `;
  }).join('');
}

// Render tabel video terunggah
function renderVideoUploadTable() {
  const tbody = document.getElementById('uploadedVideosTbody');
  if (!tbody) return;
  if (!uploadedVideos.length) { tbody.innerHTML = '<tr><td colspan="4" class="muted">Belum ada video</td></tr>'; return; }
  tbody.innerHTML = uploadedVideos.map((vid, index) => {
    const source = vid.type === 'url' ? 'URL' : 'Upload';
    let host = '';
    try { host = vid.type === 'url' ? new URL(vid.path).host : 'Storage'; } catch {}
    return `
      <tr>
        <td><span class="thumb video"><i class="bi bi-camera-video"></i></span></td>
        <td>${vid.filename}</td>
        <td>${source}${host ? ` • ${host}` : ''}</td>
        <td class="actions">
          ${index > 0 ? `<button type="button" class="btn small" onclick="moveVideoLeft(${index})" title="Ke atas"><i class="bi bi-arrow-up"></i></button>` : ''}
          ${index < uploadedVideos.length - 1 ? `<button type="button" class="btn small" onclick="moveVideoRight(${index})" title="Ke bawah"><i class="bi bi-arrow-down"></i></button>` : ''}
          <button type="button" class="btn small danger" onclick="removeVideo(${index})" title="Hapus"><i class="bi bi-trash"></i></button>
          <a class="btn small" href="${vid.path}" target="_blank" rel="noopener" title="Buka"><i class="bi bi-box-arrow-up-right"></i></a>
        </td>
      </tr>
    `;
  }).join('');
}

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

async function loadProducts() {
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = '<tr><td colspan="4">Memuat…</td></tr>';
  try {
    let products = [];
    if (USE_SUPABASE) {
      products = await window.supaListProducts();
    } else {
      const data = await fetchJSON('api/products.php?action=list');
      products = data.products || [];
    }
    if (!products.length) { tbody.innerHTML = '<tr><td colspan="5">Belum ada produk</td></tr>'; return; }
    tbody.innerHTML = products.map(p => {
      const firstImg = (p.images && p.images[0]) ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0].path || '')) : '';
      const thumb = p.imageUrl || firstImg || '';
      const images = Array.isArray(p.images) ? p.images.map(it => typeof it === 'string' ? it : (it.path || '')).filter(Boolean) : [];
      const galleryHtml = images.length ? `<div class=\"cell-thumbs\">${images.slice(0,4).map(src => `<img class=\"thumb small\" src=\"${src}\" alt=\"thumb\" />`).join('')}${images.length > 4 ? `<span class=\"more-badge\">+${images.length - 4}</span>` : ''}</div>` : (thumb ? `<img class=\"thumb\" src=\"${thumb}\" alt=\"thumb\" />` : '<span class=\"pill gray\">Tidak ada</span>');
      return `
      <tr>
        <td>${galleryHtml}</td>
        <td>${p.name}</td>
        <td>${rupiah(p.price)}</td>
        <td>${p.visible !== false ? '<span class="pill green">Tampil</span>' : '<span class="pill gray">Tersembunyi</span>'}</td>
        <td class="actions">
          <button class="btn" onclick='editProduct(${JSON.stringify(p)})'><i class="bi bi-pencil"></i> Edit</button>
          <button class="btn" onclick='toggleProduct("${p.id}", ${p.visible !== false ? 'false' : 'true'})'>${p.visible !== false ? '<i class="bi bi-eye-slash"></i> Sembunyikan' : '<i class="bi bi-eye"></i> Tampilkan'}</button>
          <button class="btn" onclick='deleteProduct("${p.id}")'><i class="bi bi-trash"></i> Hapus</button>
        </td>
      </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5">Gagal memuat: ${e.message}</td></tr>`;
  }
}

function editProduct(p) {
  currentId = p.id;
  document.getElementById('name').value = p.name || '';
  document.getElementById('price').value = p.price || 0;
  document.getElementById('description').value = p.description || '';
  document.getElementById('visible').value = (p.visible !== false) ? 'true' : 'false';
  try {
    const catSel = document.getElementById('category');
    if (catSel) {
      const cat = p.category || inferCategoryLocal(p.name || '');
      catSel.value = cat || 'umum';
    }
  } catch {}
  
  // Handle images - support both single imageUrl and multiple images array
  clearImageUpload();
  clearVideoUpload();
  
  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
    // New format: multiple images
    uploadedImages = p.images.map(img => ({
      type: typeof img === 'string' ? 'url' : 'upload',
      path: typeof img === 'string' ? img : img.path,
      filename: typeof img === 'string' ? img.split('/').pop() : img.filename,
      original_name: typeof img === 'string' ? img : img.original_name
    }));
  } else if (p.imageUrl) {
    // Legacy format: single imageUrl
    uploadedImages = [{
      type: 'url',
      path: p.imageUrl,
      filename: p.imageUrl.split('/').pop() || 'image',
      original_name: p.imageUrl
    }];
  }
  
  updateImagePreview();
  // Handle videos
  if (p.videos && Array.isArray(p.videos) && p.videos.length > 0) {
    uploadedVideos = p.videos.map(v => ({ type: typeof v === 'string' ? 'url' : 'upload', path: typeof v === 'string' ? v : v.path, filename: typeof v === 'string' ? v.split('/').pop() : v.filename, original_name: typeof v === 'string' ? v : v.original_name }));
  } else if (p.videoUrl) {
    uploadedVideos = [{ type:'url', path:p.videoUrl, filename:p.videoUrl.split('/').pop()||'video', original_name:p.videoUrl }];
  }
  updateVideoPreview();
}

async function toggleProduct(id, visible) {
  if (USE_SUPABASE) {
    await window.supaToggleVisibility(id, !!visible);
  } else {
    const fd = new FormData();
    fd.append('action', 'toggle_visibility');
    fd.append('id', id);
    fd.append('visible', visible ? 'true' : 'false');
    await fetchJSON('api/products.php', { method: 'POST', body: fd });
  }
  loadProducts();
}

async function deleteProduct(id) {
  if (!confirm('Hapus produk ini?')) return;
  if (USE_SUPABASE) {
    await window.supaDeleteProduct(id);
  } else {
    const fd = new FormData();
    fd.append('action', 'delete');
    fd.append('id', id);
    await fetchJSON('api/products.php', { method: 'POST', body: fd });
  }
  if (currentId === id) resetForm();
  loadProducts();
}

function resetForm() {
  currentId = null;
  document.getElementById('name').value = '';
  document.getElementById('price').value = '';
  document.getElementById('description').value = '';
  document.getElementById('visible').value = 'true';
  const catSel = document.getElementById('category');
  if (catSel) catSel.value = 'umum';
  clearImageUpload();
  clearVideoUpload();
}

async function saveProduct() {
  const name = document.getElementById('name').value.trim();
  const price = parseInt(document.getElementById('price').value || '0', 10);
  const description = document.getElementById('description').value.trim();
  const visible = document.getElementById('visible').value === 'true';
  
  if (!name || price <= 0) { 
    alert('Nama dan harga wajib diisi'); 
    return; 
  }

  const payload = {
    name,
    price,
    description,
    visible,
    images: uploadedImages.map(img => ({ type: img.type, path: img.path, filename: img.filename, original_name: img.original_name })),
    videos: uploadedVideos.map(v => ({ type: v.type, path: v.path, filename: v.filename, original_name: v.original_name })),
  };
  const category = (document.getElementById('category')?.value) || 'umum';

  try {
    let savedProduct = null;
    if (USE_SUPABASE) {
      // Try sending category to Supabase if the column exists; fallback if not
      const payloadWithCat = { ...payload, category };
      try {
        if (currentId) {
          savedProduct = await window.supaUpdateProduct(currentId, payloadWithCat);
        } else {
          savedProduct = await window.supaCreateProduct(payloadWithCat);
        }
      } catch (e) {
        const msg = (e && e.message) ? String(e.message).toLowerCase() : '';
        const missingCol = msg.includes('column') && (msg.includes('category') || msg.includes('videos')) && (msg.includes('does not exist') || msg.includes('missing'));
        if (missingCol) {
          // Retry without category to stay compatible with older schemas
          const payloadNoExtras = { ...payload }; delete payloadNoExtras.category; delete payloadNoExtras.videos;
          if (currentId) { savedProduct = await window.supaUpdateProduct(currentId, payloadNoExtras); }
          else { savedProduct = await window.supaCreateProduct(payloadNoExtras); }
        } else {
          throw e;
        }
      }
    } else {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('price', String(price));
      fd.append('description', description);
      fd.append('visible', visible ? 'true' : 'false');
      fd.append('images', JSON.stringify(payload.images));
      fd.append('videos', JSON.stringify(payload.videos));
      fd.append('category', category);
      if (currentId) { fd.append('action', 'update'); fd.append('id', currentId); }
      else { fd.append('action', 'create'); }
      const resp = await fetchJSON('api/products.php', { method: 'POST', body: fd });
      savedProduct = resp.product || null;
    }
    resetForm();
    loadProducts();
    showPostSaveNotice(savedProduct, currentId ? 'update' : 'create');
  } catch (error) {
    alert('Gagal menyimpan produk: ' + error.message);
  }
}

// Kategorisasi lokal untuk admin (mirror dari katalog)
function inferCategoryLocal(name = '') {
  const s = String(name).toLowerCase();
  if (s.includes('pisau')) return 'pisau';
  if (s.includes('carok')) return 'carok';
  if (s.includes('paket') || s.includes('paketan')) return 'paketan';
  if (s.includes('kampak') || s.includes('kapak') || s.includes('kopak')) return 'kampak';
  if (s.includes('katana') || s.includes('samurai')) return 'katana';
  if (s.includes('golok')) return 'Golok';
  if (s.includes('damascus')) return 'damascus';
  if (s.includes('alat') || s.includes('aksesori') || s.includes('sarung') || s.includes('sheath') || s.includes('batu asah') || s.includes('whetstone')) return 'alat';
  if (s.includes('chef') || s.includes('dapur')) return 'dapur';
  if (s.includes('lipat') || s.includes('edc')) return 'edc';
  return 'umum';
}

function showPostSaveNotice(product, mode) {
  try {
    const host = document.getElementById('form-section') || document.body;
    let notice = document.getElementById('saveNotice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'saveNotice';
      notice.className = 'save-notice';
      host.appendChild(notice);
    }
    const name = product?.name || 'Produk';
    const id = product?.id ? String(product.id) : '';
    const detailHref = id ? `product.html?id=${encodeURIComponent(id)}` : 'catalog.html';
    const catalogHref = 'catalog.html';
    notice.innerHTML = `
      <div class="save-notice-inner">
        <div class="text"><i class="bi bi-check-circle"></i> ${mode === 'update' ? 'Produk diperbarui' : 'Produk ditambahkan'}: <strong>${name}</strong></div>
        <div class="actions">
          <a class="btn btn-primary" href="${catalogHref}" target="_blank" rel="noopener"><i class="bi bi-grid"></i> Lihat katalog</a>
          <a class="btn" href="${detailHref}" target="_blank" rel="noopener"><i class="bi bi-eye"></i> Lihat produk</a>
          <button class="btn icon" aria-label="Tutup" id="dismissSaveNotice"><i class="bi bi-x"></i></button>
        </div>
      </div>
    `;
    notice.style.display = 'block';
    const dismiss = notice.querySelector('#dismissSaveNotice');
    dismiss?.addEventListener('click', () => { notice.style.display = 'none'; });
    // Auto-hide after 10s
    clearTimeout(window.__saveNoticeTimer);
    window.__saveNoticeTimer = setTimeout(() => { notice.style.display = 'none'; }, 10000);
  } catch (e) {
    // fallback to alert if notice cannot be rendered
    alert((mode === 'update' ? 'Produk diperbarui' : 'Produk ditambahkan') + (product?.name ? (': ' + product.name) : ''));
  }
}

// ==== Auth admin sederhana: login/status/logout ====
async function checkAuth() {
  try {
    let logged = false;
    if (USE_SUPABASE) {
      const user = await window.supaGetUser();
      logged = !!user;
    } else {
      const res = await fetch('api/auth.php?action=status');
      const data = await res.json();
      logged = !!data.logged_in;
    }
    document.getElementById('login-section').style.display = logged ? 'none' : 'block';
    document.getElementById('form-section').style.display = logged ? 'block' : 'none';
    document.getElementById('list-section').style.display = logged ? 'block' : 'none';
    if (logged) { loadProducts(); }
  } catch (e) {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('form-section').style.display = 'none';
    document.getElementById('list-section').style.display = 'none';
  }
}

async function login() {
  try {
    const emailEl = document.getElementById('adminEmail');
    const passEl = document.getElementById('adminPassword');
    const loginErrEl = document.getElementById('loginError');
    const emailErrEl = document.getElementById('emailError');
    const passErrEl = document.getElementById('passwordError');
    const loginBtn = document.getElementById('loginBtn');

    // Clear previous errors
    if (loginErrEl) loginErrEl.textContent = '';
    if (emailErrEl) emailErrEl.textContent = '';
    if (passErrEl) passErrEl.textContent = '';
    emailEl?.classList.remove('invalid');
    passEl?.classList.remove('invalid');

    const email = emailEl?.value.trim() || '';
    const pass = passEl?.value || '';

    // Validation
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    let invalid = false;
    if (USE_SUPABASE) {
      if (!email) { if (emailErrEl) emailErrEl.textContent = 'Email wajib diisi'; emailEl?.classList.add('invalid'); invalid = true; }
      else if (!isValidEmail(email)) { if (emailErrEl) emailErrEl.textContent = 'Format email tidak valid'; emailEl?.classList.add('invalid'); invalid = true; }
    }
    if (!pass) { if (passErrEl) passErrEl.textContent = 'Password wajib diisi'; passEl?.classList.add('invalid'); invalid = true; }
    else if (pass.length < 8) { if (passErrEl) passErrEl.textContent = 'Minimal 8 karakter'; passEl?.classList.add('invalid'); invalid = true; }

    if (invalid) { return; }

    // UI feedback
    let originalText = loginBtn?.innerHTML;
    if (loginBtn) { loginBtn.disabled = true; loginBtn.innerHTML = '<i class="bi bi-hourglass"></i> Memproses…'; }

    if (USE_SUPABASE) {
      await window.supaSignIn(email, pass);
      checkAuth();
    } else {
      const fd = new FormData();
      fd.append('action', 'login');
      fd.append('password', pass);
      const res = await fetch('api/auth.php', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Gagal login');
      checkAuth();
    }
  } catch (e) {
    const loginErrEl = document.getElementById('loginError');
    if (loginErrEl) loginErrEl.textContent = 'Login gagal: ' + (e?.message || e);
    else alert('Login gagal: ' + (e?.message || e));
  }
  finally {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) { loginBtn.disabled = false; loginBtn.innerHTML = '<i class="bi bi-door-open"></i> Masuk'; }
  }
}

async function logout() {
  try {
    if (USE_SUPABASE) {
      await window.supaSignOut();
    } else {
      await fetch('api/auth.php?action=logout');
    }
  } catch (e) {}
  checkAuth();
}

// Bind event listeners saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveBtn')?.addEventListener('click', saveProduct);
  document.getElementById('resetBtn')?.addEventListener('click', resetForm);
  document.getElementById('loginBtn')?.addEventListener('click', login);
  document.getElementById('signupBtn')?.addEventListener('click', signup);
  document.getElementById('resendBtn')?.addEventListener('click', resendVerification);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('clearUploadBtn')?.addEventListener('click', clearImageUpload);
  document.getElementById('clearVideoUploadBtn')?.addEventListener('click', clearVideoUpload);
  
  // Login form interactions & validation feedback
  const emailEl = document.getElementById('adminEmail');
  const passEl = document.getElementById('adminPassword');
  const emailErrEl = document.getElementById('emailError');
  const passErrEl = document.getElementById('passwordError');
  const loginErrEl = document.getElementById('loginError');
  const toggleBtn = document.getElementById('togglePassword');
  const form = document.getElementById('loginForm');

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  emailEl?.addEventListener('input', () => {
    if (loginErrEl) loginErrEl.textContent = '';
    const v = emailEl.value.trim();
    emailEl.classList.remove('invalid');
    if (USE_SUPABASE && v && !isValidEmail(v)) {
      if (emailErrEl) emailErrEl.textContent = 'Format email tidak valid';
      emailEl.classList.add('invalid');
    } else {
      if (emailErrEl) emailErrEl.textContent = '';
    }
  });

  passEl?.addEventListener('input', () => {
    if (loginErrEl) loginErrEl.textContent = '';
    const len = passEl.value.length;
    passEl.classList.remove('invalid');
    if (len > 0 && len < 8) {
      if (passErrEl) passErrEl.textContent = 'Minimal 8 karakter';
      passEl.classList.add('invalid');
    } else {
      if (passErrEl) passErrEl.textContent = '';
    }
  });

  toggleBtn?.addEventListener('click', () => {
    const isPwd = passEl?.getAttribute('type') === 'password';
    passEl?.setAttribute('type', isPwd ? 'text' : 'password');
    const icon = toggleBtn.querySelector('i');
    if (icon) { icon.className = isPwd ? 'bi bi-eye-slash' : 'bi bi-eye'; }
    toggleBtn.setAttribute('aria-label', isPwd ? 'Sembunyikan password' : 'Tampilkan password');
  });

  form?.addEventListener('submit', (e) => { e.preventDefault(); login(); });
  
  // Initialize image upload functionality
  initImageUpload();
  // Initialize video upload functionality
  initVideoUpload();
  
  checkAuth();
});

// Daftar admin via Supabase Auth
async function signup() {
  try {
    if (!USE_SUPABASE) { alert('Supabase tidak aktif. Tidak bisa daftar di mode lokal.'); return; }
    const email = document.getElementById('adminEmail').value.trim();
    const pass = document.getElementById('adminPassword').value;
    if (!email || !pass) { alert('Email dan password wajib diisi'); return; }
    await window.supaSignUp(email, pass);
    alert('Akun dibuat. Silakan cek email untuk verifikasi sebelum login.');
  } catch (e) {
    alert('Gagal daftar: ' + (e?.message || e));
  }
}

// Kirim ulang email verifikasi
async function resendVerification() {
  try {
    if (!USE_SUPABASE) { alert('Supabase tidak aktif. Tidak bisa mengirim verifikasi di mode lokal.'); return; }
    const email = document.getElementById('adminEmail').value.trim();
    if (!email) { alert('Masukkan email untuk mengirim ulang verifikasi.'); return; }
    await window.supaResendVerification(email);
    alert('Email verifikasi dikirim ulang. Periksa inbox/spam email Anda.');
  } catch (e) {
    alert('Gagal kirim ulang verifikasi: ' + (e?.message || e));
  }
}