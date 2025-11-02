// Script untuk menampilkan semua produk di katalog
document.addEventListener('DOMContentLoaded', function() {
  if (window.__catalogModern) return; // gunakan script katalog modern jika tersedia
  // Fungsi untuk menampilkan semua produk
  function showAllProducts() {
    const catalogSection = document.getElementById('catalog');
    const loadMoreBtn = document.getElementById('loadMore');
    
    // Tampilkan semua produk (hapus batasan pagination)
    if (window.renderProducts) {
      window.renderProducts(null, 1000); // Tampilkan hingga 1000 produk (praktis semua)
    }
    
    // Sembunyikan tombol "Muat lebih" karena semua produk sudah ditampilkan
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }
  }
  
  // Tambahkan event listener ke tombol "Lihat Semua Produk"
  const viewAllBtn = document.getElementById('viewAllProducts');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showAllProducts();
      // Scroll ke bagian katalog
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // Tambahkan event listener ke chip "Semua"
  const allChip = document.querySelector('.chip[data-filter="all"]');
  if (allChip) {
    allChip.addEventListener('click', showAllProducts);
  }
  
  // Override fungsi pagination untuk menampilkan lebih banyak produk per halaman
  if (window.initPagination) {
    const originalInitPagination = window.initPagination;
    window.initPagination = function(total) {
      originalInitPagination(total);
      // Tambahkan event listener ke tombol "Muat lebih"
      const loadMoreBtn = document.getElementById('loadMore');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', showAllProducts);
      }
    };
  }
});