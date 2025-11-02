// Script untuk animasi dan interaktivitas halaman kontak
document.addEventListener('DOMContentLoaded', function() {
  // Animasi untuk elemen-elemen pada halaman kontak
  function setupAnimations() {
    // Animasi untuk info-item dengan delay bertahap
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach((item, index) => {
      item.style.animationDelay = `${0.1 * index}s`;
    });
    
    // Efek hover pada tombol sosial media
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        this.classList.add('pulse');
      });
      btn.addEventListener('animationend', function() {
        this.classList.remove('pulse');
      });
    });
    
    // Animasi untuk form input saat focus
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
      control.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });
      control.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
      });
    });
  }
  
  // Inisialisasi peta Leaflet jika ada container peta
  function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Koordinat lokasi SDL KNIVES
    const lat = -7.0543;
    const lng = 107.4778;
    
    // Inisialisasi peta
    const map = L.map('map').setView([lat, lng], 15);
    
    // Tambahkan layer peta
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Tambahkan marker
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>SDL KNIVES</b><br>Kampung Pandai Besi Salamanjah").openPopup();
  }
  
  // Validasi form kontak
  function setupFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validasi sederhana
      let valid = true;
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      
      if (!name.value.trim()) {
        valid = false;
        name.classList.add('error');
      } else {
        name.classList.remove('error');
      }
      
      if (!email.value.trim() || !email.value.includes('@')) {
        valid = false;
        email.classList.add('error');
      } else {
        email.classList.remove('error');
      }
      
      if (!message.value.trim()) {
        valid = false;
        message.classList.add('error');
      } else {
        message.classList.remove('error');
      }
      
      if (valid) {
        // Simulasi pengiriman form
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';
        
        // Simulasi delay pengiriman
        setTimeout(() => {
          // Reset form
          contactForm.reset();
          
          // Tampilkan pesan sukses
          const successMsg = document.createElement('div');
          successMsg.className = 'alert success';
          successMsg.textContent = 'Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.';
          
          contactForm.prepend(successMsg);
          
          // Reset tombol
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          
          // Hilangkan pesan setelah beberapa detik
          setTimeout(() => {
            successMsg.remove();
          }, 5000);
        }, 1500);
      }
    });
  }
  
  // Inisialisasi semua fungsi
  setupAnimations();
  initMap();
  setupFormValidation();
  
  // Efek parallax pada hero section
  const heroSection = document.querySelector('.contact-hero');
  if (heroSection) {
    window.addEventListener('scroll', function() {
      const scrollPosition = window.scrollY;
      heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    });
  }
});