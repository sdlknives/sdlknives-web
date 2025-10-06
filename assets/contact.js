// Interaksi halaman Kontak: validasi form, build tautan WA, micro-animasi
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WHATSAPP_NUMBER = '6281234567890';

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  function sanitizePhone(v){
    const digits = (v || '').replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    return digits;
  }
  function validEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''); }

  function buildWA(){
    const name = encodeURIComponent(q('#cname')?.value.trim() || '');
    const email = encodeURIComponent(q('#cemail')?.value.trim() || '');
    const wa = encodeURIComponent(sanitizePhone(q('#cwa')?.value.trim() || ''));
    const msg = encodeURIComponent(q('#cmsg')?.value.trim() || '');
    const text = `Halo Admin SDL KNIVES,%0A%0A` +
      `Nama: ${name}%0A` +
      `Email: ${email}%0A` +
      `WA: ${wa}%0A` +
      `Pesan: ${msg}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  }

  function setFeedback(message, type='info'){
    const fb = q('#formFeedback');
    if (!fb) return;
    fb.textContent = message || '';
    fb.classList.toggle('error', type === 'error');
    fb.classList.toggle('success', type === 'success');
  }

  function markInvalid(el){
    el?.classList.add('invalid');
    if (!prefersReduced) el?.classList.add('shake');
    setTimeout(()=>{ el?.classList.remove('shake'); }, 600);
  }

  function setupForm(){
    const form = q('#contactForm');
    const waLink = q('#waLink');
    if (!form) return;

    // Real-time sanitasi WA
    const cwa = q('#cwa');
    cwa?.addEventListener('input', ()=>{ cwa.value = sanitizePhone(cwa.value); });

    // Hilangkan state invalid saat user memperbaiki
    qa('#cname, #cemail, #cwa, #cmsg').forEach(el => {
      el.addEventListener('input', ()=> el.classList.remove('invalid'));
    });

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nameEl = q('#cname');
      const emailEl = q('#cemail');
      const msgEl = q('#cmsg');
      const name = (nameEl?.value || '').trim();
      const email = (emailEl?.value || '').trim();
      const msg = (msgEl?.value || '').trim();
      let ok = true;
      if (!name) { ok = false; markInvalid(nameEl); }
      if (!validEmail(email)) { ok = false; markInvalid(emailEl); }
      if (!msg) { ok = false; markInvalid(msgEl); }
      if (!ok) { setFeedback('Lengkapi nama, email valid, dan pesan.', 'error'); return; }
      setFeedback('Membuka WhatsApp…', 'success');
      window.open(buildWA(), '_blank');
    });

    waLink?.addEventListener('click', (e)=>{
      waLink.href = buildWA();
    });
  }

  function setupCardMotion(){
    if (prefersReduced) return;
    qa('.info-list .info-item, .contact-card, .social-btn').forEach((el, idx)=>{
      el.style.setProperty('--i', idx);
      el.classList.add('animated-card');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ()=>{ setupForm(); setupCardMotion(); });
  } else {
    setupForm(); setupCardMotion();
  }
})();