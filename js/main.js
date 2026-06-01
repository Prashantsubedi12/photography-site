/* ============================================
   PRASHANT CAPTURES — main.js
   Handles: Nav, Hamburger, Language Toggle
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

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('nav-open');
  hamburger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav when a link is clicked (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('nav-open');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('nav-open')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('nav-open');
    document.body.style.overflow = '';
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
const langToggle = document.getElementById('langToggle'); // navbar button (always)
const langFloat  = document.getElementById('langFloat');  // floating button (mobile only)

// Load saved language (default = 'en')
let currentLang = localStorage.getItem('lang') || 'en';

function applyLanguage(lang) {
  // Swap all text elements that have data-en attribute
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  // Label shows what language you CAN switch TO
  const label = lang === 'en' ? '日本語' : 'EN';
  if (langToggle) langToggle.textContent = label;
  if (langFloat)  langFloat.textContent  = label;
}

// Apply saved language immediately on every page load
applyLanguage(currentLang);

// Navbar button click
if (langToggle) {
  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'jp' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
  });
}

// Floating button click (mobile)
if (langFloat) {
  langFloat.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'jp' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
  });
}