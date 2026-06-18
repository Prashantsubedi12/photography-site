/* ============================================
   PRASHANT CAPTURES — form.js
   Web3Forms async submission for contact form
   ============================================ */

(function () {
  const form      = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('[type="submit"]');
  const statusEl  = form.querySelector('.form-status');
  const successEl = document.getElementById('contactSuccess');
  const resetBtn  = successEl ? successEl.querySelector('.contact-success-reset') : null;

  const LABELS = {
    loading: { en: 'Sending…',    jp: '送信中…' },
    btnEN:   'Send Message',
    btnJP:   '送信する',
    error: {
      en: 'Something went wrong. Please try again or email me directly.',
      jp: 'エラーが発生しました。もう一度お試しいただくか、直接メールをお送りください。',
    },
  };

  function getLang() {
    return localStorage.getItem('lang') || 'en';
  }

  /* ---- Submit handler ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lang = getLang();

    // Loading state
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = LABELS.loading[lang];
    }
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className   = 'form-status';
    }

    // Build JSON payload from all named fields (includes hidden access_key + subject)
    const payload = Object.fromEntries(new FormData(form));

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        // Swap form for success panel
        form.hidden = true;
        if (successEl) {
          successEl.hidden = false;
          // Sync success panel text to current language
          if (typeof applyLanguage === 'function') applyLanguage(lang);
        }
      } else {
        throw new Error(json.message || 'Submission failed');
      }

    } catch {
      if (statusEl) {
        statusEl.textContent = LABELS.error[lang];
        statusEl.className   = 'form-status error';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = lang === 'en' ? LABELS.btnEN : LABELS.btnJP;
      }
    }
  });

  /* ---- Reset — let user send another message ---- */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      if (successEl) successEl.hidden = true;
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.className   = 'form-status';
      }
      // Re-sync bilingual placeholders after form.reset() clears them
      const lang = getLang();
      if (typeof applyLanguage === 'function') applyLanguage(lang);
    });
  }
}());
