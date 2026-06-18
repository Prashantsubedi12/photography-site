/* ============================================
   GALLERY PAGE — LIGHTBOX
   Used by: portfolio/portraits.html, events.html, friends.html
   ============================================ */

(function () {
  const lightbox         = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxImg      = document.getElementById('lightboxImg');

  const lightboxCounter  = document.getElementById('lightboxCounter');
  const lightboxClose    = document.getElementById('lightboxClose');
  const lightboxPrev     = document.getElementById('lightboxPrev');
  const lightboxNext     = document.getElementById('lightboxNext');

  if (!lightbox) return;

  const items = [...document.querySelectorAll('.masonry-item')];
  let currentIndex = 0;

  function updateLightbox(index, animate) {
    const item = items[index];
    const img  = item.querySelector('img');

    if (animate) {
      lightboxImg.classList.add('fading');
      setTimeout(() => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxImg.classList.remove('fading');
      }, 150);
    } else {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }


    if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${items.length}`;
    currentIndex = index;
  }

  function openLightbox(index) {
    updateLightbox(index, false);
    lightbox.classList.add('open');
    lightboxBackdrop.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxBackdrop.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  }

  function showNext() {
    updateLightbox((currentIndex + 1) % items.length, true);
  }

  function showPrev() {
    updateLightbox((currentIndex - 1 + items.length) % items.length, true);
  }

  // Open on click
  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  // Controls
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNext);
  lightboxPrev.addEventListener('click', showPrev);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft')  showPrev();
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
  }, { passive: true });

}());
