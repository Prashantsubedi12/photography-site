/* ============================================
   PRASHANT CAPTURES — main.js
   Handles: Nav, Hamburger, Language Toggle, Hero Slider
   ============================================ */

// ---------- NAVBAR SCROLL EFFECT ----------
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 4px 20px rgba(92, 64, 51, 0.12)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});

// ---------- HAMBURGER MENU ----------
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

function openNav() {
  navLinks.classList.add('nav-open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.lenis) window.lenis.stop();
}

function closeNav() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('nav-open');
  document.body.style.overflow = '';
  if (window.lenis) window.lenis.start();
}

hamburger.addEventListener('click', () => {
  navLinks.classList.contains('nav-open') ? closeNav() : openNav();
});

// Close nav when a link is clicked (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('nav-open')) {
    closeNav();
  }
});

// ---------- ACTIVE NAV LINK ----------
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});

// ---------- LANGUAGE TOGGLE — PERSISTENT + DUAL BUTTON ----------
const langToggle = document.getElementById('langToggle');
const langFloat  = document.getElementById('langFloat');

let currentLang = localStorage.getItem('lang') || 'en';

function applyLanguage(lang) {
  // Swap textContent for all elements with data-en / data-jp
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });

  // Swap placeholder attributes for bilingual form fields
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    el.placeholder = lang === 'en' ? el.dataset.placeholderEn : el.dataset.placeholderJp;
  });

  // Label shows the language you can switch TO
  const label = lang === 'en' ? '日本語' : 'EN';
  if (langToggle) langToggle.textContent = label;
  if (langFloat)  langFloat.textContent  = label;
}

applyLanguage(currentLang);

if (langToggle) {
  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'jp' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
  });
}

if (langFloat) {
  langFloat.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'jp' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
  });
}

// ---------- HERO SLIDER ----------
(function () {
  const slides  = document.querySelectorAll('.hero-slide');
  const dots    = document.querySelectorAll('.hero-dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  if (!slides.length) return;

  let current = 0;
  let timer   = null;

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), 8000);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  // Dot navigation
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  // Arrow button navigation
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  // Keyboard navigation (ArrowLeft / ArrowRight)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
  });

  // Touch swipe on hero
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    let touchStartX = 0;
    heroEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? (goTo(current + 1), resetAuto()) : (goTo(current - 1), resetAuto());
      }
    }, { passive: true });

    // Pause on hover
    heroEl.addEventListener('mouseenter', () => clearInterval(timer));
    heroEl.addEventListener('mouseleave', startAuto);
  }

  startAuto();
}());
