/* animations.js — Lenis + GSAP ScrollTrigger */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- LENIS ---- */
  const lenis = new Lenis({
    duration: 0.8,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    wheelMultiplier: 1.2,
    touchMultiplier: 2,
    infinite: false,
  });
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  /* ---- REGISTER ---- */
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---- HERO ENTRANCE — cinematic depth sequence ---- */
  gsap.timeline({ delay: 0.1 })
    /* 1. Big background name: yPercent:-50 centers it (top:50% + yPercent:-50 = true vertical center) */
    .fromTo('.hero-name-bg',
      { opacity: 0, yPercent: -40 },
      { opacity: 0.95, yPercent: -50, duration: 1.0, ease: 'power4.out' }, 0.5)
    /* 2. Portrait slides up from bottom */
    .fromTo('.hero-portrait',
      { opacity: 0, y: 60 },
      { opacity: 1,  y: 0, duration: 1.1, ease: 'power4.out' }, 0.7)
    /* 3. Eyebrow fades in */
    .fromTo('.hero-eyebrow',
      { opacity: 0 },
      { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.9)
    /* 4. SUBEDI slides in */
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' }, 1.0)
    /* 5. Typed line and social links */
    .fromTo('.hero-tagline-wrap',
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.2)
    .fromTo('.hero-social',
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.25)
    .fromTo('.hero-scroll-hint',
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power1.out' }, 1.4)
    .call(() => { if (window._startTyping) window._startTyping(); }, null, 1.0);

  /* ---- EYEBROWS ---- */
  gsap.utils.toArray('.eyebrow').forEach(el => {
    gsap.fromTo(el, { opacity: 0, x: -14 }, {
      opacity: 1, x: 0, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  /* ---- SECTION HEADINGS (SplitText line reveal) ---- */
  gsap.utils.toArray('.section-heading').forEach(el => {
    try {
      const split = new SplitText(el, { type: 'lines', linesClass: 'st-ln' });
      split.lines.forEach(ln => {
        const wrap = document.createElement('div');
        wrap.style.overflow = 'hidden';
        ln.parentNode.insertBefore(wrap, ln);
        wrap.appendChild(ln);
      });
      gsap.fromTo(split.lines,
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0, opacity: 1, duration: 0.88, ease: 'power3.out', stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none none' },
          onComplete: () => split.revert(),
        }
      );
    } catch { /* SplitText unavailable — silent fallback */ }
  });

  /* ---- ABOUT TEXT ---- */
  gsap.fromTo('.about-text p', { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.68, ease: 'power2.out', stagger: 0.1,
    scrollTrigger: { trigger: '.about-text', start: 'top 80%', toggleActions: 'play none none none' },
  });
  gsap.fromTo('.lang-row', { opacity: 0, y: 14 }, {
    opacity: 1, y: 0, duration: 0.55,
    scrollTrigger: { trigger: '.lang-row', start: 'top 88%', toggleActions: 'play none none none' },
  });
  gsap.fromTo('.text-link', { opacity: 0 }, {
    opacity: 1, duration: 0.5,
    scrollTrigger: { trigger: '.text-link', start: 'top 90%', toggleActions: 'play none none none' },
  });
  gsap.fromTo('.stat-card', { opacity: 0, x: 22 }, {
    opacity: 1, x: 0, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger: '.stat-card', start: 'top 82%', toggleActions: 'play none none none' },
  });

  /* ---- PROJECT CARDS ---- */
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 44 }, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.07,
      scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  /* ---- EARLY CARDS ---- */
  gsap.fromTo('.early-card', { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
    scrollTrigger: { trigger: '.early-grid', start: 'top 88%', toggleActions: 'play none none none' },
  });

  /* ---- SKILL ITEMS ---- */
  gsap.utils.toArray('.skill-item').forEach((item, i) => {
    gsap.to(item, {
      opacity: 1, scale: 1, duration: 0.48, ease: 'back.out(1.5)', delay: i * 0.052,
      scrollTrigger: { trigger: '.skills-grid', start: 'top 82%', toggleActions: 'play none none none' },
    });
  });

  /* ---- CONTACT ---- */
  gsap.fromTo('.contact-info', { opacity: 0, x: -26 }, {
    opacity: 1, x: 0, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact', start: 'top 80%', toggleActions: 'play none none none' },
  });
  gsap.fromTo('.contact-form', { opacity: 0, x: 26 }, {
    opacity: 1, x: 0, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact', start: 'top 80%', toggleActions: 'play none none none' },
  });
  gsap.fromTo('.clink', { opacity: 0, x: -14 }, {
    opacity: 1, x: 0, duration: 0.45, ease: 'power2.out', stagger: 0.08,
    scrollTrigger: { trigger: '.contact-links', start: 'top 86%', toggleActions: 'play none none none' },
  });

});
