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

  /* ---- HERO ENTRANCE — editorial split sequence ---- */
  /* Set initial hidden states immediately so nothing flashes before timeline starts */
  gsap.set('.hero-eyebrow',    { y: 20, opacity: 0 });
  gsap.set('.hero-name-line1', { y: 40, opacity: 0 });
  gsap.set('.hero-name-line2', { y: 40, opacity: 0 });
  gsap.set('.hero-role',       { opacity: 0 });
  gsap.set('.hero-tagline',    { opacity: 0 });
  gsap.set('.hero-ctas',       { y: 20, opacity: 0 });
  gsap.set('.hero-social',     { opacity: 0 });

  /* Photo fades in, clearProps removes all inline styles GSAP applies */
  gsap.from('.hero-photo', {
    opacity: 0,
    duration: 0.6,
    delay: 0.2,
    ease: 'power2.out',
    clearProps: 'all',
  });

  gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } })
    /* 1. Eyebrow fades up */
    .to('.hero-eyebrow',    { y: 0, opacity: 1 },        0.3)
    /* 2. PRASHANT slides up */
    .to('.hero-name-line1', { y: 0, opacity: 1 },        0.5)
    /* 3. SUBEDI slides up */
    .to('.hero-name-line2', { y: 0, opacity: 1 },        0.65)
    /* 4. Role / typed text fades in */
    .to('.hero-role',       { opacity: 1 },              0.8)
    /* 5. Tagline fades in */
    .to('.hero-tagline',    { opacity: 1 },              0.9)
    /* 6. CTAs slide up */
    .to('.hero-ctas',       { y: 0, opacity: 1 },        1.0)
    /* 7. Social links fade in */
    .to('.hero-social',     { opacity: 1 },              1.1)
    /* Start typing after role element is visible */
    .call(() => { if (window._startTyping) window._startTyping(); }, null, 0.8);

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
