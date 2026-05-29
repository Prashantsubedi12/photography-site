/* ============================================
   GALLERY FILTER + LIGHTBOX
   ============================================ */

// ---------- FILTER ----------
const filterBtns  = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      if (match) {
        item.classList.remove('hidden');
        item.classList.add('fade-in');
      } else {
        item.classList.add('hidden');
        item.classList.remove('fade-in');
      }
    });
  });
});

// ---------- LIGHTBOX ----------
const lightbox         = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxCaption  = document.getElementById('lightboxCaption');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxPrev     = document.getElementById('lightboxPrev');
const lightboxNext     = document.getElementById('lightboxNext');

// Only visible items
let visibleItems = [];
let currentIndex = 0;

function getVisibleItems() {
  return [...document.querySelectorAll('.gallery-item:not(.hidden)')];
}

function openLightbox(index) {
  visibleItems = getVisibleItems();
  currentIndex = index;
  const item   = visibleItems[currentIndex];
  const img    = item.querySelector('img');

  lightboxImg.src = img.src.replace('w=600', 'w=1200');
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;

  lightbox.classList.add('open');
  lightboxBackdrop.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxBackdrop.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showNext() {
  visibleItems = getVisibleItems();
  currentIndex = (currentIndex + 1) % visibleItems.length;
  const img = visibleItems[currentIndex].querySelector('img');
  lightboxImg.src = img.src.replace('w=600', 'w=1200');
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
}

function showPrev() {
  visibleItems = getVisibleItems();
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  const img = visibleItems[currentIndex].querySelector('img');
  lightboxImg.src = img.src.replace('w=600', 'w=1200');
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
}

// Open on click
document.querySelectorAll('.gallery-item').forEach((item, index) => {
  item.addEventListener('click', () => {
    visibleItems = getVisibleItems();
    const visibleIndex = visibleItems.indexOf(item);
    openLightbox(visibleIndex);
  });
});

// Controls
lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', showNext);
lightboxPrev.addEventListener('click', showPrev);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  showNext();
  if (e.key === 'ArrowLeft')   showPrev();
});

// Touch swipe support for mobile
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});
lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? showNext() : showPrev();
  }
});