/* main.js — nav, typing, star canvas, contact form */

/* ---- NAV SCROLL ---- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ---- MOBILE NAV ---- */
const toggle   = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  nav.classList.toggle('menu-open', open);
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    nav.classList.remove('menu-open');
  });
});

/* ---- TYPING EFFECT ---- */
const roles  = ['Web Developer', 'IT Student in Osaka, Japan', 'Bilingual EN / 日本語', 'Photographer'];
let ri = 0, ci = 0, del = false;
const roleEl = document.getElementById('roleText');

function type() {
  const cur = roles[ri];
  roleEl.textContent = del ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
  del ? ci-- : ci++;

  let wait = del ? 50 : 90;
  if (!del && ci === cur.length)  { wait = 2500; del = true; }
  else if (del && ci === 0)        { del = false; ri = (ri + 1) % roles.length; wait = 350; }
  setTimeout(type, wait);
}
/* Called from animations.js after hero entrance */
window._startTyping = type;

/* ---- STAR CANVAS (Space Game card) ---- */
(function initStars() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], raf;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      s: Math.random() * 0.28 + 0.04,
      a: Math.random() * 0.55 + 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
      s.x -= s.s;
      if (s.x < 0) { s.x = canvas.width; s.y = Math.random() * canvas.height; }
    });
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) draw(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0.1 }).observe(canvas);
})();

/* ---- CONTACT FORM (Formspree AJAX) ---- */
const form    = document.getElementById('contactForm');
const submitB = document.getElementById('submitBtn');
const status  = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitB.textContent = 'Sending…';
    submitB.disabled    = true;
    status.textContent  = '';
    status.className    = 'form-status';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        status.textContent = "Sent! I'll get back to you soon.";
        status.className   = 'form-status ok';
        form.reset();
      } else throw new Error();
    } catch {
      status.textContent = 'Something went wrong. Email me directly: prashant.captures.photo@gmail.com';
      status.className   = 'form-status err';
    } finally {
      submitB.textContent = 'Send Message';
      submitB.disabled    = false;
    }
  });
}
