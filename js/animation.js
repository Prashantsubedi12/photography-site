/* ============================================
   PRASHANT CAPTURES — animations.js
   GSAP + ScrollTrigger + SplitText + Lenis
   ============================================ */

// Respect users who prefer reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced && window.gsap) {

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* ---------- HERO INTRO (on load) ---------- */
  window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');

    const introTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    if (heroTitle) {
      const heroSplit = new SplitText(heroTitle, { type: 'chars, words' });
      introTl.from(heroSplit.chars, {
        yPercent: 120,
        opacity: 0,
        rotateZ: 6,
        stagger: 0.03,
        duration: 1,
      });
    }

    introTl.from('.hero-eyebrow', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
           .from('.hero-tagline', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
           .from('.hero-cta', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6');
  });

  /* ---------- LINE-BY-LINE TEXT REVEAL ON SCROLL ---------- */
  // Targets headings + paragraphs across the site
  const textTargets = document.querySelectorAll(
    '.section-title, .section-subtitle, .about-text p, ' +
    '.about-snippet-text h2, .about-snippet-text p, ' +
    '.about-name, .about-eyebrow, .page-hero h1, .page-hero p, ' +
    '.shoot-card h3, .shoot-card p, .service-card h3, .service-card p'
  );

  textTargets.forEach((el) => {
    const split = new SplitText(el, { type: 'lines' });
    // Wrap each line in a mask so it reveals from below
    gsap.set(split.lines, { overflow: 'hidden' });

    gsap.from(split.lines, {
      yPercent: 110,
      opacity: 0,
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* ---------- ELEMENT RISE + DEPTH REVEAL ---------- */
  const riseTargets = document.querySelectorAll(
    '.featured-item, .service-card, .shoot-card, .gear-item, ' +
    '.gallery-item, .divider, .package-card, .blog-card, ' +
    '.preset-card, .contact-info, .contact-form-wrap, .about-img-badge'
  );

  riseTargets.forEach((el) => {
    gsap.from(el, {
      y: 60,
      opacity: 0,
      scale: 0.96,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* ---------- IMAGE CLIP REVEAL ---------- */
  const imgReveals = document.querySelectorAll('.about-img-wrap img, .about-snippet-img img');

  imgReveals.forEach((img) => {
    gsap.fromTo(img,
      { clipPath: 'inset(100% 0 0 0)', scale: 1.15 },
      {
        clipPath: 'inset(0% 0 0 0)',
        scale: 1,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: img,
          start: 'top 85%',
        },
      }
    );
  });

  /* ---------- HERO PARALLAX ON SCROLL ---------- */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* ---------- REFRESH after everything loads ---------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
}