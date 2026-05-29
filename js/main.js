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
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('nav-open');
});

// Close nav when a link is clicked (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('nav-open');
  });
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

// ---------- LANGUAGE TOGGLE (EN ↔ JP) ----------
const langToggle = document.getElementById('langToggle');
let currentLang  = 'en';

langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'jp' : 'en';
  langToggle.textContent = currentLang === 'en' ? 'JP' : 'EN';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
});